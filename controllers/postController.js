import cloudinary from 'cloudinary'
import {catchAsyncError} from '../middlewares/catchAsyncError.js'
import getDataUri from '../utils/dataUri.js'
import ErrorHandler from '../utils/errorHandler.js'
import {Post} from '../models/Post.js'
import {User} from '../models/User.js'


export const createPost=catchAsyncError(async(req,res,next)=>{
    const {caption}=req.body
    const file=req.file
    const fileUri=getDataUri(file)
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)
    await Post.create({
        caption,
        image:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        },
        owner:req.user._id,
    })
    res.status(201).json({
        success:true,
        message:'Post Created'
    })
})



export const deletePost=catchAsyncError(async(req,res,next)=>{
    const {id}=req.params
    const post=await Post.findById(id)
    if(!post)return next(new ErrorHandler('Not Found',404))
    await cloudinary.v2.uploader.destroy(post.image.public_id)
    await post.remove()
    res.status(200).json({
        success:true,
        message:'Post Deleted'
    })
})




export const likeAndUnlikePost=catchAsyncError(async(req,res,next)=>{
    const post=await Post.findById(req.params.id)
    if(!post)return next (new ErrorHandler('Not Found',404))
    if(post.likes.includes(req.user._id)){
        const index=post.likes.indexOf(req.user._id)
        post.likes.splice(index,1)
        await post.save()
        res.status(200).json({
            success:true,
            message:'Unliked'
        })
    }
    else{
        post.likes.push(req.user._id)
        await post.save()
        return res.status(200).json({
            success:true,
            message:'Liked'
        })
    }
})



export const postOfFollowing=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id)
    const posts=await Post.find({
        owner:{
            $in:user.following,
        },
    }).populate('owner likes.user')
    res.status(200).json({
        success:true,
        posts:posts.reverse()
    })
})
