export const api=async(p,o={})=>{const fd=o.body instanceof FormData,t=localStorage.getItem('t');
 const r=await fetch('/api'+p,{...o,headers:{...(fd?{}:{'Content-Type':'application/json'}),...(t?{Authorization:'Bearer '+t}:{})},body:o.body&&!fd?JSON.stringify(o.body):o.body});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong. Please try again.');return d;};
