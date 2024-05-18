const cloudinary = require("cloudinary").v2;
const fs = require("fs")
cloudinary.config({
    cloud_name:"dgylu8hez",
    api_key:"755519941924983",
    api_secret:"LfMX4ZZy1Mi-VKNvgqrfMNq5oGU"
})
const uploadOnCloudinary = async(filePath)=>{ 
    try {
        if(!filePath) return null;
        const response =  await cloudinary.uploader.upload(filePath,{
            resource_type:"auto"
        })   
        fs.unlink(filePath)
        return response;
    } catch (error) {
        fs.unlink(filePath)
        console.error(error)
    }
}
module.exports = {uploadOnCloudinary};