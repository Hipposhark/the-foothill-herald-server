import { diContainer } from "./src/di.mjs"

import mongoose from "mongoose"

const DATABASE_URL = process.env.DATABASE_URL

mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database")
    diContainer.cradle.server.start()
  });

