import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { makeError } from '../utils/utils.mjs';

export const makeAuthMiddleWare = ({ dbUser }) => {

    return async (req, res, next) => {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) { 
            next({message: "TOKEN NOT FOUND"})
        }

        try {
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SIGNATURE)
            const user = await dbUser.findById(decoded.id)
            if (!user) next({message: "USER NOT FOUND"})
        } catch (e) {   
            console.log("ERROR", e)
            if (e instanceof SyntaxError) next({ message: "INVALID TOKEN" })
            throw makeError(404, "generic error", "generic_fail")
        }
        next();
    }
}