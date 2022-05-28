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

mongoose.connect("mongodb://localhost:27017/flashcardsDB");

// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

// # # # # # FUNCTIONS # # # # #



// # # # # # MONGOOS SCHEMAS # # # # #

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
  res.render("compose");
});

app.get("/libraries", function(req, res) {
  Library.find({}, function(err, foundItems) {
    if (foundItems.length == 0) {
      res.render("libraries", {
        libraries: []
      });

    } else {
      res.render("libraries", {
        libraries: foundItems
      });
    }
  });


});

app.get("/about", function(req, res) {
  res.render("about");
});

// # # # # # POST REQUESTS # # # # #

app.post("/create", function(req, res) {

  // waits for create button (now na <input>) to be clicked before running the following.
  // was setup like this as for an unknow reason the addButton was causing a post
  // to /create

  if (req.body.createButton == "Create") {


    // create a library
    const library = new Library({
      name: req.body.libraryTitle,
      flashcards: []
    });
    library.save();

    if (typeof req.body.questionInput == 'string') {

      // create single flashcard
      const flashcard = new Flashcard({
        question: req.body.questionInput,
        answer: req.body.answerInput,
        hint: req.body.hintInput
      })

      flashcard.save();

      console.log(flashcard);

      // add new flashcard to library

      library.flashcards.push(flashcard);

    } else {

      // create multiple flashcards and add each to the library
      for (i = 0; i < req.body.questionInput.length; i++) {

        const flashcard = new Flashcard({
          question: req.body.questionInput[i],
          answer: req.body.answerInput[i],
          hint: req.body.hintInput[i]
        });

        flashcard.save();

        library.flashcards.push(flashcard);

      }
    }

    // dodgy fix for libraries page loading before the library had been created
    // im sure i could use async here, just struggling to implement it...
    setTimeout(function(){

      Library.find({}, function(err, foundItems) {

        res.render("libraries", {
          libraries: foundItems
        });
      });

    }, 1000)

  }
});

app.post("/display", function(req, res) {

  Library.findById(req.body.id, function(err, library) {

    res.render("display0", {
      libraryName: library.name,
      flashcards: library.flashcards
    })
  });

});

// # # # # # LISTEN REQUEST # # # # #

app.listen(port, function() {
  console.log(`Server started on port ${port}`)
})
