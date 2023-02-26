const User = require("../modeles/user");
const Token = require("../modeles/token");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');


const issueTokens = async (user) => {
    const refreshToken = jwt.sign({userId: user}, process.env.JWT_REFRESH_SECRET, {expiresIn: "30d"} );
    const accessToken = jwt.sign({userId: user}, process.env.JWT_ACCESS_SECRET, {expiresIn: "1d"});
    await Token.create({refreshToken: refreshToken, user: user});
    return {
        refreshToken,
        accessToken
    };

}

class Auth {
    async login(req, res, next) {
        try {
        const {login, password} = req.body;
        const user = await User.findOne({login: login});
        if(!user) {
            return next(ApiError.UnauthorizedError("User is not registered!"));
        }
        const validatePassword = bcrypt.compareSync(password, user.password);
        if (!validatePassword) {
            return next(ApiError.BadRequest("Password not valid!"));
        }

        const tokens = await issueTokens(user._id);
        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30*24*3600*1000, httpOnly: true});
        return res.json({
            ...tokens
           });
        } catch (e) {
           console.log(e);
           next(e)
        }

    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
            const token = await Token.findOne({refreshToken: refreshToken});
            if (!token) {
                return next(ApiError.UnauthorizedError("Token is not valid!"));
            }
            await Token.deleteOne({refreshToken: refreshToken});
            const tokenPair = await issueTokens(user.userId);
            const tk = await Token.create({refreshToken: tokenPair.refreshToken, user: user.userId});
            res.cookie('refreshToken', tokenPair.refreshToken, {maxAge: 30*24*3600*1000, httpOnly: true});
            return res.json({
                ...tokenPair
            });
        } catch (e) {
            next(e)
        }

    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const token = await Token.findOne({refreshToken: refreshToken});
            if (!token) {
                return next(ApiError.UnauthorizedError("TOKEN IS NOT VALID"));
            }
            const tk = await Token.deleteOne({refreshToken: refreshToken});
            res.clearCookie('refreshToken');
            return res.status(200).json({message: tk})
        } catch (e) {
            next(e)
        }
    }

    async register(req, res, next) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при регистрации", errors.array()))
            }
            const {login, password} = req.body;
            if (!login || !password) return res.status(403).send("No Password Or Email!");
            let user = await User.findOne({login: login, password: password});
            if (user) {
                return next(ApiError.UnauthorizedError("User have been already in database!"));
            }
            const hashPassword = await bcrypt.hash(password, 10);
            if (!hashPassword) {
                return next(ApiError.UnauthorizedError("no Password!"));
            }
            user = await User.create({login: login, password: hashPassword});
            const tokens = await issueTokens(user._id);
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30*24*3600*1000, httpOnly: true});
            return res.json({
                ...tokens
            });
        } catch (e) {
            console.log(e);
            next(e)
        }
    }
}


module.exports = new Auth();