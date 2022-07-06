const mongoose = require('mongoose');
const librarySchema = require('./library');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 20,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8
  },
  libraries: [librarySchema]
});

module.exports = userSchema;
