import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Checkout} from '@/components/checkout';
export const metadata:Metadata={title:'Hosted checkout',description:'Review the merchant, product, payment route and expected digital delivery before authorization.'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <div className="container page"><Suspense fallback={<p>Loading checkout…</p>}><Checkout id={(await params).id}/></Suspense></div>;}
