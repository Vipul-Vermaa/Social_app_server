import express  from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from '../middlewares/multer.js'
import { createPost, deletePost, likeAndUnlikePost, postOfFollowing } from "../controllers/postController.js";

const router=express.Router()

router.route('/createpost').post(isAuthenticated,singleUpload,createPost)

router.route('/post/:id')
.get(isAuthenticated,likeAndUnlikePost)
.delete(isAuthenticated,deletePost)

router.route('/posts').get(isAuthenticated,postOfFollowing)

export default router