'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

/** Content stays visible; animation never changes server-rendered attributes. */
export function ProofMotion(){
 const pathname=usePathname();
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches||!('IntersectionObserver' in window))return;
  const animations=new Set<Animation>();
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){
    observer.unobserve(entry.target);
    const animation=entry.target.animate([{opacity:.72,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.65,.3,1)'});
    animations.add(animation);animation.onfinish=()=>animations.delete(animation);
   }
  },{threshold:.12});
  document.querySelectorAll('[data-proof-reveal]').forEach(element=>observer.observe(element));
  const stop=()=>{if(preference.matches){observer.disconnect();for(const animation of animations)animation.cancel();animations.clear();}};
  preference.addEventListener('change',stop);
  return()=>{observer.disconnect();for(const animation of animations)animation.cancel();preference.removeEventListener('change',stop);};
 },[pathname]);
 return null;
}
