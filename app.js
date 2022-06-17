// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000; // added .env search for port before defaulting to 3000

var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/flipDB");

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
})

// # # # # # MONGOOSE MODELS # # # # #

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

const Library = mongoose.model("Library", librarySchema);

const User = mongoose.model("User", userSchema);

// # # # # # GET REQUESTS # # # # #

app.get("/", function(req, res) {
  res.render("login");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register", {
    errorUserExists: "",
    displayName: "",
    userEmail: ""
  });
});

app.get("/home", function(req, res) {
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

app.post("/login", function(req, res) {
  const email = req.body.userEmail;
  const password = req.body.userPassword

  User.findOne({
    email: email
  }, function(err, foundUser) {
    if (err) {
      console.log(err)
    } else { // if user is found

      // check user password matches
      bcrypt.compare(password, foundUser.password, function(err, isMatch) {
        if (err) {
          throw err
        } else if (!isMatch) {
          console.log("Password doesn't match!")
        } else {
          console.log("Password matches!")
        }
      })
    }
  })
});

app.post("/register", function(req, res) {
  const displayName = req.body.displayName;
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword

  User.findOne({
    email: userEmail
  }, async function(err, foundUser) {

    if (foundUser) {

      res.render("register", {
        errorUserExists: "A user with that email already exists",
        displayName: displayName,
        userEmail: userEmail
      });

    } else {

      // 10 is a good standard value to use here, makes it fairly secure while being quick
      const hashedUserPassword = await bcrypt.hash(userPassword, 10);

      const newUser = new User({
        name: displayName,
        email: userEmail,
        password: hashedUserPassword,
        libraries: []
      });

      newUser.save()

      // user successfully created, redirecting to login page..
      res.redirect("/login");

    }

  })
});

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
    setTimeout(function() {

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

    res.render("display", {
      libraryName: library.name,
      flashcards: library.flashcards
    })
  });

});

// # # # # # LISTEN REQUEST # # # # #

app.listen(port, function() {
  console.log(`Server started on port ${port}`)
})
