const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
        unique:true
    },
   content:{
    type:String 
   },
   image:{
    type:String,
    default:"url dalo",
   },
   category:{
    type:String,
    default:"uncategorized"
   },
   slug:{
    type:String,
    required:true,
    unique:true
   }
},{timestamps:true});

module.exports = mongoose.model("Post",PostSchema);