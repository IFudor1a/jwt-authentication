const {Schema, model} = require("mongoose");

module.exports = model ("User", new Schema({
    login: {type: String, unique: true, required: true},
    password: {type: String, required: true}
}))