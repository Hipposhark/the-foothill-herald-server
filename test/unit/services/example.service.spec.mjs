import {exampleService} from "../../../src/services/example.service.mjs";
import {setupChai} from "../../helper.mjs"
import sinon from "sinon";
import {expect} from "chai";

describe("Example service unit tests", () => {

    setupChai()

    const databaseMock = {
        test: {
            findMany: sinon.stub(),
            create: sinon.stub()
        }
    }

    const getService = () => {
        return exampleService({
            database: databaseMock
        })
    }
    beforeEach(() => {
        sinon.reset()
    })

    it("should call the mock of create", async () => {
        await getService().addTestData()
        expect(databaseMock.test.create).to.have.been.called;
    })
    it("should call the mock of findMany", async () => {
        await getService().getTestData()
        expect(databaseMock.test.create).not.to.have.been.called;
        expect(databaseMock.test.findMany).to.have.been.called;
    })

})
