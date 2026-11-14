import type {Metadata} from 'next';
import {GuidedDemo} from '@/components/guided-demo';
export const metadata:Metadata={title:'Meet John — guided product demo',description:'The agent proposes. You authorize. RouteTill verifies payment and delivery. An illustrative no-funds walkthrough with separate historical mainnet evidence.'};
export default function DemoPage(){return <div className="container page guided-page"><GuidedDemo/></div>;}
