import express from 'express'
import singleUpload from '../middlewares/multer.js'
import {isAuthenticated} from '../middlewares/auth.js'
import {changePassword, followUser, getMyPosts, getMyProfile, getUserPost, getUserProfile, login, logout, register, updateProfile, updateProfilePicture} from '../controllers/userController.js'


const router=express.Router()

router.route('/register').post(singleUpload,register)
router.route('/login').post(login)
router.route('/logout').get(logout)

router.route('/me').get(isAuthenticated,getMyProfile)
router.route('/updateprofile').put(isAuthenticated,updateProfile)
router.route('/updateprofilepicture').put(isAuthenticated,updateProfilePicture)

router.route('/changepassword').put(isAuthenticated,changePassword)

router.route('/follow:id').get(isAuthenticated,followUser)
router.route('/my/posts').get(isAuthenticated,getMyPosts)

router.route('/userposts/:id').get(isAuthenticated,getUserPost)
router.route('/user/:id').get(isAuthenticated,getUserProfile)

export default router