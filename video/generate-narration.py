"""Generate licensed offline narration and sentence-aligned captions; no hosted service or voice clone."""
import json,pathlib,re,subprocess,wave
root=pathlib.Path(__file__).resolve().parent.parent
python=root/'artifacts/final-package/voice-env/bin/python';model=root/'artifacts/final-package/voice-model/en_US-ljspeech-high.onnx'
script=json.loads((root/'video/narration-script.json').read_text());approved=json.loads((root/'video/story.json').read_text())
assert [{k:s[k] for k in ['name','title','body']} for s in script[:5]]==approved,'Homepage and video story must remain identical.'
output=root/'video/public/narration-v2';output.mkdir(exist_ok=True)
scenes=[];global_time=0
for i,scene in enumerate(script):
 sentences=re.split(r'(?<=[.!?])\s+(?=[A-Z])',scene.get('voiceover',scene['body']));captions=[];files=[];elapsed=.45
 for j,sentence in enumerate(sentences):
  text=sentence.replace('$10.11','ten dollars and eleven cents').replace('$10','ten dollars').replace('11 USDC','eleven U S D C').replace('NEAR Intents','Near Intents').replace('USDC','U S D C')
  txt=output/f'{i+1:02d}-{j+1:02d}.txt';wav=output/f'{i+1:02d}-{j+1:02d}.wav';txt.write_text(text)
  subprocess.run([str(python),'-m','piper','-m',str(model),'-i',str(txt),'-f',str(wav),'--length-scale','0.94','--sentence-silence','0.15'],check=True,stdout=subprocess.DEVNULL)
  with wave.open(str(wav)) as f:duration=f.getnframes()/f.getframerate()
  captions.append({'text':sentence,'start':elapsed,'end':elapsed+duration,'startMs':round(elapsed*1000),'endMs':round((elapsed+duration)*1000),'timestampMs':None,'confidence':None});elapsed+=duration;files.append(wav)
 # Fixed short head/tail silence makes narration entrances deliberate.
 merged=output/f'scene-{i+1:02d}.wav'
 with wave.open(str(files[0])) as first:params=first.getparams()
 with wave.open(str(merged),'wb') as target:
  target.setparams(params);target.writeframes(b'\0'*(int(.45*params.framerate)*params.sampwidth*params.nchannels))
  for wav in files:
   with wave.open(str(wav)) as source:target.writeframes(source.readframes(source.getnframes()))
  target.writeframes(b'\0'*(int(.65*params.framerate)*params.sampwidth*params.nchannels))
 duration=max(round(elapsed+.65,3),[11,8,20,22,18,11,7][i]);scenes.append({**scene,'start':round(global_time,3),'duration':duration,'audio':f'narration-v2/scene-{i+1:02d}.wav','captions':captions});global_time+=duration
(root/'video/timeline.json').write_text(json.dumps({'duration':global_time,'fps':30,'scenes':scenes},indent=2))
def stamp(n):
 ms=round(n*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
blocks=[]
for scene in scenes:
 for caption in scene['captions']:blocks.append(f'{len(blocks)+1}\n{stamp(scene["start"]+caption["start"])} --> {stamp(scene["start"]+caption["end"])}\n{caption["text"]}\n')
(root/'video/captions-narrated.srt').write_text('\n'.join(blocks));print(json.dumps({'seconds':global_time,'scenes':[s['duration'] for s in scenes]}))
