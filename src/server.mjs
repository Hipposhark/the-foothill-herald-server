export const server = ({port, app}) => {
    return {
        app: app,
        start: () => {
            app.listen(port, (error) => {
                if (error){
                    console.log(error)
                } else{
                    console.log(`listening on port ${port}...`)
                }
            })
        }
    }
}