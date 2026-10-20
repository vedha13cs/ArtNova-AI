const r=require('express').Router(),jwt=require('jsonwebtoken'),bcrypt=require('bcryptjs'),multer=require('multer');
const {createHmac,randomInt,randomUUID,timingSafeEqual}=require('crypto');
const cloudinary=require('cloudinary').v2;const {User,Product,Verification}=require('./models');
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
const up=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024}});
const wrap=f=>(q,s,n)=>f(q,s,n).catch(e=>s.status(e.status||500).json({error:e.code==='LIMIT_FILE_SIZE'?'Image must be under 5MB':e.message}));
const bad=(m,status=400)=>{const e=new Error(m);e.status=status;return e;};
const validEmail=email=>typeof email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const otpLimits=new Map();
const limitOtpRequests=(key)=>{
 const now=Date.now(),windowMs=15*60*1000,entry=otpLimits.get(key);
 if(otpLimits.size>=5000){
  for(const[k,v]of otpLimits)if(v.resetAt<=now)otpLimits.delete(k);
  if(otpLimits.size>=5000&&!otpLimits.has(key))return false;
 }
 if(!entry||entry.resetAt<=now){otpLimits.set(key,{count:1,resetAt:now+windowMs});return true;}
 if(entry.count>=5)return false;
 entry.count++;return true;
};
const requireMsg91=()=>{if(!process.env.MSG91_AUTH_KEY||!process.env.MSG91_TEMPLATE_ID)throw bad('SMS OTP is not configured. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in server/.env, then restart the backend.',503);};
const requireResend=()=>{if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM)throw bad('Email OTP is not configured. Set RESEND_API_KEY and RESEND_FROM in server/.env, then restart the backend.',503);};
const indianPhone=phone=>{const digits=String(phone||'').replace(/\D/g,'');return digits.length===10?'91'+digits:digits.length===12&&digits.startsWith('91')?digits:'';};
const msg91Request=async(path,options)=>{
 let response;
 try{response=await fetch('https://control.msg91.com/api/v5/otp'+path,{...options,headers:{authkey:process.env.MSG91_AUTH_KEY,...options.headers},signal:AbortSignal.timeout(10000)});}
 catch{throw bad('Could not reach the SMS service. Check the server connection and try again.',502);}
 const text=await response.text();let result;
 try{result=JSON.parse(text);}catch{throw bad('The SMS provider returned an unreadable response. Check the MSG91 configuration and try again.',502);}
 return{response,result};
};
const sendMsg91Otp=async phone=>{
 requireMsg91();
 const query=new URLSearchParams({template_id:process.env.MSG91_TEMPLATE_ID,mobile:phone,otp_length:'6',otp_expiry:'5'});
 const{response,result}=await msg91Request('?'+query.toString(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
 if(!response.ok||result.type!=='success')throw bad(result.message||'MSG91 could not send the OTP. Check your account and approved template.',502);
};
const verifyMsg91Otp=async(phone,otp)=>{
 requireMsg91();
 const query=new URLSearchParams({mobile:phone,otp});
 const{response,result}=await msg91Request('/verify?'+query.toString(),{method:'GET'});
 if(!response.ok||result.type!=='success')throw bad(response.ok?'Invalid or expired OTP.':result.message||'MSG91 could not verify the OTP.',response.ok?400:502);
};
const otpHash=(verificationId,otp)=>createHmac('sha256',process.env.JWT_SECRET).update(verificationId+':'+otp).digest('hex');
const sendEmailOtp=async(destination,otp)=>{
 requireResend();
 let response;
 try{
  response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM,to:[destination],subject:'Your ArtNova verification code',text:`Your ArtNova verification code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`}),signal:AbortSignal.timeout(10000)});
 }catch{throw bad('Could not reach the email service. Check the server connection and try again.',502);}
 const result=await response.json().catch(()=>null);
 if(!response.ok)throw bad(result&&result.message||'The email service could not send the code. Check the email provider configuration.',502);
};
const sendOtp=async({purpose,channel,destination,payload,user})=>{
 if(channel==='sms')requireMsg91();else requireResend();
 const verificationId=randomUUID(),otp=channel==='email'?String(randomInt(0,1000000)).padStart(6,'0'):null;
 await Verification.create({verificationId,purpose,channel,destination,...(otp?{codeHash:otpHash(verificationId,otp)}:{}),payload,user,expiresAt:new Date(Date.now()+10*60*1000)});
 try{
  if(channel==='sms')await sendMsg91Otp(destination);
  else await sendEmailOtp(destination,otp);
 }catch(error){
  await Verification.deleteOne({verificationId});
  throw error;
 }
 await Verification.deleteMany({purpose,destination,verificationId:{$ne:verificationId}});
 return{challengeToken:challenge({purpose,verificationId}),purpose,channel,destinationHint:channel==='sms'?destination.slice(-4):destination.replace(/^(.).+(@.+)$/,'$1•••$2')};
};
const verifyOtp=async(token,purpose,otp)=>{
 const claims=readChallenge(token,purpose);
 const verification=await Verification.findOneAndUpdate(
  {verificationId:claims.verificationId,purpose,expiresAt:{$gt:new Date()},attempts:{$lt:5}},
  {$inc:{attempts:1}},
  {new:true}
 );
 if(!verification)throw bad('This code has expired or too many attempts were made. Request a new code.',401);
 if(!/^\d{6}$/.test(String(otp||'')))throw bad('Enter the 6-digit code');
 if(verification.channel==='sms'){
  await verifyMsg91Otp(verification.destination,String(otp));
 }else{
  const submitted=Buffer.from(otpHash(verification.verificationId,String(otp)),'hex');
  const expected=Buffer.from(verification.codeHash||'','hex');
  if(submitted.length!==expected.length||!timingSafeEqual(submitted,expected))throw bad('Invalid or expired code.',400);
 }
 return verification;
};
const sign=u=>jwt.sign({id:u._id},process.env.JWT_SECRET,{expiresIn:'30d'});
const challenge=(claims)=>jwt.sign(claims,process.env.JWT_SECRET,{expiresIn:'10m'});
const readChallenge=(token,purpose)=>{
 try{const claims=jwt.verify(token,process.env.JWT_SECRET);if(claims.purpose!==purpose)throw bad('Invalid verification session. Request a new OTP.',400);return claims;}
 catch(e){if(e.status)throw e;throw bad('Verification session expired. Request a new OTP.',401);}
};
const pub=u=>({id:u._id,name:u.name,shopName:u.shopName,slug:u.slug,email:u.email,phone:u.phone});
const auth=(q,s,n)=>{try{q.uid=jwt.verify((q.headers.authorization||'').slice(7),process.env.JWT_SECRET).id;n();}catch{s.status(401).json({error:'Please log in again'});}};

