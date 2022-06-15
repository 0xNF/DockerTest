const bcrypt = require("bcryptjs");
const User = require("../models/userModel");


exports.signUp = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
        });
        res.status(201).json({
            status: "successful",
            data: {
                newUser,
            }
        });
    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: "failure",
        });
    }
};

exports.logIn = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({
            username: username
        });
        if (!user) {
            res.status(403).json({
                status: "failure",
                message: "incorrect username or password",
            });
            return;
        }
        const matches = await bcrypt.compare(password, user.password);
        if (matches) {
            res.status(200).json({
                status: "success",
            });
        } else {
            res.status(403).json({
                status: "failure",
                message: "incorrect username or password",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: "failure",
        });
    }
};