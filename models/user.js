const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { 
    roles: { STUDENT, TEACHER, ADMIN }, 
    errors: {TO_SHORT_PASSWORD, ROLE_NOT_SUPPORTED} 
} = require('../consts/index');
const { numberRegExp } = require('../consts/index');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new Schema(
  {
    role: {
        type: String,
        enum: {
            values: [STUDENT, TEACHER, ADMIN],
            message: ROLE_NOT_SUPPORTED
        },
        required: true,
        default: STUDENT
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: [8, TO_SHORT_PASSWORD]
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
