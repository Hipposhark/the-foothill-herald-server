import { diContainer } from "./src/di.mjs"
import mongoose from "mongoose"

import('dotenv')
const DATABASE_URL = process.env.DATABASE_URL

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("successfully connected to mongodb")
  diContainer.cradle.server.start()
}).catch((error) => {
  console.log("error connecting to mongodb", error)
})