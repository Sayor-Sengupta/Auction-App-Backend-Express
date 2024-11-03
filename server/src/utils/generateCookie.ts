import { Response } from "express";
import  jwt  from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const generateCookie = (userId:Number,res:Response)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET!,{expiresIn:'1d'});

    res.cookie("jwt",token,{
       maxAge:15*24*60*60*1000,
       httpOnly:true,
       sameSite:'strict',

    })
    return token
}