
const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, NODE_PORT, NODE_ENV, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require("./config/config");
const express = require("express");
const mongoose = require("mongoose");
const timersPromises = require('timers/promises');
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
let redisStore = require("connect-redis")(session);



const app = express();

const mongoURL = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;



async function connectWithRetry() {
    let connected = false
    while (!connected) {
        try {
            await mongoose.connect(mongoURL);
            connected = true;
        } catch (e) {
            console.log("Failed to connect to mongo database", e);
            await timersPromises.setTimeout(5_000);
        }
    }
}

async function createRedis() {
    const url = `redis://${REDIS_URL}:${REDIS_PORT}`;

    console.log("Redis Url: " + url);

    let redisClient = redis.createClient({
        url: url,
    });

    try {
        await redisClient.connect();
        console.log("Connected to redis");
        return redisClient;
    } catch (e) {
        console.log("failed to create redis client", e);
        exit();
    }
}

function createSession(redisClient) {
    const s = session({
        store: new redisStore({
            client: redisClient,
        }),
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: false,
            maxAge: 30_000,
        }
    });

    return s;
}

async function main() {

    console.log(new Date());

    await connectWithRetry();

    app.enable("trust proxy");

    // const redisClient = await createRedis();
    // const sess = createSession(redisClient);

    // app.use(sess);

    app.use(express.json());
    app.use(cors());

    app.get("/api/v1", (req, res) => {
        console.log("hello from hello");
        res.send(`ay with port ${NODE_PORT} on runtime?: ${NODE_ENV}`);
    });

    app.use("/api/v1/posts", postRouter);
    app.use("/api/v1/users", userRouter);

    app.listen(NODE_PORT, () => {
        console.log(`listening on port ${NODE_PORT}`);
    });
}

main();