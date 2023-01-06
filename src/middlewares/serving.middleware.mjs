export const makeServingMiddleware = ({}) => {
    return (req, res, next) => {
        // If no previous routes match the request, send back the React app.
        res.sendFile(__dirname + "/public/index.html");
      }
}