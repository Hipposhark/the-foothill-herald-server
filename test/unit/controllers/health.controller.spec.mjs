import sinon from "sinon";
import {expect} from "chai";
import {makeFakeLogger, makeFakeMetrics, makeFakeResponse, setupChai} from "../../helper.mjs";
import {healthController} from "../../../src/controllers/health.controller.mjs";

describe("Health controller unit test", () => {
    setupChai()
    const database = {
        $queryRaw: sinon.stub()
    };
    const logger = makeFakeLogger()
    const metrics = makeFakeMetrics()
    const getController = () => {
        return healthController({
            database,
            logger,
            metrics
        })
    }

    beforeEach(() => {
        sinon.reset()
    })

    it("Should test getHealth", async () => {
        database.$queryRaw.resolves(true);
        let response = makeFakeResponse()
        await getController().getHealth(null, response)
        expect(response.status).to.have.been.calledWith(200);
        expect(response.send).to.have.been.calledWith("OK")
        expect(database.$queryRaw).to.have.been.called;
        expect(metrics.fakes.counter.inc).to.have.been.called;
        expect(metrics.fakes.endTimer).to.have.been.called;
    })

    it("Should test getHealth failing", async () => {
        database.$queryRaw.resolves(false);
        let response = makeFakeResponse()
        await getController().getHealth(null, response)
        expect(response.status).to.have.been.calledWith(503);
        expect(response.send).to.have.been.calledWith(sinon.match("KO"))
        expect(database.$queryRaw).to.have.been.called;
        expect(metrics.fakes.counter.inc).to.have.been.called;
        expect(metrics.fakes.endTimer).to.have.been.called;
    })

});