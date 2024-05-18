class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something is wrong",
        errors= [],
        stack="",
        success = false
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = success
        this.errors = errors
        if(stack){
            console.log(stack);
            this.stack = stack
        }else{ 
            Error.captureStackTrace(this,this.constructor)
        }
    }
} 
module.exports =  ApiError;