const asynchandler = (requestHandler) => async (req, res, next) => {
    (req, res, next)=>{
        Promise.resolve((requestHandler(req, res, next))).reject((error)=>{
            next(error)
        })
    }
}

export { asynchandler }