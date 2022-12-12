const express = require('express'),
  
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  fs = require('fs'),
  Models = require('./models.js');

 
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const app = express();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
require('./passport');


let auth = require('./auth')(app);

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


const cors = require('cors');
app.use(cors());


// const url = "mongodb://127.0.0.1:27017";
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connect(process.env.CONNECTION_URI).then(() => {
  //     console.log("Connected to Database");
  // }).catch((err) => {
    //     console.log("Not Connected to Database ERROR! ", err);
    // });
    
    //fs.createWriteStream is used to create a write stream while path.join appends it to log,txt file
    const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
    app.use(morgan('common', {stream: accessLogStream}));
    app.use(express.static('public'));
    
//log requrests to server
app.use(morgan("common"));

//default text response
app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});


// Get all Movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// get movies by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({Title: req.params.title})
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//get json genre info when looking for specific Genre
app.get("/movies/genres/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({Name: req.params.Genre})
    .then((movies) => {
      res.json(movies.Genre); 
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get info on ddirector when looking for specific Driector
app.get("/movies/directors/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({Name: req.params.Director})
    .then((movies) => {
      res.json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//update user info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
[ 
  check ('Username', 'Username is required').isLength({min: 5}),
  check ('Username', 'Username contains non alphanumeric character - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check ('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array()});
  } 

  Users.findOneAndUpdate({ Username: req.params.Username},
    { 
      $set: {
        Name: req.body.Name,
        Password: req.body.password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      },
    },
    {new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

// Add a movies to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovie: req.params._id }
   },
   { new: true }, 
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Add new users
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

  // check the validation object for errors
let errors = validationResult(require);

if (!errors.isEmpty()) {
  return res.status(422).json({ errors: errors.array() });
}

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//delete a user's favorited movie
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, {
    $pull: { FavoriteMovies: req.params._id }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//PORT
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});