const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
            unique: true,
            index: true, //Since we'll make a lot  of Database queries based off the username we want it indexable
            lowercase: true
        },
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        profile: {
            type: String,
            required: true
        },
        hashed_password: { //We used hashedPasswords because we're using Crypto
          type: String,
          required: true
        },
        salt: String, //Defines how strongly we hash the password
        about: {
          type: String
        },
        role: {     //We'll be having a role based authentication system
          type: Number,
          trim: true
        },
        photo: {
          data: Buffer, //Photos will be saved as a Biniary data format in the database
          contentType: String
        },
        resetPasswordLink: { //For forgot Password functionality - generate a token save it in the database, email that token to the user when they click te link theyll be redirected back to the application, app sends token back to the server and ten we check whether its exactly the one stored in the database
            data: String,
            default: ''
        }
    },
    { timestamp: true }
);

userSchema //Virtual fiels to handle password and save as hashed password
    .virtual('password')
    .set(function(password) { //We use a regular function. Arrow functions do not have the dcope for this schema
        // create a temporarity variable called _password
        this._password = password;
        // generate salt
        this.salt = this.makeSalt();
        // encryptPassword
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

userSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function(password) { 
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt) //This cypto module is in the nodeJs official website
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    makeSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()) + ''; //Give us a random nmeric vale for when we're hashing the password
    }
};

module.exports = mongoose.model('User', userSchema);


//Virtual fields just exist they dont get persisted in the database so we van do some work
//We grab the password from the client hash the plain password and save it in our database as a hashed password

