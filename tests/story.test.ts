import {describe,it,expect} from 'vitest';
import {johnStory} from '../src/core/john-story';
import narration from '../video/narration-script.json';
import timeline from '../video/timeline.json';
// Archived video wording is preserved; stable scene identities still support the handoff.
const identity=({name,title}:{name:string;title:string})=>({name,title});
describe('shared John scene navigation',()=>{it('keeps the five scene identities compatible with existing presentation assets',()=>{
 const scenes=johnStory.map(identity);
 expect(narration.slice(0,5).map(identity)).toEqual(scenes);
 expect(timeline.scenes.slice(0,5).map(identity)).toEqual(scenes);
 expect(johnStory.map(s=>s.name)).toEqual(['Agent finds it','No blank check','John says yes','Payment verified','File + proof']);
});});
