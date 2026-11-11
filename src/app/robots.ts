import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:['/','/docs','/privacy'],disallow:['/api/','/merchant','/orders/','/lab','/entitlements/']},sitemap:(process.env.APP_ORIGIN||'http://localhost:3000')+'/sitemap.xml'};}
