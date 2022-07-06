const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: false,
    maxLength: 500,
    //minLength: 1
  },
  answer: {
    type: String,
    required: false,
    maxLength: 500,
    //minLength: 1
  },
  hint: {
    type: String,
    required: false,
    maxLength: 200,
    //minLength: 1
  }
});

module.exports = flashcardSchema;
