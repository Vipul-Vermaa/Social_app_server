import mongoose from 'mongoose'

const schema=new mongoose.Schema({
    caption: String,  

    image: {
        public_id: String,
        url: String,     
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    likes:[
        {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
        },
    ],
})

export const Post=mongoose.model('Post',schema)