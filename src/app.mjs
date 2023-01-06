import express from "express";
import cors from "cors";

export const app = ({userRoutes, articleRoutes, errorMiddleware}) => {
    const app = express()
    app.use(cors())
    app.use(express.json())

    app.use("/user", userRoutes)
    app.use("/article", articleRoutes)

    app.use(errorMiddleware)
    return app
}  