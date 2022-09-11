export const articleService = ({ dbArticle }) => {

    const convertDate = (date) => {
        const l = date.split(" ")
        return `${l[1]}. ${parseInt(l[2])}, ${l[3]}`
    }

    return {
        createArticle: async (body) => {

            const { user } = body
            const name = user.firstName.slice(0, 1).toUpperCase() + user.firstName.slice(1) + " " + user.lastName.slice(0, 1).toUpperCase() + user.lastName.slice(1)

            try {
                const newArticle = await dbArticle.create({
                    category: "news",
                    title: "Untitled Article",
                    authorId: user._id,
                    authorName: name,
                    dateCreated: (new Date()).toString(),
                    dateSaved: (new Date()).toString(),
                    template: "none",
                    imgs: [],
                    content: "<p></p>",
                    preview: "no preview",
                    status: "editing",
                    wordcount: 0,
                });
                return newArticle._id
            } catch (e) {
                throw e
            }
        },
        updateArticle: async (body) => {
            const { articleId, articleChanges } = body
            try {
                console.log("articleChanges: ", articleChanges)
                let updatedArticle;
                updatedArticle = await dbArticle.findByIdAndUpdate(
                    { _id: articleId },
                    articleChanges,
                    { new: true, runValidators: true, }
                ).select('+content');
                return updatedArticle
            } catch (e) {
                throw e
            }
        },
        updateArticleStatus: async (body) => {
            const { articleId, newStatus } = body
            try {
                let updatedArticle;
                updatedArticle = await dbArticle.findByIdAndUpdate(
                    { _id: articleId },
                    { status: newStatus },
                    { new: true, runValidators: true, }
                )
                return updatedArticle
            } catch (e) {
                throw e
            }
        },
        deleteArticle: async (body) => {
            const { articleId } = body

            try {
                const deletedArticle = await dbArticle.findByIdAndDelete({ _id: articleId })
                return deletedArticle
            } catch (e) {
                throw e
            }
        },
        getArticle: async (body) => {
            const { articleId } = body
            try {
                const article = await dbArticle.findById({ _id: articleId }).select('+content')
                console.log("getting article: ", article)//
                return article
            } catch (e) {
                throw e
            }
        },
        getUserArticles: async (body) => {
            const { userId, filters, articlesPerPage, currentArticlesPage } = body
            const { status: statusFilters, category: categoryFilters, date: dateFilters } = filters
            try {
                const allUserArticles = await dbArticle.find({
                    'authorId': {
                        $in: [userId],
                    }
                })

                const filteredUserArticles = allUserArticles.filter((article) => {
                    if (dateFilters.start === "" && dateFilters.end !== "") {
                        const validDate = Date.parse(dateFilters.end) - Date.parse(article.date) > 0
                        return statusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else if (dateFilters.start !== "" && dateFilters.end === "") {
                        const validDate = Date.parse(dateFilters.start) - Date.parse(article.date) < 0
                        return statusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else if (dateFilters.start !== "" && dateFilters.end !== "") {
                        const validDate = Date.parse(dateFilters.end) - Date.parse(article.date) > 0 && Date.parse(dateFilters.start) - Date.parse(article.date) < 0
                        return statusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else {
                        return statusFilters.includes(article.status) && categoryFilters.includes(article.category)
                    }
                })

                const requestedGeneralArticles = filteredUserArticles.filter((article, index) => {
                    return index >= (currentArticlesPage - 1) * articlesPerPage && (index < (currentArticlesPage - 1) * articlesPerPage + articlesPerPage)
                })

                const generalArticles = requestedGeneralArticles.map((article) => ({
                    id: article.id,
                    title: article.title,
                    authorId: article.authorId,
                    authorName: article.authorName,
                    date: convertDate(article.dateSaved),
                    img: article.imgs[0],
                    category: article.category,
                    wordcount: article.wordcount,
                    status: article.status,
                }))

                return {
                    generalArticles: generalArticles,
                    totalGeneralArticles: filteredUserArticles.length,
                }
            } catch (e) {
                throw e
            }
        },
        getPendingArticles: async (body) => {
            const { userId, userRole, articlesPerPage, currentArticlesPage } = body
            try {
                const allPendingArticles = await dbArticle.find({
                    'status': {
                        $in: ["pending"],
                    }
                })

                const requestedPendingArticles = allPendingArticles.filter((article, index) => {
                    return (index >= (currentArticlesPage - 1) * articlesPerPage && (index < (currentArticlesPage - 1) * articlesPerPage + articlesPerPage)) && !(userRole === "editor" && userId === article.authorId)
                })

                const pendingArticles = requestedPendingArticles.map((article) => ({
                    id: article.id,
                    title: article.title,
                    authorId: article.authorId,
                    authorName: article.authorName,
                    date: convertDate(article.dateSaved),
                    img: article.imgs[0],
                    category: article.category,
                    wordcount: article.wordcount,
                }))

                return {
                    pendingArticles: pendingArticles,
                    totalPendingArticles: allPendingArticles.length,
                }

            } catch (e) {
                throw e
            }
        },
        getPublishedArticles: async (body) => {
            const { previewArticlesPerPage, currentHomePage, filter } = body

            try {
                const allPublishedArticles = await dbArticle.find({
                    'status': {
                        $in: ["published"],
                    }
                })

                const categoryFilteredPreviewArticles = allPublishedArticles.filter((article) => {
                    return filter === "" ? true : filter === article.category
                })

                const pageFilteredPreviewArticles = categoryFilteredPreviewArticles.filter((article, index) => {
                    return index >= (currentHomePage - 1) * previewArticlesPerPage && (index < (currentHomePage - 1) * previewArticlesPerPage + previewArticlesPerPage)
                })

                const requestedPreviewArticles = pageFilteredPreviewArticles.map((article) => {
                    return {
                        id: article.id,
                        imgs: article.imgs,
                        category: article.category,
                        title: article.title,
                        author: article.authorName,
                        date: convertDate(article.dateSaved),
                        preview: article.preview,
                    }
                })

                return {
                    previewArticles: requestedPreviewArticles,
                    totalPreviewArticles: categoryFilteredPreviewArticles.length,
                }

            } catch (e) {
                throw e
            }
        },
        getAllArticles: async (body) => {

        },


    }
}