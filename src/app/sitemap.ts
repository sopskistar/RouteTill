import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{return ['','/demo','/docs','/privacy'].map(path=>({url:(process.env.APP_ORIGIN||'http://localhost:3000')+path}));}
