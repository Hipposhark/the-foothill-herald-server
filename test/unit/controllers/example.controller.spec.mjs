import sinon from "sinon";
import {expect} from "chai";
import {exampleController} from "../../../src/controllers/example.controller.mjs";
import {exampleService} from "../../../src/services/example.service.mjs";
import {makeFakeResponse, setupChai} from "../../helper.mjs";

//test
describe("Example controller unit test", () => {
    setupChai()
    const service = sinon.stub(exampleService({}));
    const getController = () => {
        return exampleController({exampleService: service})
    }

    beforeEach(() => {
        sinon.reset()
    })

    it("Should test doSomething", async () => {
        const data = [{test: true}]
        service.getTestData.resolves(data)
        let response = makeFakeResponse()
        await getController().doSomething(null, response)
        expect(response.json).to.have.been.calledWith(data)
        expect(service.getTestData).to.have.been.called;
    })

});