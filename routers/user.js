const router = require("express")();
const User = require("../controllers/user");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/", authMiddleware, User.getAll);

module.exports = router;