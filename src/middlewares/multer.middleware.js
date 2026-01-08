import multer from 'multer'

const storage = multer.diskStorage({//jo file hum uswer se upload krwayenge usko kaha aur kese rkhenge!!!....
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
        console.log(req.files);
    }
})



export const upload = multer({ storage })