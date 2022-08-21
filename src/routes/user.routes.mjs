import {getRouter} from "../utils/utils.mjs";

export const userRoutes = ({userController, authMiddleWare}) => {
    const router = getRouter() // Here you get the proxy router with the already wrapped in promises requests
    router.post("/login", userController.login)
    router.post("/register", userController.register)
    router.post("/authenticateUser", authMiddleWare, userController.authenticateUser)
    router.post("/changePassword", authMiddleWare, userController.changePassword)
    router.post("/updateProfile", authMiddleWare, userController.updateProfile)
    router.post("/deleteUser", authMiddleWare, userController.deleteUser)


    router.post("/getUsers", authMiddleWare, userController.getUsers)

    router.post("/refreshtoken", authMiddleWare, userController.refreshToken)
    return router.router
}
