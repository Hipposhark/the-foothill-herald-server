import path from 'path';

export const makeServingMiddleware = ({}) => {
    return (req, res, next) => {
      const __dirname = path.resolve();
        // If no previous routes match the request, send back the React app.
        res.sendFile(__dirname + "/public/index.html");
      }
}