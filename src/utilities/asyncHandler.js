const asyncHandler = (requestHandler) => {
    console.log(`in the async handler`)
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }