import {NavLink,Outlet} from 'react-router-dom';
import {Logo} from './ui';

const N=[['/app','Dashboard','⌂',true],['/app/add','Add Product','＋'],['/app/products','My Products','▦'],['/app/catalogue','Catalogue','↗']];
const L=({to,end,children,c})=><NavLink to={to} end={end} className={({isActive})=>c+(isActive?' bg-brand-soft text-brand font-semibold':' text-stone-500 hover:bg-stone-100 hover:text-ink')}>{children}</NavLink>;

export default function Shell({me,out}){
 const initial=(me.user.name||me.user.shopName||'A').charAt(0).toUpperCase();
 return <div className="min-h-screen bg-[#f7f7f2] md:flex">
  <aside className="hidden w-[250px] shrink-0 flex-col border-r border-stone-200/80 bg-white px-5 py-7 md:flex">
   <div className="px-2"><Logo to="/app"/></div>
   <div className="my-8 flex items-center gap-3 rounded-2xl bg-[#f7f7f2] p-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">{initial}</div><div className="min-w-0"><p className="truncate font-semibold">{me.user.shopName}</p><p className="text-xs text-stone-500">Artisan shop</p></div></div>
   <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-400">Workspace</p>
   <nav className="flex flex-col gap-1">{N.map(([to,t,i,e])=><L key={to} to={to} end={e} c="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition"><span className="grid h-6 w-6 place-items-center text-lg">{i}</span>{t}</L>)}</nav>
   <div className="mt-auto border-t border-stone-100 pt-5"><button onClick={out} className="w-full rounded-xl px-3 py-3 text-left text-sm text-stone-500 transition hover:bg-stone-100 hover:text-ink">↩ &nbsp; Log out</button><p className="px-3 pt-3 text-xs text-stone-400">Made with care for makers</p></div>
  </aside>
  <div className="min-w-0 flex-1">
   <header className="flex h-[68px] items-center justify-between border-b border-stone-200/80 bg-white px-4 sm:px-7">
    <div className="md:hidden"><Logo to="/app"/></div><p className="hidden text-sm text-stone-500 md:block">Your creative workspace</p>
    <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{me.user.name}</p><p className="text-xs text-stone-500">{me.user.email}</p></div><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f3e9df] font-semibold text-clay">{initial}</div><button onClick={out} className="text-sm text-stone-500 hover:text-brand md:hidden">Log out</button></div>
   </header>
   <main className="min-w-0 p-4 pb-24 sm:p-7 md:p-8"><div className="mx-auto max-w-6xl"><Outlet/></div></main>
  </div>
  <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-stone-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
   {N.map(([to,t,i,e])=><L key={to} to={to} end={e} c="flex flex-col items-center gap-0.5 py-2 text-[11px]"><span className="text-lg">{i}</span>{t.split(' ').pop()}</L>)}
  </nav>
 </div>;
}
