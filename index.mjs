import { diContainer } from "./src/di.mjs"

import mongoose from "mongoose"

require('dotenv').config();
const DATABASE_URL = process.env.MONGODB_URI

mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database")
    diContainer.cradle.server.start()
  });

