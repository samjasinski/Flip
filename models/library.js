const mongoose = require('mongoose');
const flashcardSchema = require('./flashcard');
const requiredString = require('./utils');

const librarySchema = new mongoose.Schema({
  name: {
    ...requiredString, // ... destrctures the object/array
    maxLength: 100,
    minLength: 1
  },
  flashcards: [flashcardSchema]
});

module.exports = librarySchema;
