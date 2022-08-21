import {exampleService} from "../../../src/services/example.service.mjs";
import assert from 'assert';
import {makeDockerDatabase, stopDockerDatabase} from "../helpers.mjs";


// If its an integration test we need to connect to the database, we cannot use arrow-function because we need "this"
describe("Example service integration tests", function(){
    //Set the timeout to atleast 10 seconds as the default 2 second is not enough for the container to start.
    this.timeout(20000);
    let databaseServer;

    before(async () => {
        // makeDockerDatabase exposes the "server" variable ( docker container ) and the "database" variable ( prisma client )
        databaseServer = await makeDockerDatabase()
    })

    const getService = () => {
        return exampleService({
            database: databaseServer.database
        })
    }
    
    it("should return something", async () => {
        await getService().addTestData()
        assert.equal((await databaseServer.database.$queryRaw("select count(*) from test"))[0].count, 1)
    })

    after(async () => {
        await stopDockerDatabase(databaseServer);
    })

})
