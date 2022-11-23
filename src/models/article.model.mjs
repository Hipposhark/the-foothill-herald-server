import mongoose from "mongoose"

export const Article = () => {
    const ImageSchema = new mongoose.Schema({ imgId: String, name: String, url: String });

    const articleSchema = new mongoose.Schema({
        category: {
            type: String,
            required: [true, 'Please Provide a Category'],
            enum: ['news', 'sports', 'entertainment', 'clubs', 'advertisement'],
            default: 'news',
        },
        title: {
            type: String,
            required: [true, 'Please Provide a Title'],
        },
        authorId: {
            type: String,
            required: [true, "Please Provide the Author's Id"],
        },
        authorName: {
            type: String,
            required: [true, "Please Provide the Author's Name"],
        },
        dateCreated: {
            type: String,
            required: [true, 'Please Provide a Creation Date'],
            select: false,
        },
        dateSaved: {
            type: String,
            required: [true, 'Please Provide a Saved Date'],
            select: false, 
        },
        datePublished: {
            type: String,
            required: [false],
            select: false,
        },
        template: {
            type: String,
            required: [true, 'Please Provide a Template'],
            enum: ['none', 'top', 'middle', 'bottom', 'left', 'right', 'top-bottom'],
            default: 'none',
        },
        imgs: {
            type: [ImageSchema],
            required: [false],
            default: [],
        },
        content: {
            type: String,
            required: [true, 'Please Provide Content for the Article'],
            select: false,
        },
        preview: {
            type: String,
            required: [true, 'Please Provide an Article Preview'],
        },
        editorComment: {
            type: String,
            required: [false],
        },
        status: {
            type: String,
            required: [true, 'Please Provide an Article Status'],
            enum: ['editing', 'pending', 'rejected', 'published', 'archived'],
            default: 'editing',
        },
        wordcount: {
            type: Number,
            required: [true, 'Please Provide an Article Wordcount'],
        },
    });
    
    return mongoose.model('Article', articleSchema); 
}
