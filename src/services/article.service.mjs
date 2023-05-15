export const articleService = ({ dbArticle }) => {

    const convertDate = (date) => { // converts epoch date to string 'month. day, year'
        const convertedDate = new Date(date).toString()
        const l = convertedDate.split(" ")
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
                    dateCreated: (new Date()).getTime(),
                    dateSaved: (new Date()).getTime(),
                    datePublished: null,
                    template: "none",
                    previewImg: null,
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
                ).select('+content +imgs +authorName');
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
                const article = await dbArticle.findById({ _id: articleId }).select('+content +imgs +dateSaved +datePublished +authorId +authorName')
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
                        allUserArticles = await dbArticle.find().select('+dateSaved +imgs').sort({dateSaved: -1})
                    } else if (updatedOwnershipFilters.includes("my-articles")) {
                        allUserArticles = await dbArticle.find({
                            'authorId': {
                                $eq: userId,
                            }
                        }).select('+dateSaved +imgs').sort({dateSaved: -1})
                    } else if (updatedOwnershipFilters.includes("all-articles")) {
                        allUserArticles = await dbArticle.find({
                            'authorId': {
                                $ne: userId,
                            }
                        }).select('+dateSaved +imgs').sort({dateSaved: -1})
                    } else{
                        allUserArticles = []
                    }
                } else {
                    allUserArticles = await dbArticle.find({
                        'authorId': {
                            $eq: userId,
                        }
                    }).select('+dateSaved +imgs').sort({dateSaved: -1})
                }

                const filteredUserArticles = allUserArticles.filter((article) => {
                    if (dateFilters.start < 0 && dateFilters.end > 0) { // default value is -1
                        const validDate = dateFilters.end - article.dateSaved > 0
                        return updatedStatusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else if (dateFilters.start > 0 && dateFilters.end > 0) {
                        const validDate = dateFilters.start - article.dateSaved < 0
                        return updatedStatusFilters.includes(article.status) && categoryFilters.includes(article.category) && validDate
                    } else if (dateFilters.start > 0 && dateFilters.end > 0) {
                        const validDate = dateFilters.end - article.dateSaved > 0 && dateFilters.start - article.dateSaved < 0
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
                    previewImg: article.previewImg,
                    authorId: article.authorId,
                    authorName: article.authorName,
                    dateSaved: convertDate(article.dateSaved),
                    category: article.category,
                    wordcount: article.wordcount,
                    status: article.status,
                    imgs: article.imgs,
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
                }).select("+dateSaved").sort({dateSaved: -1})

                const requestedPendingArticles = allPendingArticles.filter((article, index) => {
                    return (index >= (currentArticlesPage - 1) * articlesPerPage && (index < (currentArticlesPage - 1) * articlesPerPage + articlesPerPage)) && !(userRole === "editor" && userId === article.authorId)
                })

                const pendingArticles = requestedPendingArticles.map((article) => ({
                    id: article.id,
                    title: article.title,
                    authorId: article.authorId,
                    authorName: article.authorName,
                    dateSaved: convertDate(article.dateSaved),
                    previewImg: article.previewImg,
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
                }).select('+datePublished').sort({datePublished: -1})

                const categoryFilteredPreviewArticles = allPublishedArticles.filter((article) => {
                    return filter === "" ? true : filter === article.category
                })
                
                const dateFilteredPreviewArticles = categoryFilteredPreviewArticles.filter((article) => {
                    return new Date().getTime() >= article.datePublished 
                })

                const pageFilteredPreviewArticles = dateFilteredPreviewArticles.filter((article, index) => {
                    return index >= (currentHomePage - 1) * previewArticlesPerPage && (index < (currentHomePage - 1) * previewArticlesPerPage + previewArticlesPerPage)
                })

                const requestedPreviewArticles = pageFilteredPreviewArticles.map((article) => {
                    return {
                        id: article.id,
                        previewImg: article.previewImg,
                        category: article.category,
                        title: article.title,
                        author: article.authorName,
                        datePublished: convertDate(article.datePublished),
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