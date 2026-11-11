import type {Metadata} from 'next';
import {Lab} from '@/components/lab';
export const metadata:Metadata={title:'Break-It Lab',description:'Attack the real purchase policy and PostgreSQL fulfillment logic in an isolated, no-funds judge challenge.'};
export default function Page(){return <div className="container page"><Lab/></div>;}
