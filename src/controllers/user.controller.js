import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../service/fileUploadCloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//access toekn andrefresh token ka ek function hi bana diya taki baad me bhi use ho jaye,userid to paaa karna hi padega
const generateAccessAndRefreshToken  = async (userId) => {
  try {
    //token generate karna to user find karo
    const user = await User.findById(userId);
    //generate token user se
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //save  refersh token in db
    user.refreshToken = refreshToken;
    //user ko save karao 
    await user.save({ validateBeforeSave: false });
    //return token
      return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating the token");
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { username, email, password, fullName } = req.body;
  // console.log("email", email);
  console.log("response body", req.body);

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
  if ([username, email, password, fullName].some((field) => !field)) {
    throw new ApiError(400, "All fields are required");
  }
  if (email.includes("@") === false) {
    throw new ApiError(400, "Invalid email");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  // check if user already exist:username,email
  const existedUser = await User.findOne({
    $or: [
      // {email:email},
      // {username:username}
      { username },
      { email },
    ],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  console.log(req.files);

  // check for images,check for avatar
  //multer se file lene ka tarika server se
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  //upload them to cloudinary,check avtar uplaod hua ya nhi
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //check karo cloudinay pr avatar gaya ya nhi
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // create user object -create entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  //remove passwrod and refresh token from response
  //db me fied hoti hai _id se isliye hum _id pass krte hai  mongodb banata hai
  const createdUser = await User.findById(user._id).select(
    //jo field nhi chahiye usko -lagake likh do
    "-password -refreshToken    " //password or refresh token   ko hide krne ke liye
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body se data lana
  const { username, email, password } = req.body;
  //username,email hai ya nhi
  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }
  //find the user in db based on email ya username se
  const user = await User.findOne({
    //yato email ya username se find karo db me
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (!user) {
    //agar kabhi user nhi mila toh mblb register hi nhi kiya tha
    throw new ApiError(404, "User not found");
  }
  // agar use mil gaya to check for password
  //important thing
  //User :ye mongodb ka mongoose ka object hai isliye isme method use kr sakte hai  
  //isPasswordCorrect,generateAccessToken,generateRefreshToken :ye humne  banaya hai jo database se vapas liya hai uska instance vo ye user hai small letter vala
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  //generate token access and refresh
  // generateAccessAndRefreshToken function ko call karo vo access token and refresh token return karra ahi
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  //use ko kya kya information bejhna hai
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send tokens in cookies(cannot be modify by frontend ,only by server)
  const options = {
    httpOnly: true,
    secure: true,
  };

  //return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          //jab ho sakta hai user khud ki taraf se accesstoken and refresh token save karna
          //chahta hai aachi practise hai
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //way to logout (middleware se)
  //cookie remove karo
  //access token and refresh token ko remove karo  
  //logout ke time user kha se lau kyuki iss method ke paas access hi nhi hai 
  //solutin is middleware :me login tha tokens tha to db se query mari or req.user me user add kar diya or uski id se token delete kar dunga
  //isse refresh token db se delete ho gya
  await User.findByIdAndUpdate(

    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //ab cookies bhi delte karo db se 
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
