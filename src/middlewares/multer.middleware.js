import multer from "multer"

//we use disk storage here , not memory storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")  //destination is public -> temp
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ 
    storage
  })