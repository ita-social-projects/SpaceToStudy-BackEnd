const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { roles: { STUDENT, TEACHER, ADMIN } } = require('../consts/index');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new Schema(
  {
    role: {
        type: String,
        enum: [STUDENT, TEACHER, ADMIN],
        required: true,
        default: STUDENT
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    }
  }
)

userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
        
            user.password = hash;
            next();
        });
    });
});
     
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema)
