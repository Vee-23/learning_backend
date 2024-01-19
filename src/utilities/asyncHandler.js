const asyncHandler = (requestHandler) => async (req, res, next) => {
    // console.log(req,"arroived inn handler")

        console.log("returned required")
        Promise.resolve((requestHandler(req, res, next))).catch((error)=>{
            console.log(error)
            next(error)
        })
    
}

export { asyncHandler }