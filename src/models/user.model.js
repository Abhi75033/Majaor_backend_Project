import mongoose, { Schema, trusted } from "mongoose";
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
    Username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true,
    },
    fullname:{
        type:String,
        required:true,
        trim: true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String //cloudinary
    },
    whathHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:'video'       
        }
    
    ],
   password: {
    type: String,
    required:true
    },
    refreshToken:{
        type: String
    }

},{timestamps:true})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
next()
})

// Creating own method
UserSchema.methods.isPasswordCorrect = async function(password){
return await bcrypt.compare(password, this.password)
}

UserSchema.methods.AccessTokenGenrator = function (){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            Username: this.Username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRECT,{
            expriesIn: process.env.ACCESS_TOKEN_EPIRY
        }
    )
}
UserSchema.methods.RefreshTokenGenrator = function (){
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRECT,{
            expriesIn: process.env.REFRESH_TOKEN_EPIRY
        }
    )
}
export const User = mongoose.model('User',UserSchema)
