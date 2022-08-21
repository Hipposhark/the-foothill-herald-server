import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { makeError } from '../utils/utils.mjs';

export const makeAuthMiddleWare = ({ dbUser }) => {

    return async (req, res, next) => {
        let token;
        //HEADERS 

        // {expire: 60000, id: 123} + secret => "JWT STRING TOKEN" =try to decrypt the jwt using my secret> {expire: 60000, id: 123}

        // {

        //    Authorization: "Bearer asdjkbnakjdn123" => ["Bearer", "asdjkbnakjdn123"]

        //}

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) { 
            next({message: "TOKEN NOT FOUND"})
        }

        try {
            const decoded = await promisify(jwt.verify)(token, "supersecretstring"); //extract data + verify ownership
            const user = await dbUser.findById(decoded.id);
            if (!user) next({message: "USER NOT FOUND"})
        } catch (e) {   
            console.log("ERROR", e)
            if (e instanceof SyntaxError) next({ message: "INVALID TOKEN" })
            // next({ message: "GENERIC ERROR" })
            throw makeError(404, "generic error", "generic_fail")
           //throw {message:"GENERIC"}
        }
        //Grant access to proteced route
        next();
    }
}