import mongoose from "mongoose"

// id: i,
// title: "Article Title " + i,
// author: "Edwin Li",
// date: (new Date()).toString(), 
// template: "top", // none, top, bottom, left, right,
// imgs: ["https://3.files.edl.io/2c1f/19/10/27/170652-584e6d14-c77c-4f51-81fd-805f22340a52.jpg"], // file when implemented by database
// content: "",
// category: ["news", "opinion", "sports", "entertainment", "clubs", "advertising"][i%6],
// preview: "Article Preview", // first # characters of article
// status: "published",
// wordcount: 0,


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
        status: {
            type: String,
            required: [true, 'Please Provide an Article Status'],
            enum: ['editing', 'pending', 'rejected', 'published'],
            default: 'editing',
        },
        wordcount: {
            type: Number,
            required: [true, 'Please Provide an Article Wordcount'],
        },
    });
    return mongoose.model('Article', articleSchema); // name of the collection plus 's'
}
