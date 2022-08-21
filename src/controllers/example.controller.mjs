import {makeError} from "../utils/utils.mjs";

export const exampleController = ({exampleService, order}) => {
    return {
        doSomething: async (req, res) => {
            const newOrder = await order.create({
                state: "accepted"
            });
            const orders = await order.find({})
            console.log("ORDERS", orders)
            res.json("")
        },
        addSomething: async (req, res) => {
            const data = await exampleService.addTestData()
            res.json(data)
        },
        failSomething: async (req, res) => {
            throw makeError(400, "This should always fail!", "Failer!")
        }
    }
}
