import express from "express"

export const getController = (url) => {
    return url.substring(url.lastIndexOf('/') +1)
}

export const makeError = (status, message, title, type = "about:blank") => {
    return {
        status,
        message,
        title,
        type
    }
}

const wrapAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch((e) => next(e));
    };
}
export const getRouter = () => {
    let router = express.Router()
    return {
        router,
        get: (path, ...handlers) => {
            router.get(path, handlers.map(h => wrapAsync(h)))
        },
        post: (path, ...handlers) => {
            router.post(path, handlers.map(h => wrapAsync(h)))
        },
        put: (path, ...handlers) => {
            router.put(path, handlers.map(h => wrapAsync(h)))
        },
        delete: (path, ...handlers) => {
            router.delete(path, handlers.map(h => wrapAsync(h)))
        }
    }
}