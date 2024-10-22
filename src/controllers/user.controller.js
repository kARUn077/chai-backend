import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

//asyncHandler - higher order
const registerUser = asyncHandler(async ( req , res) => {
    //1 - get user details from frontend
    //2 - validation - not empty
    //3 - check if user already exists: username , email
    //4 - check for images , check for avatar
    //5 - upload them to cloudinary , avatar 
    //6 - create user object - create entry in db
    //7 - remove password and refresh token field form response
    //8 - check for user creation
    //9 - return res 

    const {fullName , email , username , password} = req.body
    console.log("email: " , email);


    //validation
    if(
        [fullName , email , username , password].some((field) => field?.trim() === "")
        //check karne ke liye , ki kya koi ek bhi khaali h kya??
    ){
        throw new ApiError(400 , "All fields are required")
    }

    //check whther use existed or not ,pehle se
    const existedUser =  User.findOne({
        $or: [{username} , {email}]
    })

    if( existedUser) {
        throw new ApiError(409 , "User with email or username already existed")
    }

    //4 - 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required")
    }

    //5

    const avatar = await uploadonCloudinary(avatarLocalPath)
    const coverImage = await uploadonCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400 , "Avatar file is required")
    }

    //6 
    const user = await User.create({
        fullName,
        avatar: avatar.url,   // we use .url because , hume pura avatar nhi chahiye
        coverImage: coverImage?.url || "",   //becoz hume ,yeh check karte rahna bhi h , ki yeh coverImage exist karta bhi h kya
        email,
        password,
        username: username.toLowerCase()
    })

    //7
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    //8
    if(!createdUser){
        throw new ApiError(500 , "Something went wrong")
    }

    //9
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered Successfully")
    )

})

export {registerUser}