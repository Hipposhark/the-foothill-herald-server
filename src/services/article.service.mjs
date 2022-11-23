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
                    datePublished: "",
                    template: "none",
                    imgs: [],
                    content: "<p></p>",
                    preview: "no preview",
                    editorComment: "",
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
                const article = await dbArticle.findById({ _id: articleId }).select('+content +dateSaved +datePublished')
                return article
            } catch (e) {
                throw e
            }
        },
        getGeneralArticles: async (body) => {
            const { userId, isUserOwner, filters, articlesPerPage, currentArticlesPage } = body
            const { ownership: ownershipFilters, status: statusFilters, category: categoryFilters, date: dateFilters } = filters

            const updatedStatusFilters = isUserOwner ? statusFilters : statusFilters.filter((status) => status !== "archived")
            const updatedOwnershipFilters = isUserOwner ? ownershipFilters : ownershipFilters.filter((ownership) => ownership !== "all-articles")

            try {
                let allUserArticles

                if (isUserOwner) {
                    if (updatedOwnershipFilters.includes("all-articles") && updatedOwnershipFilters.includes("my-articles")) {
                        allUserArticles = await dbArticle.find().select("+dateSaved")
                    } else if (updatedOwnershipFilters.includes("my-articles")) {
                        allUserArticles = await dbArticle.find({
                            'authorId': {
                                $eq: userId,
                            }
                        }).select("+dateSaved").sort('-dateCreated')
                    } else if (updatedOwnershipFilters.includes("all-articles")) {
                        allUserArticles = await dbArticle.find({
                            'authorId': {
                                $ne: userId,
                            }
                        }).select("+dateSaved").sort('-date')
                        console.log("all")
                    } else{
                        allUserArticles = []
                    }
                } else {
                    allUserArticles = await dbArticle.find({
                        'authorId': {
                            $eq: userId,
                        }
                    }).select("+dateSaved").sort('-date')
                }

                const filteredUserArticles = allUserArticles.filter((article) => {
                    if (dateFilters.start === "" && dateFilters.end !== "") {
                        const validDate = Date.parse(dateFilters.end) - Date.parse(article.date) > 0
                        return updatedStatusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else if (dateFilters.start !== "" && dateFilters.end === "") {
                        const validDate = Date.parse(dateFilters.start) - Date.parse(article.date) < 0
                        return updatedStatusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else if (dateFilters.start !== "" && dateFilters.end !== "") {
                        const validDate = Date.parse(dateFilters.end) - Date.parse(article.date) > 0 && Date.parse(dateFilters.start) - Date.parse(article.date) < 0
                        return updatedStatusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else {
                        return updatedStatusFilters.includes(article.status) && categoryFilters.includes(article.category)
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
                    imgs: article.imgs,
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
                        $eq: "pending",
                    }
                }).select("+dateSaved")

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
                        $eq: "published",
                    }
                }).select('+datePublished')

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
                        date: convertDate(article.datePublished),
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
    }
}