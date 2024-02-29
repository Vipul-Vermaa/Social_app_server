import cloudinary from 'cloudinary'
import getDataUri from '../utils/dataUri.js'
import crypto from 'crypto'
import {catchAsyncError} from '../middlewares/catchAsyncError.js'
import {User} from '../models/User.js'
import {Post} from '../models/Post.js'
import ErrorHandler from '../utils/errorHandler.js'
import {sendToken} from '../utils/sendToken.js'

export const register=catchAsyncError(async (req,res,next)=>{
    const {name,email,password}=req.body
    const file=req.file
    if (!name || !email || !password)return next(new ErrorHandler('Enter all field',400))
    let user=await User.findOne({email})
    if (user)return next(new ErrorHandler('User already exist',400))

    const fileUri=getDataUri(file)
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)

    user=await User.create({
        name,email,password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        },
    })
    sendToken(res,user,'Registered Successfully',201)
})

export const login=catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body
    if(!email || !password)return next(new ErrorHandler('Enter all fields',400))
    const user=await User.findOne({email}).select('+password')
    if(!user)return next(new ErrorHandler('Incorrect email or password'))
    const isMatch=await user.comparepassword(password)
    if(!isMatch)return next(new ErrorHandler('Incorrect email or password',401))
    sendToken(res,user,`Welcome, ${user.name}`,200)
})


export const logout=catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        secure:true,
        samesite:'none',
    }).json({
        success:true,
        message:'Logged out'
    })
})


export const getMyProfile=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id).populate('post followers following')
    res.status(200).json({
        success:true,
        user,
    })
})


export const updateProfile=catchAsyncError(async(req,res,next)=>{
    const {name,email}=req.body
    const user=await User.findById(req.user._id)
    if (name) user.name=name
    if (email) user.email=email
    await user.save()
    res.status(200).json({
        success:true,
        message:'Profile Updated'
    })
})


export const updateProfilePicture=catchAsyncError(async(req,res,next)=>{
    const file=req.file
    const user=await User.findById(req.user._id)
    const fileUri=getDataUri(file)
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    user.avatar={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
    await user.save()
    res.status(200).json({
        success:true,
        message:'Profile Picture Updated'
    })
})


export const changePassword=catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword}=req.body
    if(!oldPassword || !newPassword) return next(new ErrorHandler('Enter all fields',400))
    const user=await User.findById(req.user._id).select('+password')
    const isMatch=await user.comparepassword(oldPassword)
    if (!isMatch) return next(new ErrorHandler('Incorrect',400))
    user.password=newPassword
    await user.save()
    res.status(200).json({
        success:true,
        message:'Password changed'
    }) 
})


export const followUser=catchAsyncError(async(req,res,next)=>{
    const userToFollow=await User.findById(req.params.id)
    const loggedInUser=await User.findById(req.user._id)
    if(!userToFollow) return next(new ErrorHandler('Not Found',404))
    if (loggedInUser.following.includes(userToFollow._id)){
        const indexfollowing=loggedInUser.following.indexOf(userToFollow._id)
        const indexfollowers=userToFollow.followers.indexOf(loggedInUser._id)
        
        loggedInUser.following.splice(indexfollowing,1)
        userToFollow.followers.splice(indexfollowers,1)

        await loggedInUser.save()
        await userToFollow.save()
        res.status(200).json({
            success:true,
            message:'Unfollowed',
        })
    }
    else{
        loggedInUser.following.push(userToFollow._id)
        userToFollow.followers.push(loggedInUser._id)

        await loggedInUser.save()
        await userToFollow.save()

        res.status(200).json({
            success:true,
            message:'Followed',
        })
    }
})


export const getUserProfile=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.params.id).populate('post followers following')
    if(!user) return next (new ErrorHandler('Not Found',404))
    res.status(200).json({
    success:true,
    user,    
    })
})

export const getMyPosts=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id)
    const posts=[]
    for(let i=0;i<user.post.length;i++){
        const post=await Post.findById(user.post[i]).populate(
            'likes.user owner'
        )
        posts.push(post)
    }
    res.status(200).json({
        success:true,
        posts,
    })
})

export const getUserPost=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.params.id)
    const posts=[]
    for (let i=0;i<user.post.length;i++){
        const post=await Post.findById(user.post[i]).populate(
            'likes.user owner')
        posts.push(post)
        }
        res.status(200).json({
            success:true,
            posts,
        })
})