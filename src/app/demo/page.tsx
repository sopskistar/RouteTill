import type {Metadata} from 'next';
import {GuidedDemo} from '@/components/guided-demo';
export const metadata:Metadata={title:'Meet John — guided product demo',description:'Watch an agent-assisted purchase from product discovery to human approval, verified payment and digital delivery. A no-funds reenactment with separate genuine mainnet evidence.'};
export default function DemoPage(){return <div className="container page guided-page"><GuidedDemo/></div>;}
