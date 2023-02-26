require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")

const errMiddleware = require("./middlewares/errorMiddleware");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const auth = require("./routers/auth");
const user = require("./routers/user");


app.use(cookieParser());
app.use("/auth", auth);
app.use("/users", user);
app.use(errMiddleware);
const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        app.listen(PORT, () => {
            console.log(`[SERVER] SERVER IS RUNNING ON PORT: ${PORT}`);
        })

        process.on("SIGTERM", () => {
            app.close(() => {
                console.log("[SERVER] SERVER TERMINATED")
            })
        })

    } catch (e) {
        console.error(e)
    }
}

start()