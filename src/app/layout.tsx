import type {Metadata} from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
import {Header,Footer} from '@/components/shell';
export const metadata:Metadata={metadataBase:new URL(process.env.APP_ORIGIN||'http://localhost:3000'),title:{default:'RouteTill — From approved purchase to proven delivery',template:'%s | RouteTill'},description:'A verifiable purchase lifecycle: human authorization, NEAR Intents settlement, exactly-once digital entitlement, and an independently checkable Purchase Passport.',openGraph:{title:'RouteTill',description:'From approved purchase to proven delivery.',type:'website'},twitter:{card:'summary_large_image'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>;}
