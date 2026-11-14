import {positioning} from '@/core/positioning';
import type {Metadata} from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
import {Header,Footer} from '@/components/shell';
import {WalletProvider} from '@/components/wallet-provider';
import {publicRuntime} from '@/core/deployment';
import {ProofMotion} from '@/components/proof-motion';
export const metadata:Metadata={metadataBase:new URL(process.env.APP_ORIGIN||'http://localhost:3000'),title:{default:'RouteTill — Agent-assisted cross-chain checkout',template:'%s | RouteTill'},description:positioning.definition+' '+positioning.promise,openGraph:{title:'RouteTill',description:positioning.definition,type:'website'},twitter:{card:'summary_large_image'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><WalletProvider runtime={publicRuntime()}><a className="skip-link" href="#main">Skip to content</a><Header/><ProofMotion/><main id="main">{children}</main><Footer/></WalletProvider></body></html>;}
