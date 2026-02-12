//ye sirf verify karega user hai ya nhi logout ke time pr
//jab bhi middlware likhte hai next ka use karna padta hai vo aage le jane ke liye

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler  from "../utils/asyncHandler.js";
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    //get the token access from the cookie becuase we have cookie parser
    const token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");
    //agar token nhi hai
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
    // agar token hai to verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, "Unauthorized");
    }
    //get the user
    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    //set the user in the request
    //req.user me user ka data store ho gaya ab isko hum aage use kr sakte hai,naam kuch bhi ho sakta
    //hai like req.nikhil but not good practise
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});


//middlwre routes me use hote hai
//_ iski jagah res ko use nhi karrahe isliye _ use kiya