import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //database mein refreshtoken daal diya
        user.refreshToken = refreshToken
        await user.save({
            validateBeforeSave: false
        })

        return {accessToken , refreshToken}

    }
    catch(error){
        throw new ApiError(500 , "Something went wrong while gnerating refreash and access token")
    }
}

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
    //console.log("email: " , email);


    //validation
    if(
        [fullName , email , username , password].some((field) => field?.trim() === "")
        //check karne ke liye , ki kya koi ek bhi khaali h kya??
    ){
        throw new ApiError(400 , "All fields are required")
    }
  
    //check whther use existed or not ,pehle se
    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    })

    if( existedUser) {
        throw new ApiError(409 , "User with email or username already existed")
    }

    // console.log(req.files);

    //4 - 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

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
        throw new ApiError(500 , "Something went wrong while registering the user")
    }

    //9
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req , res ) => {
    //req body -> data
    // username or email
    // find the user
    // password check
    //access and refresh token
    //send cookie

    const {email , username , password} = req.body
    console.log(email)

    if(!username && !email){
        throw new ApiError(400  , "username or password is required")
    }

    //find user
    const user = await User.findOne({
        $or: [{username} , {email}]
    })

    if(!user){
        throw new ApiError(404 , "USer does not exist")
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    //note we user here only user , not User , because User -> mongodb ka h , par humne jo banaye h , woh user ke paas h

    if(!isPasswordValid){
        throw new ApiError(400 , "Invalid user credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //send cookies
    const options = {
        httpOnly: true,
        secure : true
    } //taki ab koi bhi bhi , khaali server hi cokkies change kar sake

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , 
            {
                user: loggedInUser , accessToken , refreshToken
            }, //yeh lar rhe h , kyonki jab user khud accessyoken , refreshtoken ko access karna chah rha hoga

            "User logged in successfully"        
        )
    )
})

//logout ke middleware use karna padhega
const logoutUser = asyncHandler(async(req , res) => {
    //m1 - 
    //user laao , fir uska refresh token delete karo , fir save , fir validatebeforesave

    //m2
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure : true
    } 

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User logged Out"))
    
})


export {registerUser , 
    loginUser, 
    logoutUser
}