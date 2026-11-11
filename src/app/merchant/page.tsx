import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Merchant} from '@/components/merchant';
export const metadata:Metadata={title:'Merchant workspace',description:'Create digital products, confirm your settlement wallet, and inspect purchase evidence.'};
export default function Page(){return <div className="container page"><Suspense fallback={<p>Loading workspace…</p>}><Merchant/></Suspense></div>;}
