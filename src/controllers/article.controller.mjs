export const articleController = ({ articleService }) => {

    const convertDate = (date) => { // converts epoch date to string 'month. day, year'
        const convertedDate = new Date(date).toString()
        const l = convertedDate.split(" ")
        return `${l[1]}. ${parseInt(l[2])}, ${l[3]}`
    }

    const capitalize = (phrase) => {
        const exceptions = ['and', 'a', 'an', 'to', 'for', 'in', 'the', 'at', 'on', 'of', 'from']
        return phrase.split(" ").map((word, i) => {
            return i == 0 ? word.slice(0, 1).toUpperCase() + word.slice(1) :
                exceptions.includes(word.toLowerCase()) ? word.toLowerCase() :
                    word.slice(0, 1).toUpperCase() + word.slice(1)
        }).join(" ")
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
                let s = "<p style='word-wrap: break-word; line-height:2;'>"
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

    const getIndicesOf = (searchStr, str) => {
        let searchStrLen = searchStr.length
        if (searchStrLen == 0) {
            return []
        }
        let startIndex = 0, index, indices = []
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index)
            startIndex = index + searchStrLen
        }
        return indices
    }

    const getHtmlImage = (src, position) => {
        switch (position) {
            case "left":
                return `<img src=${src} style="float:left; width:400px; padding-right: 20px; padding-bottom: 20px;"/>`
            case "right":
                return `<img src=${src} style="float:right; width:400px; padding-left: 20px; padding-bottom: 20px;"/>`
            case "middle":
                return `
                        <div style="max-width:500px; display: flex; justify-content: center; margin-left: auto; margin-right: auto; padding: 20px;">
                            <img src=${src} style="max-width:500px;"/>
                        </div>
                    `
            default:
                return `<img src=${src} style="float:right; width:400px; padding-left: 20px; padding-bottom: 20px;"/>`
        }
    }

    const htmlWithImage = (str, imgs) => { // formats content with imgs based on template
        const splittedHtml = splitHtmlString(str)

        const splittedHtmlWithImages = splittedHtml.map(paragraph => {

            if (paragraph.includes('<span class="editor-image">')) {
                let newParagraph = ""
                const startSpanTagsIndicies = getIndicesOf('<span class="editor-image">', paragraph)
                const unfilteredEndSpanTagsIndicies = getIndicesOf("</span>", paragraph)
                let startIndexIndex = 0
                const endSpanTagsIndicies = unfilteredEndSpanTagsIndicies.filter((endIndex) => { // removes inline style spans
                    const startIndex = startSpanTagsIndicies[startIndexIndex]
                    if (endIndex-startIndex === 34) { // margin of 9 images
                        startIndexIndex++
                        return true
                    } else{
                        return false
                    }
                })

                startSpanTagsIndicies.forEach((startIndex, i) => {
                    const imgNum = parseInt(paragraph.slice(startIndex, endSpanTagsIndicies[i]).split(' ')[2])
                    const image = imgs.filter(image => image.num === imgNum)[0]
                    const htmlImageTag = getHtmlImage(image.url, image.position)
                    if (i == 0){
                        newParagraph = newParagraph + paragraph.slice(0, startIndex) + htmlImageTag
                    } else {
                        newParagraph = newParagraph + paragraph.slice(endSpanTagsIndicies[i-1]+7, startIndex) + htmlImageTag
                    }
                })
                newParagraph = "<div>" + newParagraph + paragraph.slice(endSpanTagsIndicies[endSpanTagsIndicies.length-1]+7) + "</div>"
                return newParagraph
            }

            return paragraph
        })
        
        const htmlWithImages = splittedHtmlWithImages.join('')
        return htmlWithImages
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
            const articleToEdit = await articleService.getArticle({ articleId })

            if (userId === articleToEdit.authorId || userRole === "editor" || userRole === "owner") {
                console.log("loaded article")
                res.status(201).json(articleToEdit)
            } else {
                res.status(401).json({
                    error: "Invalid User Id or Role"
                })
            }
        },

        updateArticle: async (req, res) => {
            const userId = req.body.userId
            const articleId = req.body.currEditingArticleId
            const article = req.body.currEditingArticle
            const cleanedContent = cleanHtmlString(article.content)
            const articleChanges = {
                category: article.category,
                title: article.title,
                dateSaved: article.date,
                // template: article.template,
                content: article.content,
                editorComment: article.editorComment,
                status: article.status,
                previewImg: article.previewImg,
                imgs: article.imgs,
                wordcount: article.wordcount,
                preview: cleanedContent.slice(0, 110) + "...",
            }
            const updatedArticle = await articleService.updateArticle({ articleId, articleChanges })

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
            const deletedArticle = await articleService.deleteArticle({ articleId })

            if (userId === deletedArticle.authorId) {
                console.log("deleted article")
                res.status(201).json(deletedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        approveArticle: async (req, res) => {
            const userId = req.body.userId
            const articleId = req.body.currEditingArticleId
            const article = req.body.pendingArticle
            const cleanedContent = cleanHtmlString(article.content)
            const articleChanges = {
                category: article.category,
                title: article.title,
                dateSaved: article.date,
                // template: article.template,
                content: article.content,
                editorComment: article.editorComment,
                status: article.status,
                previewImg: article.previewImg,
                imgs: article.imgs,
                wordcount: article.wordcount,
                preview: cleanedContent.slice(0, 110) + "...",
            }
            const pendingArticle = await articleService.updateArticle({ articleId, articleChanges })

            if (userId === pendingArticle.authorId) {
                console.log("waiting article approval")
                res.status(201).json(pendingArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Id"
                })
            }
        },

        rejectArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currEditingArticleId
            const article = req.body.rejectedArticle
            const cleanedContent = cleanHtmlString(article.content)
            const articleChanges = {
                category: article.category,
                title: article.title,
                dateSaved: article.date,
                // template: article.template,
                content: article.content,
                editorComment: article.editorComment,
                status: article.status,
                previewImg: article.previewImg,
                imgs: article.imgs,
                wordcount: article.wordcount,
                preview: cleanedContent.slice(0, 110) + "...",
            }

            if (userRole === "editor" || userRole === "owner") {
                const updatedArticle = await articleService.updateArticle({ articleId, articleChanges })
                console.log("rejected article")
                res.status(201).json(updatedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Role"
                })
            }
        },

        publishArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currEditingArticleId

            const datePublished = new Date(new Date().getTime() + 86400000).setHours(0, 0, 0, 0)

            if (userRole === "editor" || userRole === "owner") {
                await articleService.updateArticle({ articleId, articleChanges: { datePublished } })
                const publishedArticle = await articleService.updateArticleStatus({ articleId, newStatus: "published" })
                console.log("published article")
                res.status(201).json(publishedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Role"
                })
            }
        },

        archiveArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currArticleId

            if (userRole === "owner") {
                const archivedArticle = await articleService.updateArticleStatus({ articleId, newStatus: "archived" })
                res.status(201).json(archivedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Role"
                })
            }
        },

        unarchiveArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currArticleId

            if (userRole === "owner") {
                const unarchivedArticle = await articleService.updateArticleStatus({ articleId, newStatus: "published" })
                console.log("unarchived article")
                res.status(201).json(unarchivedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Role"
                })
            }
        },

        deleteArchivedArticle: async (req, res) => {
            const userRole = req.body.userRole
            const articleId = req.body.currArticleId

            if (userRole === "owner") {
                const deletedArticle = await articleService.deleteArticle({ articleId })
                console.log("deleted archived article")
                res.status(201).json(deletedArticle)
            } else {
                res.status(401).json({
                    error: "Invalid User Role"
                })
            }
        },



        getGeneralArticles: async (req, res) => {
            const userId = req.body.userId
            const isUserOwner = req.body.isUserOwner
            const filters = req.body.filters
            const articlesPerPage = req.body.generalArticlesPerPage
            const currentArticlesPage = req.body.currentGeneralArticlesPage
            const requestedGeneralArticlesData = await articleService.getGeneralArticles({ userId, isUserOwner, filters, articlesPerPage, currentArticlesPage })
            res.status(201).json(requestedGeneralArticlesData)
        },

        getPendingArticles: async (req, res) => {
            const userId = req.body.userId
            const userRole = req.body.userRole
            const articlesPerPage = req.body.pendingArticlesPerPage
            const currentArticlesPage = req.body.currentPendingArticlePage
            if (userRole === "editor" || userRole === "owner") {
                const requestedPendingArticlesData = await articleService.getPendingArticles({ userId, userRole, articlesPerPage, currentArticlesPage })
                res.status(201).json(requestedPendingArticlesData)
            } else {
                res.status(401).json({
                    error: "Invalid User Role"
                })
            }
        },

        getHomepageArticlePreviews: async (req, res) => {
            const { previewArticlesPerPage, currentHomePage, filter } = req.body
            const { previewArticles: requestedHomepageArticleData, totalPreviewArticles } = await articleService.getPublishedArticles({ previewArticlesPerPage, currentHomePage, filter })

            if (requestedHomepageArticleData) {
                const requestedHomepageArticlePreviewsData = requestedHomepageArticleData.map((article) => ({
                    id: article.id,
                    img: article.previewImg,
                    category: article.category,
                    title: article.title,
                    author: article.author,
                    date: article.datePublished,
                    preview: article.preview,
                }))
                res.status(201).json({ previewArticles: requestedHomepageArticlePreviewsData, totalPreviewArticles })
            } else {
                res.status(401).json({
                    error: "Error Retrieving Homepage Article Previews"
                })
            }
        },

        loadArticleToView: async (req, res) => {
            const articleId = req.body.currViewingArticleId

            const currViewingArticle = await articleService.getArticle({ articleId })

            if (currViewingArticle) {
                let articleDate
                if (currViewingArticle === "published" || currViewingArticle === "archived") {
                    articleDate = currViewingArticle.datePublished
                } else {
                    articleDate = currViewingArticle.dateSaved
                }
                res.status(201).json({
                    id: currViewingArticle._id,
                    title: capitalize(currViewingArticle.title),
                    author: currViewingArticle.authorName,
                    date: convertDate(articleDate),
                    content: htmlWithImage(currViewingArticle.content, /*currViewingArticle.template,*/ currViewingArticle.imgs),
                    category: currViewingArticle.category,
                    wordcount: currViewingArticle.wordcount,
                    status: currViewingArticle.status,
                })
            } else {
                res.status(401).json({
                    error: "Error Retrieving Article"
                })
            }
        },
    }
}
