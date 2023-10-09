import express from "express";
import cors from "cors";

export const app = ({userRoutes, articleRoutes, servingMiddleware, errorMiddleware}) => {

    const corsOptions ={
       origin: [
            "https://vercel.live/link/the-foothill-herald-git-new-i-561fb3-thefoothillherald-gmailcom.vercel.app?via=deployment-domains-list-branch",
            "https://vercel.live/link/the-foothill-herald-3zvlgcisr-thefoothillherald-gmailcom.vercel.app?via=deployment-domains-list-commit",
            "https://the-foothill-herald-thefoothillherald-gmailcom.vercel.app/",
            "https://www.thefoothillherald.com",
            "http://localhost:3000/",
        ]
    }
     
    const app = express()
    app.use(cors("*"))
    app.use(express.json())

    app.use("/user", userRoutes)
    app.use("/article", articleRoutes)

    app.use(servingMiddleware)

    app.use(errorMiddleware)
    return app
}  