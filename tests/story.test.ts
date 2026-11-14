import {describe,it,expect} from 'vitest';
import {johnStory} from '../src/core/john-story';
import narration from '../video/narration-script.json';
import timeline from '../video/timeline.json';
describe('approved John story',()=>{it('keeps the homepage and first five narrated scenes identical',()=>{expect(narration.slice(0,5).map(({name,title,body})=>({name,title,body}))).toEqual(johnStory);expect(timeline.scenes.slice(0,5).map(({name,title,body})=>({name,title,body}))).toEqual(johnStory);expect(johnStory.map(s=>s.name)).toEqual(['Agent finds it','No blank check','John says yes','Payment verified','File + proof']);});});
