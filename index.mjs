import { diContainer } from "./src/di.mjs";

import mongoose from "mongoose"

const DB = "mongodb+srv://Hipposhark:Hipposhark@foothillherald.nil8mdx.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database")
    diContainer.cradle.server.start()
  });

