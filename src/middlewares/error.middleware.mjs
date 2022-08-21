export const makeErrorMiddleware = ({}) => {
    return (error, req, res, next) => {
        console.log(error.message)
        const errorDetail = {
            type: error.type ?? "about:blank",
            detail: error.message,
            status: error.status  ?? 500,
            title: error.title,
            instance: req.originalUrl
        }
        if(error instanceof Error) {
            errorDetail.stack = error.stack
        }
        res.error = errorDetail
        res.status(error.status ?? 500)
            .contentType("application/problem+json")
            .send(errorDetail)
    }
}