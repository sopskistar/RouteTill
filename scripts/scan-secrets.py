"""Scan source, optional Git history and public bundles. Never print suspected values."""
from pathlib import Path
import re,sys,subprocess
root=Path(__file__).resolve().parents[1]
secret_names={'NEAR_INTENTS_JWT','DATABASE_URL','DEMO_DATABASE_URL','PASSPORT_PRIVATE_KEY','DEMO_PASSPORT_PRIVATE_KEY','JUDGE_ACCESS_CODE','CRON_SECRET','RECONCILE_WEBHOOK_SECRET','ROUTETILL_AGENT_TOKEN'}
secrets=[]
for env in root.glob('.env*.local'):
 for line in env.read_text().splitlines():
  if '=' not in line or line.lstrip().startswith('#'):continue
  key,value=line.split('=',1);value=value.strip().strip('\"\'')
  if key in secret_names and len(value)>20:secrets.extend([value,value.replace('\\n','\n')])
patterns=[('private key',re.compile(r'-----BEGIN (?:EC |RSA |OPENSSH )?PRIVATE KEY-----[\s+\\n]+[A-Za-z0-9+/]{30}')),('JWT',re.compile(r'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}')),('database credential',re.compile(r'postgres(?:ql)?://[^\s/:]+:[^\s@]{8,}@')),('scoped bearer token',re.compile(r'rt_(?:live|demo)_[A-Za-z0-9_-]{43}'))]
findings=[];count=0

def scan(label,s):
 global count
 count+=1
 for kind,pattern in patterns:
  if pattern.search(s):findings.append((label,kind))
 if any(secret in s for secret in secrets):findings.append((label,'configured secret value'))

names=subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root,capture_output=True,check=True).stdout.decode().split('\0')
for name in names:
 if not name:continue
 p=root/name
 if not p.is_file() or p.stat().st_size>3_000_000 or p.suffix.lower() in ['.png','.jpg','.mp4','.webm','.zip','.woff2']:continue
 try:scan(name,p.read_text())
 except UnicodeDecodeError:continue
if '--history' in sys.argv:
 history=subprocess.run(['git','log','--all','-p','--no-ext-diff','--format=commit %H'],cwd=root,capture_output=True,check=True).stdout.decode(errors='replace')
 scan('Git history (all local refs)',history)
if '--bundle' in sys.argv:
 bundle=root/'.next/static'
 if not bundle.exists():raise SystemExit('FAIL: build the application before scanning public bundles.')
 for p in bundle.rglob('*'):
  if p.is_file() and p.suffix in ['.js','.json','.css','.map']:scan(str(p.relative_to(root)),p.read_text(errors='replace'))
for name,kind in findings:print(f'FAIL: {name}: {kind} (value withheld)')
print(f'Secret scan: {count} inputs, {len(findings)} findings. Private runtime data is excluded; configured secret values are compared without printing them.')
sys.exit(bool(findings))
