const asyncHandler = (requestHandler) =>{
    async (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => 
            next(error));
    }
}


export default asyncHandler;  

const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next);
    } catch (error) {
        next(error);
    }
}