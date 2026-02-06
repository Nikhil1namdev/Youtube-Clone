// require("dotenv").config({path:"./env"})

import dotenv from "dotenv"
dotenv.config({path:"./env"})   
import connectDB from "./db/index.js";  
import app from "./app.js";


connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,() =>{
         console.log(  `server is running at ${process.env.PORT }`);
         
    })

})
.catch((err)=>{
console.log("mongo db connection failed !!!" ,err);

})



/*
first approch using iffe using index.js file  
import express from "express"
const app = express()
//database connection
;( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error",error)
            throw error
        })  

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`)
        })  
    }
    catch(error){
        console.log("Error",error)
    }
})()
*/