r.post('/auth/register',wrap(async(q,s)=>{
 const{name,shopName,email,phone,password}=q.body;
 const normalizedEmail=(email||'').toLowerCase().trim(),fullPhone=indianPhone(phone);
 if(!name||!shopName||!normalizedEmail||!password)throw bad('Fill in all fields');
 if(!validEmail(normalizedEmail))throw bad('Enter a valid email address');
 if(password.length<6)throw bad('Password must contain at least 6 characters');
 if(!/^\d{10}$/.test(String(phone||'')))throw bad('Mobile number must contain exactly 10 digits');
 const existing=await User.findOne({$or:[{email:normalizedEmail},{phone:fullPhone}]});
 if(existing)throw bad('An account already uses this email or phone number');
 const base=shopName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'shop';let slug=base,i=1;
 while(await User.findOne({slug}))slug=base+'-'+(++i);
 let user;
 try{
  user=await User.create({name,shopName,email:normalizedEmail,phone:fullPhone,password:await bcrypt.hash(password,10),slug,emailVerified:false,phoneVerified:false});
 }catch(error){if(error.code===11000)throw bad('An account already uses this email or phone number');throw error;}
 s.json({token:sign(user),user:pub(user)});
}));
r.post('/auth/login',wrap(async(q,s)=>{
 const identifier=String(q.body.identifier||'').trim(),password=String(q.body.password||'');
 let user;
 if(validEmail(identifier))user=await User.findOne({email:identifier.toLowerCase()});
 else{
  const phone=indianPhone(identifier);
  if(!phone)throw bad('Enter a valid email address or 10-digit mobile number');
  user=await User.findOne({phone:{$in:[phone,phone.slice(2)]}});
 }
 if(!user||!user.password||!await bcrypt.compare(password,user.password))throw bad('Email/phone or password is incorrect.',401);
 s.json({token:sign(user),user:pub(user)});
}));
r.post('/auth/forgot-password/request-otp',wrap(async(q,s)=>{
 const identifier=String(q.body.identifier||'').trim();let user;
 if(validEmail(identifier))user=await User.findOne({email:identifier.toLowerCase()});
 else{
  const phone=indianPhone(identifier);
  if(!phone)throw bad('Enter the email or phone number registered to your account');
  user=await User.findOne({phone:{$in:[phone,phone.slice(2)]}});
 }
 if(!user)throw bad('No account was found for that email or phone number.',404);
 const savedPhone=indianPhone(user.phone);
 const usePhone=savedPhone&&user.phoneVerified;
 const channel=usePhone?'sms':'email',destination=usePhone?savedPhone:user.email;
 if(!destination)throw bad('This account has no verified recovery method. Contact support.',409);
 const key=q.ip+':password-reset:'+String(user._id);
 if(!limitOtpRequests(key))throw bad('Too many code requests. Try again in 15 minutes.',429);
 s.json(await sendOtp({purpose:'password-reset',channel,destination,user:user._id}));
}));
r.post('/auth/forgot-password/reset',wrap(async(q,s)=>{
 const password=String(q.body.password||'');
 if(password.length<6)throw bad('Password must contain at least 6 characters');
 const verification=await verifyOtp(q.body.challengeToken,'password-reset',q.body.otp);
 const user=await User.findById(verification.user);
 if(!user)throw bad('Account not found. Start password recovery again.',404);
 user.password=await bcrypt.hash(password,10);
 if(verification.channel==='sms')user.phoneVerified=true;
 else user.emailVerified=true;
 await user.save();
 await Verification.deleteOne({_id:verification._id});
 s.json({ok:true});
}));
r.get('/me',auth,wrap(async(q,s)=>{const u=await User.findById(q.uid);if(!u)throw bad('Please log in again',401);
 const ps=await Product.find({user:q.uid});
 s.json({user:pub(u),stats:{products:ps.length,views:u.views,clicks:ps.reduce((a,p)=>a+p.clicks,0)}});}));

