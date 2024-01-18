const asyncHandler = (requestHandler) => async (req, res, next) => {
    return (req, res, next)=>{
        Promise.resolve((requestHandler(req, res, next))).reject((error)=>{
            next(error)
        })
    }
}

export { asyncHandler }