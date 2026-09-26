import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    mobile:{
        type:String,
        required:true,
        minlength:10,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        trim:true
    }
},{timestamps:true});

const User = mongoose.model('User',userDetailsSchema);
export default User;