const router = require('express')();
const Auth = require("../controllers/auth");
const {check} = require("express-validator");

router.post("/login", Auth.login);
router.get("/refresh", Auth.refresh);
router.get("/logout", Auth.logout);
router.post("/register", [
    check('login', 'Имя пользователя не может быть пустым').notEmpty(),
    check('login', 'Логин не является email').isEmail(),
    check('password', "Пароль не может быть менешь 8 символов").isLength({min:8})
], Auth.register);

module.exports = router;