import app from './app.js'

import {connectDB} from './config/database.js'
import cloudinary from 'cloudinary'

connectDB()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET,
})

app.listen(4000,()=>{
    console.log(`Server is running on 4000`)
})