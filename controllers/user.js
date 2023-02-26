const Users = require("../modeles/user")

class User {
    async getAll(req, res) {
        const users  = await Users.find()
        return res.json({
            ...users
        });
    }
}

module.exports = new User();