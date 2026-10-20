import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {api} from '../api';
import {Card} from '../ui';

export function Public(){
 const{slug}=useParams(),[d,setD]=useState(null),[e,setE]=useState(''),[cat,setCat]=useState('All');
 useEffect(()=>{api('/public/'+slug).then(setD).catch(x=>setE(x.message));},[slug]);
 if(e)return <div className="grid min-h-screen place-items-center p-4 text-center"><div><p className="text-5xl">🌿</p><p className="mt-3 font-semibold">{e}</p><Link to="/" className="btn-p mt-4">Go to ArtNova AI</Link></div></div>;
 if(!d)return <div className="grid min-h-screen place-items-center text-brand">Loading…</div>;
 const cats=['All',...new Set(d.products.map(p=>p.category).filter(Boolean))],list=d.products.filter(p=>cat==='All'||p.category===cat);
 const order=p=>{api('/public/click/'+p._id,{method:'POST'}).catch(()=>{});window.open(`https://wa.me/${d.shop.phone}?text=${encodeURIComponent(`Hi! I'm interested in "${p.name}" (₹${p.price}) from ${d.shop.name}.`)}`,'_blank');};
 const share=()=>navigator.share?navigator.share({title:d.shop.name,url:location.href}):navigator.clipboard.writeText(location.href).then(()=>alert('Link copied!'));
 return <div className="min-h-screen bg-[#f8f5ee]"><header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><Link to="/" className="font-serif text-lg font-semibold text-ink">🌿 ArtNova AI</Link><button onClick={share} className="btn-o !px-4 !py-2 text-sm">Share catalogue ↗</button></header>
  <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6"><div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#e6eee7] to-[#f4e5d8] px-5 py-10 text-center sm:py-14">
  <span className="eyebrow">Handmade with love</span><h1 className="mt-3 font-serif text-3xl font-semibold sm:text-5xl">{d.shop.name}</h1><p className="mt-2 text-stone-600">Thoughtful pieces by {d.shop.owner}</p>
  </div></div>
  <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6"><div className="mb-5 flex gap-2 overflow-x-auto pb-1">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={'shrink-0 rounded-full px-4 py-2 text-sm transition '+(cat===c?'bg-brand text-white':'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-brand-soft')}>{c}</button>)}</div>
   {!list.length?<p className="card py-16 text-center text-stone-500">No products here yet.</p>:<div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
    {list.map(p=><Card key={p._id} p={p}>{d.shop.phone&&<button onClick={()=>order(p)} className="btn-p mt-auto !py-2 text-sm">Order on WhatsApp</button>}</Card>)}</div>}</div>
  <footer className="border-t border-stone-200 py-7 text-center text-sm text-stone-500">Made with care by <Link to="/" className="font-medium text-brand underline">ArtNova AI</Link></footer></div>;
}
