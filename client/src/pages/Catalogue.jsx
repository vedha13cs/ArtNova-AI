import {useState} from 'react';

const link=u=>location.origin+'/c/'+u.slug;

export function Catalogue({me}){
 const url=link(me.user),[ok,setOk]=useState(false);
 const copy=async()=>{try{await navigator.clipboard.writeText(url);setOk(true);setTimeout(()=>setOk(false),2000)}catch{setOk(false)}};
 return <div className="space-y-6"><div><p className="eyebrow mb-2">Your storefront</p><h1 className="font-serif text-3xl font-semibold sm:text-4xl">My Catalogue</h1><p className="mt-2 text-sm text-stone-500">One lovely link to share everything you make.</p></div>
  <div className="card overflow-hidden"><div className="bg-gradient-to-r from-brand to-[#397565] p-6 text-white sm:p-9"><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/70">Your public shop link</p><h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">Ready to share with the world?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/80">Send this link on WhatsApp, Instagram, or anywhere your customers find you. Your active products stay up to date automatically.</p></div>
   <div className="space-y-5 p-5 sm:p-8">
   <div className="break-all rounded-xl border border-stone-200 bg-[#f8f8f4] p-4 font-medium text-brand">{url}</div>
   <div className="flex flex-wrap gap-2"><button className="btn-p" onClick={copy}>{ok?'Copied ✓':'Copy catalogue link'}</button><a className="btn-o" href={url} target="_blank" rel="noreferrer">Preview catalogue ↗</a>
   <a className="btn-o" target="_blank" rel="noreferrer" href={'https://wa.me/?text='+encodeURIComponent('Check out my handmade catalogue: '+url)}>Share on WhatsApp</a></div>
   {!me.user.phone&&<p className="rounded-xl bg-clay-soft p-4 text-sm text-clay">Add a WhatsApp number to your shop account so customers can order directly.</p>}</div></div></div>;
}
