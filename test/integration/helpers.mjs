import {GenericContainer, Wait} from "testcontainers";
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import {exec} from "child-process-promise";

export async function makeDockerDatabase() {
    //Startup the docker container
    let server = await new GenericContainer('postgres:10.3-alpine')
        .withEnv('POSTGRES_PASSWORD', 'secret')
        .withEnv('POSTGRES_USER', 'postgres')
        .withEnv('POSTGRES_DB', 'example')
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
        .start();
    let url = `postgresql://postgres:secret@${server.host}:${server.inspectResult.hostPorts[0]}/example`
    //create the prisma client
    let database = new PrismaClient(
        {datasources: { db: { url } }}
    );
    //Here we will run migrations with the docker-container connection string
    await exec(`DATABASE_URL=${url} npm run migrate:apply`)
    return {server, database}
}

export async function stopDockerDatabase({database, server}) {
    await database.$disconnect();
    await server.stop();
}