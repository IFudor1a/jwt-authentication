const jwt = require("jsonwebtoken");
const ApiError = require('../exceptions/api-error');

module.exports  = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            next(ApiError.UnauthorizedError());
        }
        const decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if(!decodedData) {
            next(ApiError.UnauthorizedError());
        }
        req.user = decodedData;
        next();

    } catch (e) {
        console.log(e);
        next(ApiError.UnauthorizedError());
    }
}