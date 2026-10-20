import {Logo} from '../ui';
import vase from '../../../assets/images/terracotta-vase.jpg';
import necklace from '../../../assets/images/beaded-necklace.jpg';

const FEATURES=[
 ['✦','Enhance product photos'],
 ['◈','AI-written descriptions'],
 ['▦','Digital catalogues'],
 ['↗','Share with customers']
];

export function Landing(){
 return <div className="min-h-screen overflow-hidden bg-[#f8f5ee]">
  <header className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
   <Logo/>
   <nav className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
    <a href="#" className="font-medium text-brand">Home</a><a href="#features" className="hover:text-brand">Features</a><a href="#how" className="hover:text-brand">How it works</a><a href="#about" className="hover:text-brand">About</a>
   </nav>
   <a href="#features" className="btn-p whitespace-nowrap !px-3 !py-2.5 text-xs sm:!px-5 sm:text-sm">Explore features</a>
  </header>
  <main>
   <section className="mx-auto grid max-w-[1320px] items-center gap-8 px-5 pb-14 pt-3 sm:px-8 md:grid-cols-[.9fr_1.1fr] md:gap-10 md:px-12 md:pb-16 md:pt-6">
    <div className="relative z-10 py-5 md:py-12">
     <p className="eyebrow mb-5">Made for independent makers</p>
     <h1 className="max-w-xl font-serif text-[2.8rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.5rem]"><span className="text-clay">From Handmade</span><br/>to Market-Ready.</h1>
     <p className="mt-6 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">Turn your beautiful handmade products into professional listings with the power of AI.</p>
     <div className="mt-8 flex flex-wrap gap-3"><a href="#features" className="btn-p !px-7">Explore features <span aria-hidden="true">→</span></a><a href="#how" className="btn-o !px-6">▷ &nbsp;How it works</a></div>
     <div id="features" className="mt-10 grid max-w-xl grid-cols-2 gap-x-4 gap-y-4 border-t border-stone-200 pt-6 sm:grid-cols-4">
      {FEATURES.map(([icon,label])=><div key={label} className="flex items-start gap-2 text-xs font-medium leading-5 text-stone-600"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-stone-200 bg-white text-brand">{icon}</span>{label}</div>)}
     </div>
    </div>
    <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-[#efe2d1] shadow-soft sm:min-h-[440px] lg:min-h-[525px]">
     <img src={vase} alt="Hand-painted artisan terracotta pottery" className="absolute inset-0 h-full w-full object-cover"/>
     <div className="absolute inset-0 bg-gradient-to-r from-[#1e251e]/30 via-transparent to-transparent"/>
     <div className="absolute bottom-5 left-5 rounded-xl border border-white/60 bg-white/90 px-4 py-3 shadow-soft backdrop-blur sm:bottom-8 sm:left-8"><p className="font-serif text-lg italic text-clay">Handmade with love</p><p className="mt-1 text-xs text-stone-500">Thoughtful craft. Wider audience.</p></div>
     <div className="absolute right-4 top-4 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-soft sm:right-7 sm:top-7 sm:h-32 sm:w-32"><img src={necklace} alt="Handmade beaded artisan jewellery" className="h-full w-full object-cover"/></div>
    </div>
   </section>
   <section id="how" className="border-y border-stone-200/80 bg-white/70 px-5 py-8 sm:px-8 md:py-10">
    <div className="mx-auto grid max-w-[1320px] items-center gap-4 text-center sm:grid-cols-3 sm:text-left">
     <p id="about" className="font-serif text-lg italic text-stone-500 sm:text-xl">Support artisans. <span className="text-clay">Preserve traditions.</span> Grow together.</p>
     <p className="text-sm leading-6 text-stone-600 sm:col-span-2">One simple studio to photograph, describe, organize, and share the things you make by hand.</p>
    </div>
   </section>
  </main>
  <footer className="py-5 text-center text-xs text-stone-500">ArtNova AI <span className="mx-2">·</span> Thoughtfully made for makers</footer>
 </div>;
}
