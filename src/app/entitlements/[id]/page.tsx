import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Entitlement} from '@/components/entitlement';
export const metadata:Metadata={title:'Digital entitlement',description:'Download and verify the exact digital artifact associated with your approved purchase.'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <div className="container page"><Suspense fallback={<p>Loading entitlement…</p>}><Entitlement id={(await params).id}/></Suspense></div>;}
