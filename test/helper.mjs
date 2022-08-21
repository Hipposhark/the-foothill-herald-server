import sinonChai from "sinon-chai";
import chai from "chai";
import sinon from "sinon";
import pino from "pino";
import client from "prom-client";

export const setupChai = () => {
    chai.use(sinonChai)
}

export const makeFakeResponse = () => {
    return {
        json: sinon.stub(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub()
    }
}

export const makeFakeMetrics = () => {
    let counter = {
        inc: sinon.stub()
    }
    let endTimer = sinon.stub().returns(1)
    let gauge = {
        setToCurrentTime: sinon.stub(),
        startTimer: () => endTimer
    }
    return {
        register: null,
        Gauge: () => gauge,
        Counter: () => counter,
        _getClient: () => sinon.stub(),
        fakes: {
            counter,
            gauge,
            endTimer
        }
    }
}
export const makeFakeLogger = () => {
    return sinon.stub(pino())
}
