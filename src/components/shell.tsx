'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {Moon,Sun,Menu,X} from 'lucide-react';
import {Brand} from './ui';
import {useRuntime} from './wallet-provider';
export function Header(){const runtime=useRuntime();const labHref=runtime.mode==='live'?(runtime.demoUrl?runtime.demoUrl+'/lab':'/docs#judge-demo'):'/lab';const path=usePathname();const [dark,setDark]=useState(false);const [open,setOpen]=useState(false);
useEffect(()=>{const value=localStorage.getItem('routetill-theme')==='dark';setDark(value);document.documentElement.dataset.theme=value?'dark':'light';},[]);
function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';localStorage.setItem('routetill-theme',next?'dark':'light');}
return <header className="site-header"><div className="header-inner"><Brand/><nav className={open?'main-nav nav-open':'main-nav'} aria-label="Main navigation">{[['/merchant','Merchant workspace'],[labHref,'Break-It Lab'],['/docs','Developers']].map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</nav><div className="header-actions"><button className="icon-button" aria-label={dark?'Switch to light mode':'Switch to dark mode'} onClick={toggle}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button><Link href={runtime.mode==='live'?'/merchant':'/checkout/purchase-vectors'} className="button button-small">{runtime.mode==='live'?'Open workspace':'Try a purchase'}</Link><button className="icon-button mobile-menu" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></div></header>;}
export function Footer(){return <footer className="site-footer"><div className="container footer-inner"><Brand/><p>From approved purchase to proven delivery.</p><nav aria-label="Footer"><Link href="/docs">API & verification</Link><Link href="/privacy">Privacy</Link><a href="https://github.com/sopskistar/RouteTill" target="_blank" rel="noreferrer">Source</a></nav></div></footer>;}
