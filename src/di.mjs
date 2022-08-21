import awilix, {Lifetime} from "awilix";
import {exampleService} from "./services/example.service.mjs";
import {exampleRoutes} from "./routes/example.routes.mjs";
import {exampleController} from "./controllers/example.controller.mjs";
import {app} from "./app.mjs";
import {makeErrorMiddleware} from "./middlewares/error.middleware.mjs";
import {server} from "./server.mjs";
import { Order } from "./models/orders.model.mjs";
import { makeAuthMiddleWare } from "./middlewares/auth.middleware.mjs";
import { User } from "./models/user.model.mjs";
import { userRoutes } from "./routes/user.routes.mjs";
import { userController } from "./controllers/user.controller.mjs";
import { userService } from "./services/user.service.mjs";
import { Article } from "./models/article.model.mjs";
import { articleService } from "./services/article.service.mjs";
import { articleRoutes } from "./routes/article.routes.mjs";
import { articleController } from "./controllers/article.controller.mjs";


export const diContainer = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
})

diContainer.register({
    server: awilix.asFunction(server),
    app: awilix.asFunction(app),
    port: awilix.asValue(process.env.PORT),
    //Services
    exampleService: awilix.asFunction(exampleService),
    userService: awilix.asFunction(userService),
    articleService: awilix.asFunction(articleService),
    //Routes
    exampleRoutes: awilix.asFunction(exampleRoutes),
    userRoutes: awilix.asFunction(userRoutes),
    articleRoutes: awilix.asFunction(articleRoutes),
    //Controllers
    exampleController: awilix.asFunction(exampleController),
    userController: awilix.asFunction(userController),
    articleController: awilix.asFunction(articleController),
    //Middlewares
    errorMiddleware: awilix.asFunction(makeErrorMiddleware),
    authMiddleWare: awilix.asFunction(makeAuthMiddleWare),
    //Other
    //models
    order: awilix.asFunction(Order).setLifetime(Lifetime.SINGLETON),
    dbUser: awilix.asFunction(User).setLifetime(Lifetime.SINGLETON),
    dbArticle: awilix.asFunction(Article).setLifetime(Lifetime.SINGLETON),
})
