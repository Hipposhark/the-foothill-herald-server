export const articleController = ({articleService}) => {

    const convertDate = (date) => {
        const l = date.split(" ")
        return `${l[1]}. ${parseInt(l[2])}, ${l[3]}`
    }

    const cleanHtmlString = (str) => { // removes all tags from string
        let i = 0
        let inTag = false
        let newStr = ""
        while (i < str.length - 1) {
            if (str.slice(i, i + 1) === "<") {
                inTag = true
            }
            if (str.slice(i, i + 1) === ">") {
                inTag = false
            } else if (!inTag) {
                newStr += str[i]
            }
            i++
        }
        return newStr
    }

    const splitHtmlString = (str) => { // returns arr of all string in p tags
        let arr = []
        let i = 0
        while (i < str.length) {
            if (str.slice(i, i + 3) === "<p>") {
                i += 3
                let s = "<p style='word-wrap: break-word;'>"
                while (str.slice(i, i + 4) !== "</p>") {
                    s += str[i]
                    i++
                }
                arr.push(s + "</p>")
            }
            i++
        }
        return arr
    }

    const htmlWithImage = (str, template, imgs) => { // none, top, bottom, left, right
        if (template === "none"){
            return str
        }
    
        const splittedHtml = splitHtmlString(str)
        switch(template){
            case "top":
                return `<img src=${imgs[0]} style = 'width:500px; display: flex; justify-content: center;'/>${splittedHtml.join("")}`
            case "bottom":
                return `${splittedHtml.join("")}<img src=${imgs[0]} style = 'width:500px; display: flex; justify-content: center;'/>`
            case "left":
                return `<img src=${imgs[0]} style = 'float:left; width:500px; padding-right: 20px;'/>${splittedHtml.join("")}`
            case "right":
                return `<img src=${imgs[0]} style = 'float:right; width:500px; padding-left: 20px;'/>${splittedHtml.join("")}`
            default:
                return str
        }
    }

    return {
        createArticle: async (req, res) => {
            const newArticleId = await articleService.createArticle(req.body)
            res.status(201).json(newArticleId)
        },
        loadArticleToEdit: async (req, res) => {
            const userId = req.body.userId
            const userRole = req.body.userRole
            const articleId = req.body.currEditingArticleId
            const articleToEdit = await articleService.getArticle({articleId})

            if (userId === articleToEdit.authorId || userRole === "editor" || userRole === "owner") {
                console.log("loaded article")
                res.status(201).json(articleToEdit)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        updateArticle: async (req, res) => {
            const userId = req.body.userId
            const articleId = req.body.currEditingArticleId
            const article = req.body.currEditingArticle
            const cleanedContent = cleanHtmlString(article.content) 
            let articleChanges
            if (cleanedContent.length < 5){
                articleChanges = {
                    category: article.category,
                    title: article.title,
                    dateSaved: article.date,
                    template: article.template,
                    content: article.content,
                    status: article.status,
                    wordcount: article.wordcount,
                    preview: "no preview",
                }
            } else{
                articleChanges = {
                    category: article.category,
                    title: article.title,
                    dateSaved: article.date,
                    template: article.template,
                    content: article.content,
                    status: article.status,
                    wordcount: article.wordcount,
                    preview: cleanedContent.slice(0, 40),
                }
            }
            
            const updatedArticle = await articleService.updateArticle({articleId, articleChanges})

            if (userId === updatedArticle.authorId) {
                console.log("updated article")
                res.status(201).json(updatedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        deleteArticle: async (req, res) => {
            const userId = req.body.userId
            const articleId = req.body.currEditingArticleId
            const deletedArticle = await articleService.deleteArticle({articleId})
            if (userId === deletedArticle.authorId) {
                console.log("deleted article")
                res.status(201).json({})
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        approveArticle: async (req, res) => {
            const userId = req.body.userId
            const articleId = req.body.currEditingArticleId
            const newStatus = "pending"
            const updatedArticle = await articleService.updateArticleStatus({articleId, newStatus})

            if (userId === updatedArticle.authorId) {
                console.log("waiting article approval")
                res.status(201).json(updatedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        publishArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currEditingArticleId
            const newStatus = "published"

            if (userRole === "editor" || userRole ==="owner") {
                const updatedArticle = await articleService.updateArticleStatus({articleId, newStatus})
                console.log("published article")
                res.status(201).json(updatedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        rejectArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currEditingArticleId
            const newStatus = "rejected"

            if (userRole === "editor" || userRole ==="owner") {
                const updatedArticle = await articleService.updateArticleStatus({articleId, newStatus})
                console.log("rejected article")
                res.status(201).json(updatedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        getGeneralArticles: async (req, res) => {
            const userId = req.body.userId
            const filters = req.body.filters
            const articlesPerPage = req.body.generalArticlesPerPage
            const currentArticlesPage = req.body.currentGeneralArticlesPage
            const requestedGeneralArticlesData = await articleService.getUserArticles({userId, filters, articlesPerPage, currentArticlesPage})
            res.status(201).json(requestedGeneralArticlesData)
        },

        getPendingArticles: async (req, res) => {
            const userId = req.body.userId
            const userRole = req.body.userRole
            const articlesPerPage = req.body.pendingArticlesPerPage
            const currentArticlesPage = req.body.currentPendingArticlePage
            if (userRole === "editor" || userRole ==="owner") {
                const requestedPendingArticlesData = await articleService.getPendingArticles({userId, userRole, articlesPerPage, currentArticlesPage})
                res.status(201).json(requestedPendingArticlesData)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        getHomepageArticlePreviews: async (req, res) => {
            const { previewArticlesPerPage, currentHomePage, filter } = req.body
            const requestedHomepageArticlePreviewsData = await articleService.getPublishedArticles({previewArticlesPerPage, currentHomePage, filter})
            res.status(201).json(requestedHomepageArticlePreviewsData)
        },

        loadArticleToView: async (req, res) => {
            const articleId = req.body.currViewingArticleId
            const currViewingArticle = await articleService.getArticle({ articleId })
            res.status(201).json({
                id : currViewingArticle._id,
                title : currViewingArticle.title,
                author : currViewingArticle.authorName,
                date : convertDate(currViewingArticle.dateSaved),
                content : htmlWithImage(currViewingArticle.content, currViewingArticle.template, currViewingArticle.imgs),
                category : currViewingArticle.category,
                wordcount : currViewingArticle.wordcount,
            })
        },
    }
}
