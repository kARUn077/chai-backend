import { asyncHandler } from "../utils/asyncHandler.js";

//asyncHandler - higher order
const registerUser = asyncHandler(async ( req , res) => {
    res.status(200).json({
        message: "ok"
    })
})

export {registerUser}