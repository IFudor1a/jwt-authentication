const {Schema, model} = require("mongoose");

module.exports = model("Token", new Schema(
    {
        RefreshToken: {type: String},
        user: {type: Schema.Types.ObjectId, ref: "User"}
    }))