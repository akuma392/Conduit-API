var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, require: true },
    username: { type: String, unique: true, require: true },
    password: { type: String, require: true },
    bio: String,
    image: String,

    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followings: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favourites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    var result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};
userSchema.methods.signToken = async function () {
  var payload = { userId: this.id, email: this.email, bio: this.bio };
  try {
    var token = await jwt.sign(payload, 'secret');
    return token;
  } catch (error) {
    return error;
  }
};
userSchema.methods.userJSON = function (token) {
  return {
    name: this.name,
    email: this.email,
    bio: this.bio,
    token: token,
  };
};
userSchema.methods.userJSON1 = function (user) {
  return {
    name: this.name,
    email: this.email,
    bio: this.bio,
    following: user ? user.followings.includes(this._id) : false,
  };
};

userSchema.methods.followingJSON = function (user) {
  
  return {
    username: user.username,
    bio: user.bio,
    email: user.email,
    following: user.followers.includes(this._id),
    image: user.image,
  };
};
var User = mongoose.model('User', userSchema);

module.exports = User;
