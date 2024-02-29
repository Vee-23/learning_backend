import multer from 'multer' 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log("in the middleware destinnation")
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      // console.log("in the middleware",file)
      cb(null, file.originalname)
    }
  })

export const upload = multer({storage})