const mongoose = require("mongoose");
const DBName = require("../constants.js")
const DBConnection = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DBName}`);
        console.log("Data Base Connected successefully...");
    } catch (error) {
        console.log("Data Base connection failed...", error);
        process.exit(1)
    }
}
module.exports = DBConnection;