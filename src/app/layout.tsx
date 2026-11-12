import type {Metadata} from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
import {Header,Footer} from '@/components/shell';
import {WalletProvider} from '@/components/wallet-provider';
import {publicRuntime} from '@/core/deployment';
export const metadata:Metadata={metadataBase:new URL(process.env.APP_ORIGIN||'http://localhost:3000'),title:{default:'RouteTill — From approved purchase to proven delivery',template:'%s | RouteTill'},description:'A verifiable purchase lifecycle: human authorization, NEAR Intents settlement, exactly-once digital entitlement, and an independently checkable Purchase Passport.',openGraph:{title:'RouteTill',description:'From approved purchase to proven delivery.',type:'website'},twitter:{card:'summary_large_image'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><WalletProvider runtime={publicRuntime()}><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></WalletProvider></body></html>;}
