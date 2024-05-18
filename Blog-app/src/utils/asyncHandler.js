 
const asyncHandler = (requestHandler) =>

    async (req, res, next) => {
        try { 
            return await requestHandler(req, res, next);
        } catch (error) {   
            res.status(error.statusCode || 500).json({
                status:error.statusCode,
                success: false,
                message: error.message
            })
        }
    }
module.exports = asyncHandler;