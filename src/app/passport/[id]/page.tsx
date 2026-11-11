import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Passport} from '@/components/passport';
export const metadata:Metadata={title:'Purchase Passport',description:'Inspect approved purchase terms, settlement evidence, digital entitlement and artifact integrity.'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <div className="container page passport-page"><Suspense fallback={<p>Loading Passport…</p>}><Passport id={(await params).id}/></Suspense></div>;}
