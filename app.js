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
  flashcards: {
    type: Array,
    required: false,
  }
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
    if (foundItems.length === 0) {
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

app.post("/create", async function(req, res) {

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

    try {

      if (typeof req.body.questionInput == 'string') {
        await
        function() {
          // create single flashcard
          const flashcard = new Flashcard({
            question: req.body.questionInput,
            answer: req.body.answerInput,
            hint: req.body.hintInput
          })

          flashcard.save();

          // add new flashcard to library
          library.flashcards.push(flashcard);
        };

      } else {

        await

        function() {
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
        };
      }

    } catch (error) {

      console.log("An error occured: " + error);

      res.render("home");

    }


    Library.find({}, await function(err, foundItems) {

      res.render("libraries", {
        libraries: foundItems
      });
    });


  }
});
// # # # # # LISTEN REQUEST # # # # #

app.listen(port, function() {
  console.log(`Server started on port ${port}`)
})
