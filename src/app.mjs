import express from "express";
import cors from "cors";

export const app = ({userRoutes, articleRoutes, servingMiddleware, errorMiddleware}) => {

    const corsOptions ={
       origin: [
            "https://vercel.live/link/the-foothill-herald-git-new-i-561fb3-thefoothillherald-gmailcom.vercel.app?via=deployment-domains-list-branch",
            "https://vercel.live/link/the-foothill-herald-3zvlgcisr-thefoothillherald-gmailcom.vercel.app?via=deployment-domains-list-commit",
            "https://the-foothill-herald-thefoothillherald-gmailcom.vercel.app/",
            "https://www.thefoothillherald.com",
        ], 
       credentials:true,
       optionSuccessStatus:200,
    }
     
    const app = express()
    app.use(cors(corsOptions))
    app.use(express.json())

    app.use("/user", userRoutes)
    app.use("/article", articleRoutes)

    app.use(servingMiddleware)

    app.use(errorMiddleware)
    return app
}  