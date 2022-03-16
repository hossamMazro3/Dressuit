const mongoose = require("mongoose");
var validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "please enter your user name"],
    },
    fullName: {
      type: String,
      required: [true, "please enter your user name"],
    },
    email: {
      type: String,
      required: [true, "please enter your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      minlength: [6, "minimum password is 6 charecter"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    birthday: { type: Date },
    phoneNumber: [
      {
        type: String,
      },
    ],
    address: [
      {
        type: String,
      },
    ],
    image: {
      type: String,
      default: "uploads\\defualtProfile_Img.png",
    },
    products:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // genSalt & hash is async so,
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
// schma,statics. => after this create ur owen function
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

module.exports = mongoose.model("User", userSchema);
