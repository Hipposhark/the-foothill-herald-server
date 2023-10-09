import express from "express";
import cors from "cors";

export const app = ({userRoutes, articleRoutes, servingMiddleware, errorMiddleware}) => {
    const app = express()
    app.use(cors({origin: "*"}))
    app.use(express.json())

    app.use("/user", userRoutes)
    app.use("/article", articleRoutes)

    app.use(servingMiddleware)

    app.use(errorMiddleware)
    return app
}  
