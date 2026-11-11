'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="container page narrow" role="alert"><h1>We couldn’t load this view.</h1><p>Your purchase is not marked successful by this error. Retry to retrieve its recorded state.</p><button className="button" onClick={reset}>Try again</button></div>;}
