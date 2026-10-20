import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../api';
import {Card} from '../ui';

export function Products(){
 const[ps,setPs]=useState(null);
 useEffect(()=>{api('/products').then(setPs).catch(()=>setPs([]))},[]);
 const tog=async p=>{const n=await api('/products/'+p._id,{method:'PATCH',body:{active:!p.active}});setPs(ps.map(x=>x._id===p._id?n:x));};
 const del=async p=>{if(!confirm('Delete "'+p.name+'"?'))return;await api('/products/'+p._id,{method:'DELETE'});setPs(ps.filter(x=>x._id!==p._id));};
 return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">Your handmade collection</p><h1 className="font-serif text-3xl font-semibold sm:text-4xl">My Products</h1><p className="mt-2 text-sm text-stone-500">Manage the pieces in your customer catalogue.</p></div><Link to="/app/add" className="btn-p !py-2.5">＋ &nbsp;Add product</Link></div>
  {!ps?<p className="card p-8 text-center text-stone-500">Loading your products…</p>:!ps.length?<div className="card p-10 text-center text-stone-600"><p className="font-serif text-xl font-semibold text-ink">Your collection is ready to grow</p><p className="mt-2 text-sm">Add your first handmade product to get started.</p><Link to="/app/add" className="btn-p mt-5">Add a product</Link></div>:
  <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{ps.map(p=><Card key={p._id} p={{...p,description:''}}>
   <span className={'w-fit rounded-full px-2 py-0.5 text-xs '+(p.active?'bg-brand-soft text-brand':'bg-stone-100 text-stone-500')}>{p.active?'Active':'Hidden'}</span>
   <div className="mt-2 flex gap-2"><button onClick={()=>tog(p)} className="btn-o flex-1 !px-2 !py-1.5 text-xs">{p.active?'Hide':'Show'}</button><button onClick={()=>del(p)} className="flex-1 rounded-xl border border-red-200 text-xs text-red-600 hover:bg-red-50">Delete</button></div></Card>)}</div>}</div>;
}
