import mongoose from "mongoose";
import { DB_Name } from "./Constants";
import express from "express"


const app = express()



/*
(async()=>{
 try {
    await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_Name}`)
    // If the app doesnot talk with database even if the db is connected successfully
    app.on("Error",(error)=>{
        console.log('Error',error);
        throw error
    })

    app.listen(process.env.PORT,()=>console.log(`The Server has been Up at Port no ${process.env.PORT}`))

 } catch (error) {
    console.log('Error',error);
    throw error
 }   
})()
*/

app.listen(process.env.PORT,()=>{console.log("Server is up");})
