import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../service/fileUploadCloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res)=>{

     //get user details from frontend
     const {username,email,password,fullname}=req.body
     console.log("email",email);
     
     //validation lagana padega -not empty
    //  if(!username){
    //     throw new ApiError(400,"username is required")
    //  }
    //  if(!email){
    //     throw new ApiError(400,"email is required")
    //  }
    //  if(!password){
    //     throw new ApiError(400,"password is required")
    //  }
    //  if(!fullname){
    //     throw new ApiError(400,"fullname is required")
    //  }
    //  if(!avatar){
    //     throw new ApiError(400,"avatar is required")
    //  }
    //  if(!coverImage){
    //     throw new ApiError(400,"coverImage is required")
    //  }     
 //another way
 if([username,email,password,fullname].some((field)=>!field)){
    throw new ApiError(400,"All fields are required")
 }
 if(email.includes("@")===false){
    throw new ApiError(400,"Invalid email")
 }
 if(password.length<6){
    throw new ApiError(400,"Password must be at least 6 characters long")
 }
     



     // check if user already exist:username,email
    const existedUser = await User.findOne({
        $or:[
            // {email:email},
            // {username:username}
            {username},
            {email}
        ]   
     })
     if(existedUser){
        throw new ApiError(409,"User already exist")
     }
     // check for images,check for avatar
     //multer se file lene ka tarika server se
     const avatarLocalPath = req.files?.avatar?.[0]?.path;
     const coverImageLocalPath = req.files?.coverImage?.[0]?.path;  
        if(!avatarLocalPath)
        {
            throw new ApiError(400,"Avatar file is required")
        }
     //upload them to cloudinary,check avtar uplaod hua ya nhi
     const avatar= await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     //check karo cloudinay pr avatar gaya ya nhi
       if(!avatar){
        throw new ApiError(400,"Avatar is required")
     }
     // create user object -create entry in db
     const user = await User.create({
        username:username.toLowerCase(),
        email,
        password,
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
     }) 
     //remove passwrod and refresh token from response
     //db me fied hoti hai _id se isliye hum _id pass krte hai  mongodb banata hai
     const createdUser   = await User.findById(user._id).select(
         //jo field nhi chahiye usko -lagake likh do
         "-password -refreshToken    "  //password or refresh token   ko hide krne ke liye    
        )


    //check for user creation
     if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
     }
     
    
     //return response
     return res
     .status(201)
     .json(new ApiResponse(200,"User registered successfully",createdUser)) 
})

export {registerUser}   