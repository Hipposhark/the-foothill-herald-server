import {getRouter} from "../utils/utils.mjs";

export const articleRoutes = ({articleController, authMiddleWare}) => {
    const router = getRouter() // Here you get the proxy router with the already wrapped in promises requests
    router.post("/createArticle", authMiddleWare, articleController.createArticle)
    router.post("/loadArticleToEdit", authMiddleWare, articleController.loadArticleToEdit)
    router.post("/updateArticle", authMiddleWare, articleController.updateArticle)
    router.post("/deleteArticle", authMiddleWare, articleController.deleteArticle)

    router.post("/publishEditingArticle", authMiddleWare, articleController.approveArticle)
    router.post("/publishPendingArticle", authMiddleWare, articleController.publishArticle)
    router.post("/rejectPendingArticle", authMiddleWare, articleController.rejectArticle)

    router.post("/getGeneralArticles", authMiddleWare, articleController.getGeneralArticles)
    router.post("/getPendingArticles", authMiddleWare, articleController.getPendingArticles)

    router.post("/getHomepageArticlePreviews", articleController.getHomepageArticlePreviews)

    router.post("/loadArticleToView", articleController.loadArticleToView)


    return router.router;
}
