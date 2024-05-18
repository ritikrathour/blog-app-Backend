const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "name is required"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password must have 6 charector"],
    },
    avatar: {
        type: String, 
        default: "data:image/png;base64,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"
        // required:true
    },
    refreshToken: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next()
})
userSchema.methods.IsCorrectPassword = async function (password) {
    return bcrypt.compareSync(password, this.password)
}
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            password: this.password,
            isAdmin: this.isAdmin
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            isAdmin: this.isAdmin
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
module.exports = mongoose.model("User", userSchema);