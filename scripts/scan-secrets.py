"""Scan reviewable source without printing suspected secret values."""
from pathlib import Path
import re,sys,subprocess,os
root=Path(__file__).resolve().parents[1]
names=subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root,capture_output=True,check=True).stdout.decode().split('\0')
secrets=[]
env=root/'.env.local'
if env.exists():
 for line in env.read_text().splitlines():
  if '=' in line and not line.lstrip().startswith('#'):
   value=line.split('=',1)[1].strip().strip('\"\'')
   if len(value)>20: secrets.append(value)
patterns=[('private key',re.compile(r'-----BEGIN (?:EC |RSA |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/]{30}')),('JWT',re.compile(r'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}')),('database credential',re.compile(r'postgres(?:ql)?://[^\s/:]+:[^\s@]{8,}@')),('scoped bearer token',re.compile(r'rt_(?:live|demo)_[A-Za-z0-9_-]{43}'))]
findings=[];count=0
for name in names:
 if not name: continue
 p=root/name
 if not p.is_file() or p.stat().st_size>3_000_000 or p.suffix.lower() in ['.png','.jpg','.mp4','.webm','.zip','.woff2']:continue
 try: s=p.read_text()
 except UnicodeDecodeError:continue
 count+=1
 for label,pattern in patterns:
  if pattern.search(s):findings.append((name,label))
 if any(secret in s for secret in secrets):findings.append((name,'configured secret value'))
for name,label in findings:print(f'FAIL: {name}: {label} (value withheld)')
print(f'Secret scan: {count} source files, {len(findings)} findings. Ignored local runtime data is excluded.')
sys.exit(bool(findings))
