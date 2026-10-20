import {useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';
import {Card,Err,CATS} from '../ui';
import necklace from '../../../assets/images/beaded-necklace.jpg';

export function AddProduct(){
 const nav=useNavigate(),fileInput=useRef(null),cameraInput=useRef(null),[step,setStep]=useState(1),[img,setImg]=useState(null),[b,setB]=useState(''),[e,setE]=useState(''),[drag,setDrag]=useState(false),
 [f,setF]=useState({name:'',category:'Jewellery',price:'',material:'',description:''}),[use,setUse]=useState('enhanced');
 const set=k=>v=>setF({...f,[k]:v.target.value});
 const upload=async file=>{if(!file)return;if(!/^image\/(jpeg|png|webp)$/.test(file.type))return setE('Use a JPG, PNG or WEBP image');setE('');setB('up');
  try{const fd=new FormData();fd.append('image',file);setImg(await api('/upload',{method:'POST',body:fd}));setStep(2);}catch(x){setE(x.message)}setB('');};
 const gen=async()=>{setE('');setB('gen');try{const d=await api('/describe',{method:'POST',body:f});setF(o=>({...o,description:d.description}));}catch(x){setE(x.message)}setB('');};
 const save=async()=>{setE('');setB('save');try{await api('/products',{method:'POST',body:{...f,image:use==='enhanced'?img.enhanced:img.original,original:img.original}});nav('/app/products');}catch(x){setE(x.message);setB('');}};
 const next=()=>{if(!f.name.trim()||f.price===''||Number(f.price)<0)return setE('Enter a product name and a valid price');setE('');setStep(4);};
 const T=['Upload','Enhance','Details','Preview'];
 return <div className="space-y-6"><div><p className="eyebrow mb-2">Your creative studio</p><h1 className="font-serif text-3xl font-semibold sm:text-4xl">Product Image Studio</h1><p className="mt-2 text-sm text-stone-500">A few simple steps to bring your handmade work to life.</p></div>
  <ol className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-4 text-sm sm:gap-3 sm:px-5">{T.map((t,i)=><li key={t} className={`flex min-w-0 flex-1 items-center gap-2 ${step===i+1||step>i+1?'font-semibold text-brand':'text-stone-400'}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${step>=i+1?'border-brand bg-brand text-white':'border-stone-300'}`}>{step>i+1?'✓':i+1}</span><span className="hidden truncate sm:inline">{t}</span>{i<3&&<span className="h-px min-w-2 flex-1 bg-stone-200 sm:mx-1"/>}</li>)}</ol>
  <Err e={e}/>
  {step===1&&<div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><div onDragOver={x=>{x.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={x=>{x.preventDefault();setDrag(false);upload(x.dataTransfer.files[0])}} className={'card flex min-h-[370px] flex-col items-center justify-center gap-3 border-2 border-dashed p-6 text-center sm:p-10 '+(drag?'border-brand bg-brand-soft':'border-stone-300')}>
   <span className="text-5xl">📸</span><p className="font-semibold">{b==='up'?'Uploading & enhancing…':'Choose a product photo'}</p><p className="text-sm text-stone-500">Drag and drop, browse your device, or take a photo with your camera.</p><p className="text-xs text-stone-500">On phones and tablets, Take a photo opens the rear camera. JPG, PNG, WEBP · Max 5MB</p>
   <div className="flex flex-wrap justify-center gap-3"><button type="button" className="btn-o" onClick={()=>fileInput.current?.click()} disabled={b==='up'}>Choose from device</button><button type="button" className="btn-p" onClick={()=>cameraInput.current?.click()} disabled={b==='up'}>Take a photo</button></div>
   <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={x=>{upload(x.target.files[0]);x.target.value=''}} disabled={b==='up'}/>
   <input ref={cameraInput} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={x=>{upload(x.target.files[0]);x.target.value=''}} disabled={b==='up'}/>
  </div><div className="card overflow-hidden"><div className="flex items-center justify-between px-5 py-4"><div><p className="eyebrow">Photo preview</p><p className="mt-1 text-sm font-semibold">A little inspiration</p></div><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">Studio tip</span></div><img src={necklace} alt="Example handmade beaded necklace" className="aspect-[4/3] w-full object-cover"/><div className="p-5"><h2 className="font-serif text-xl font-semibold">Let your craft shine</h2><p className="mt-2 text-sm leading-6 text-stone-500">Use soft daylight and a clean background. We’ll help optimize your photo before it goes into your catalogue.</p></div></div></div>}
  {step===2&&img&&<div className="card space-y-4 p-4 sm:p-6"><p className="font-semibold">Choose the version you like</p>
   <div className="grid grid-cols-2 gap-3">{[['original','Before'],['enhanced','After (enhanced)']].map(([k,t])=><button key={k} onClick={()=>setUse(k)} className={'overflow-hidden rounded-xl border-2 text-left '+(use===k?'border-brand':'border-transparent')}><img src={img[k]} alt={t} className="aspect-square w-full object-cover"/><p className="p-2 text-center text-sm font-medium">{t}{use===k&&' ✓'}</p></button>)}</div>
   <ul className="text-sm text-stone-600"><li>✓ Better lighting & clarity</li><li>✓ Sharper details</li><li>✓ Auto-resized and optimised by Cloudinary</li></ul>
   <div className="flex justify-between"><button className="btn-o" onClick={()=>setStep(1)}>Back</button><button className="btn-p" onClick={()=>setStep(3)}>Next</button></div></div>}
  {step===3&&<div className="grid gap-5 md:grid-cols-2"><div className="card space-y-3 p-4 sm:p-6"><h2 className="font-bold">AI Description Generator</h2>
   <input className="inp" placeholder="Product name *" value={f.name} onChange={set('name')}/><select className="inp" value={f.category} onChange={set('category')}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
   <input className="inp" type="number" min="0" inputMode="decimal" placeholder="Price in ₹ *" value={f.price} onChange={set('price')}/><input className="inp" placeholder="Material (e.g. beads, clay)" value={f.material} onChange={set('material')}/>
   <button className="btn-p w-full" onClick={gen} disabled={b==='gen'}>{b==='gen'?'Writing…':'✨ Generate Description'}</button></div>
   <div className="card space-y-3 bg-brand-soft p-4 sm:p-6"><h2 className="font-bold">Description</h2>
   <textarea className="inp min-h-40" placeholder="Click Generate, or write your own…" value={f.description} onChange={set('description')}/>
   <div className="flex justify-between gap-2"><button className="btn-o" onClick={()=>setStep(2)}>Back</button><button className="btn-p" onClick={next}>Next</button></div></div></div>}
  {step===4&&<div className="mx-auto max-w-xs space-y-4"><Card p={{...f,image:use==='enhanced'?img.enhanced:img.original}}/>
   <div className="flex gap-2"><button className="btn-o flex-1" onClick={()=>setStep(3)}>Edit</button><button className="btn-p flex-1" onClick={save} disabled={b==='save'}>{b==='save'?'Publishing…':'Publish'}</button></div></div>}</div>;
}
