import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadonCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath , {response_type" "auto})

        //file has been uplaod successfully
        console.log("file is uploaded on cloudinary" , response.url)
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        //remove locally saved file temporary as uplaod operation got failed

        return null;
    }
}

export {uploadonCloudinary}