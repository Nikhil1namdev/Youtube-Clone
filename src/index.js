// require("dotenv").config({path:"./env"})

import dotenv from "dotenv"
dotenv.config({path:"./env"})   
import connectDB from "./db/index.js";  


connectDB()




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