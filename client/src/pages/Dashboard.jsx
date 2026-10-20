import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../api';
import {Card} from '../ui';

export function Dashboard({me}){
 const[ps,setPs]=useState(null);
 useEffect(()=>{api('/products').then(setPs).catch(()=>setPs([]))},[]);
 const S=[['▦','Total Products',me.stats.products,'bg-[#e8f1eb]'],['◉','Total Views',me.stats.views,'bg-[#f7eee2]'],['↗','Catalogue Link Clicks',me.stats.clicks,'bg-[#eeeaf4]']];
 return <div className="space-y-8">
  <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">Your shop at a glance</p><h1 className="font-serif text-3xl font-semibold sm:text-4xl">Good morning, {me.user.name.split(' ')[0]} <span className="text-clay">✦</span></h1><p className="mt-2 text-sm text-stone-500">Here’s what’s happening with your store today.</p></div><Link to="/app/add" className="btn-p !py-2.5">＋ &nbsp;Add product</Link></div>
  <div className="grid gap-4 sm:grid-cols-3">{S.map(([i,t,v,bg])=><div key={t} className="card flex items-center gap-4 p-5 sm:p-6"><span className={'grid h-12 w-12 place-items-center rounded-2xl text-xl text-brand '+bg}>{i}</span><div><p className="text-xs font-medium text-stone-500">{t}</p><p className="mt-1 text-2xl font-semibold">{v}</p></div></div>)}</div>
  <section><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow mb-1">Your craft, on display</p><h2 className="font-serif text-2xl font-semibold">Recent products</h2></div><Link to="/app/products" className="text-sm font-semibold text-brand hover:underline">View all →</Link></div>
  {!ps?<div className="card p-8 text-center text-sm text-stone-500">Loading your products…</div>:!ps.length?<div className="card flex flex-col items-center p-10 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-3xl text-brand">✦</span><h3 className="mt-4 font-serif text-xl font-semibold">Your first creation belongs here</h3><p className="mt-2 max-w-sm text-sm text-stone-500">Add a product to start building your online catalogue and sharing your work.</p><Link to="/app/add" className="btn-p mt-5">Add your first product</Link></div>:
  <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{ps.slice(0,4).map(p=><Card key={p._id} p={{...p,description:''}}/>)}</div>}</section>
 </div>;
}