r.post('/upload',auth,up.single('image'),wrap(async(q,s)=>{
 if(!q.file)throw bad('Choose an image first');
 if(!process.env.CLOUDINARY_CLOUD_NAME||!process.env.CLOUDINARY_API_KEY||!process.env.CLOUDINARY_API_SECRET)throw bad('Image uploads need Cloudinary credentials. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env, then restart the backend.',503);
 const res=await new Promise((ok,no)=>cloudinary.uploader.upload_stream({folder:'artnova',resource_type:'image'},(e,x)=>e?no(e):ok(x)).end(q.file.buffer));
 const enhanced=cloudinary.url(res.public_id,{secure:true,transformation:[{width:1200,height:1200,crop:'limit'},{effect:'improve'},{effect:'sharpen:60'},{quality:'auto',fetch_format:'auto'}]});
 s.json({original:res.secure_url,enhanced});}));

r.post('/describe',auth,wrap(async(q,s)=>{const{name,category,material,price}=q.body;if(!name)throw bad('Enter the product name first');
 const fb=`Discover the beauty of handmade ${(category||'craft').toLowerCase()} with this ${name.toLowerCase()}${material?`, crafted from ${material.toLowerCase()}`:''}. Made with care and attention to detail, it is a one-of-a-kind piece that adds warmth and character to your day. Support local artisans and bring home something truly special.`;
 if(!process.env.ANTHROPIC_API_KEY)return s.json({description:fb,source:'template'});
 try{const x=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:process.env.AI_MODEL||'claude-sonnet-4-6',max_tokens:300,messages:[{role:'user',content:`Write a warm, appealing 50-70 word product description for a handmade item sold by a small artisan. Name: ${name}. Category: ${category}. Material: ${material||'not given'}. Price: INR ${price||'not given'}. Return only the description text.`}]})});
  const d=await x.json();const t=d.content&&d.content[0]&&d.content[0].text;s.json({description:t||fb,source:t?'ai':'template'});}
 catch{s.json({description:fb,source:'template'});}}));

r.get('/products',auth,wrap(async(q,s)=>s.json(await Product.find({user:q.uid}).sort('-createdAt'))));
r.post('/products',auth,wrap(async(q,s)=>{const{name,category,price,material,description,image,original}=q.body;
 if(!name||!image||!(Number(price)>=0))throw bad('Name, price and photo are required');
 s.json(await Product.create({user:q.uid,name,category,price:Number(price),material,description,image,original}));}));
r.patch('/products/:id',auth,wrap(async(q,s)=>s.json(await Product.findOneAndUpdate({_id:q.params.id,user:q.uid},{$set:{active:!!q.body.active}},{new:true}))));
r.delete('/products/:id',auth,wrap(async(q,s)=>{await Product.deleteOne({_id:q.params.id,user:q.uid});s.json({ok:true});}));

r.get('/public/:slug',wrap(async(q,s)=>{const u=await User.findOneAndUpdate({slug:q.params.slug},{$inc:{views:1}});if(!u)throw bad('Catalogue not found',404);
 s.json({shop:{name:u.shopName,owner:u.name,phone:u.phone},products:await Product.find({user:u._id,active:true}).sort('-createdAt')});}));
r.post('/public/click/:id',wrap(async(q,s)=>{await Product.findByIdAndUpdate(q.params.id,{$inc:{clicks:1}});s.json({ok:true});}));
module.exports=r;
