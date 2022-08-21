import {getRouter} from "../utils/utils.mjs";

export const exampleRoutes = ({exampleController}) => {
    const router = getRouter() // Here you get the proxy router with the already wrapped in promises requests
    router.get("/",  exampleController.doSomething)
    router.get("/add", exampleController.addSomething)
    router.get("/fail", exampleController.failSomething)
    return router.router;
}
