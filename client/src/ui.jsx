import {Link} from 'react-router-dom';
export const Logo=({to='/'})=><Link to={to} className="flex shrink-0 items-center gap-2 whitespace-nowrap font-serif text-xl font-semibold text-ink"><span className="text-2xl">🌿</span>ArtNova AI</Link>;
export const CATS=['Jewellery','Pottery','Home Decor','Accessories','Clothing','Art','Other'];
export const Card=({p,children})=><div className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
 <div className="aspect-square overflow-hidden bg-stone-100"><img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/></div>
 <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4"><h3 className="font-semibold leading-tight">{p.name}</h3>
 <p className="font-bold text-brand">₹{p.price}</p>{p.category&&<p className="text-xs text-stone-500">{p.category}</p>}
 {p.description&&<p className="mt-1 text-sm text-stone-600 line-clamp-3">{p.description}</p>}{children}</div></div>;
export const Err=({e})=>e?<p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{e}</p>:null;
