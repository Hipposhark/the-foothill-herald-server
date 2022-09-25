import express from "express";
import cors from "cors";

export const app = ({userRoutes, articleRoutes, servingMiddleware, errorMiddleware}) => {
    const app = express()
    app.use(cors({
        credentials: true,
        origin: [
            'http://localhost:3000', 
            'http://the-foothill-herald.herokuapp.com',         // <-- ADD
            'https://the-foothill-herald.herokuapp.com'         // <-- ADD
        ]
    }))
    app.use(express.json())

    app.use("/user", userRoutes)
    app.use("/article", articleRoutes)

    app.use(servingMiddleware)

    app.use(errorMiddleware)
    return app
}  