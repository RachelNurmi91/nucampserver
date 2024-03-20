const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    admin: {
        type: Boolean,
        default: false,
    }
});

//Plugs in passportLocalMongoose to usereSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)