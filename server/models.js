const m=require('mongoose');
const User=m.model('User',new m.Schema({name:String,shopName:String,slug:{type:String,unique:true},email:{type:String,unique:true,lowercase:true},emailVerified:{type:Boolean,default:false},phone:String,phoneVerified:{type:Boolean,default:false},password:String,views:{type:Number,default:0}},{timestamps:true}));
const Product=m.model('Product',new m.Schema({user:{type:m.Schema.Types.ObjectId,ref:'User',index:true},name:String,category:String,price:Number,material:String,description:String,image:String,original:String,active:{type:Boolean,default:true},clicks:{type:Number,default:0}},{timestamps:true}));
const Verification=m.model('Verification',new m.Schema({
 verificationId:{type:String,required:true,unique:true},
 purpose:{type:String,required:true},
 channel:{type:String,enum:['email','sms'],required:true},
 destination:{type:String,required:true},
 codeHash:String,
 payload:m.Schema.Types.Mixed,
 user:{type:m.Schema.Types.ObjectId,ref:'User'},
 attempts:{type:Number,default:0},
 expiresAt:{type:Date,required:true}
},{timestamps:true}));
Verification.schema.index({expiresAt:1},{expireAfterSeconds:0});
module.exports={User,Product,Verification};
