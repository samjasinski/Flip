// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jsdom = require('jsdom');
const userSchema = require('./models/user');
const flashcardSchema = require('./models/flashcard');
const librarySchema = require('./models/library');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000; // added .env search for port before defaulting to 3000
$ = require('jquery')(new jsdom.JSDOM().window);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

mongoose.connect("mongodb://localhost:27017/flipDB");

// # # # # # MONGOOSE MODELS # # # # #

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

const Library = mongoose.model("Library", librarySchema);

const User = mongoose.model("User", userSchema);

// # # # # # GET REQUESTS # # # # #

app.get("/", function(req, res) {
  res.render("login", {
    errorPasswordIncorrect: "",
    errorUserDoesNotExist: "",
    userEmail: ""
  });
});

app.get("/login", function(req, res) {
  res.render("login", {
    errorPasswordIncorrect: "",
    errorUserDoesNotExist: "",
    userEmail: ""
  });
});

app.get("/register", function(req, res) {
  res.render("register", {
    errorUserExists: "",
    displayName: "",
    userEmail: ""
  });
});

app.get("/home", function(req, res) {
  res.render("home", {
    userName: req.session.user['name']
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/libraries", function(req, res) {
      res.render("libraries", {
        libraries: req.session.user['libraries']
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
      console.log(err);
    } else if (foundUser == null){
      // no user was found
      res.render("login", {
        errorPasswordIncorrect: "",
        errorUserDoesNotExist: "Opps! This email does not exist. Sign up below.",
        userEmail: email
      });
    } else {
      // if user is found
      // check user password matches
      bcrypt.compare(password, foundUser.password, function(err, isMatch) {
        if (err) {
          throw err
        } else if (!isMatch) {
          res.render("login", {
            errorPasswordIncorrect: "Opps! Password does not match.",
            errorUserDoesNotExist: "",
            userEmail: email
          });
        } else {
          // logging user in...
          req.session.user = foundUser;

          res.render("home", {
            userName: req.session.user['name']
          });
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

app.post("/create", async function(req, res) {

  // waits for create button (now an <input>) to be clicked before running the following.
  // was setup like this as for an unknow reason the addButton was causing a post
  // to /create

  if (req.body.createButton == "Create") {


    // create a library
    const library = new Library({
      name: req.body.libraryTitle,
      flashcards: []
    });
    await library.save();

    if (typeof req.body.questionInput == 'string') {

      // create single flashcard
      const flashcard = new Flashcard({
        question: req.body.questionInput,
        answer: req.body.answerInput,
        hint: req.body.hintInput
      })

      await flashcard.save();

      // add new flashcard to library

      await library.flashcards.push(flashcard);

      await library.save();

    } else {

      // create multiple flashcards and add each to the library
      for (i = 0; i < req.body.questionInput.length; i++) {

        const flashcard = new Flashcard({
          question: req.body.questionInput[i],
          answer: req.body.answerInput[i],
          hint: req.body.hintInput[i]
        });

        await flashcard.save();

        await library.flashcards.push(flashcard);

      }
      await library.save();
    };

    // add library to users libraries array
    await User.findByIdAndUpdate(
      {_id: req.session.user['_id']},
      {$push: {libraries: library}}
    );

    // the session data didn't seem to be updating when creating a new library
    // so im getting the currently looged in users information from the mongodb
    // and using it to refresh the list of user "libraries" that are displayed.
    User.findOne({
      email: req.session.user['email']
    }, function(err, loggedInUser){
      if (err) {
        console.log(err);
      } else {
        req.session.user = loggedInUser
      }
    });

    // dodgy fix for libraries page loading before the library had been created
    // im sure I could use async here, just struggling to implement it...

    setTimeout(function() {

        res.render("libraries", {
          libraries: req.session.user['libraries']
        });

    }, 1000)
  }
});

app.post("/display", function(req, res) {

  Library.findById(req.body.libraryId, function(err, library) {

    res.render("display", {
      libraryName: library.name,
      flashcards: library.flashcards
    })
  });
});

app.post("/logout", (req, res, next) => {
  req.session.user = null;
  res.render("login", {
    errorPasswordIncorrect: "",
    errorUserDoesNotExist: "",
    userEmail: ""
  });
});

// # # # # # LISTEN REQUEST # # # # #

app.listen(port, function() {
  console.log(`Server started on port ${port}`)
})
