// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require('lodash');
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

const port = 3000;

// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

// # # # # # VARIABLES # # # # #
var fields = 1;

// # # # # # MONGOOS SCHEMAS # # # # #

const flashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: false,
    maxLength: 500,
    minLength: 1
  },
  answer: {
    type: String,
    required: false,
    maxLength: 500,
    minLength: 1
  },
  hint: {
    type: String,
    required: false,
    maxLength: 200,
    minLength: 1
  }
});

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
    minLength: 1
  },
  flashcards: [flashcardSchema]
});

// # # # # # MONGOOSE MODELS # # # # #

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

const Library = mongoose.model("Library", librarySchema);

// # # # # # GET REQUESTS # # # # #
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/compose", function(req, res) {
  res.render("compose", {
    fields: fields
  });
});

app.get("/libraries", function(req, res) {
  res.render("libraries");
});

app.get("/about", function(req, res) {
  res.render("about");
});
// # # # # # POST REQUESTS # # # # #
app.post("/add-field", function(req, res) {

  if (fields >= 1) {
    const question = req.body


    console.log("question: " + question);

  }

  ++fields;

  res.render("compose", {
    fields: fields
  });

});

app.post("/remove-field", function(req, res) {

  if (fields > 1) {
    --fields;
  }

  console.log(fields);

  res.render("compose", {
    fields: fields
  });

});

app.post("/create", function(req, res) {

console.log("Button Pressed");
console.log(req.body);

});
// # # # # # LISTEN REQUEST # # # # #

app.listen(port, function() {
  console.log(`Server started on port ${port}`)
})
