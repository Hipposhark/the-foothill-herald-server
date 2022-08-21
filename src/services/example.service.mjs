export const exampleService = ({}) => {
    // console.log("IN EXAMPLE SERVICE")
    return {
        getTestData: () => {
            try{
           return database.test.findMany()
            }catch(e){
                throw {
                    title: "error getTest",
                    kind: "kind",
                    status: "404"
                }
            }
        },
        addTestData: () => {
            return database.test.create({data: {name: "test", id: new Date().toISOString()}})
        }
    }
}