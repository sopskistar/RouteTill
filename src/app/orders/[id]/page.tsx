import type {Metadata} from 'next';
import {OrderView} from '@/components/order';
export const metadata:Metadata={title:'Purchase approval & progress',description:'Authorize exact purchase terms, inspect the quote, and follow settlement verification and delivery.'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <div className="container page"><OrderView id={(await params).id}/></div>;}
