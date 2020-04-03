const express = require('express')
const mongoose = require('mongoose')
const Categories = require('./models/categories')
const Recipes = require('./models/recipes')
const bodyParser = require('body-parser')
const ObjectId = require('mongoose').Types.ObjectId
const querySring = require('querystring')
const http = require('http');
const fs = require('fs');
const router = require('express').Router()
let categories = [];
let recipes = [];

const app = express()

//mongoose.connect('mongodb://localhost/loveketo', { useNewUrlParser: true })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/loveketo';
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

if (process.env.NODE_ENV === 'production') {
    // Express will serve up production assets
    // like our main.js file, or main.css file!
    // app.use(express.static('client/build'));
  
    // // Express will serve up the index.html file
    // // if it doesn't recognize the route
    // const path = require('path');
    // app.get('*', (req, res) => {
    //   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    // });
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Setting up the root route
app.get('/', (req, res) => {
    res.send('Welcome to the express server');
});
//test data load api's
app.get('/load-categories', (req, res) => {

    fs.readFile("initial-data/categories.json", "utf8", (error, data) => {
        if (error) throw error;
        categories = JSON.parse(data);
        console.log(`Server setup: ${categories.length} categories loaded`);

        console.log(' print categories after load: ', categories)

        for (let i = 0; i < categories.length; i++) {
            let cat = new Categories()
            cat.id = categories[i].id
            cat.title = categories[i].title
            cat.recipes = []
            cat.save((err) => {
                if (err) throw err
              })
        }
        
      });
      res.end()
})
app.get('/load-recipes', (req, res) => {

    fs.readFile("initial-data/add-data.json", "utf8", (error, data) => {
        if (error) throw error;
        recipes = JSON.parse(data);
        console.log(`Server setup: ${recipes.length} recipes loaded`);

        for (let i = 0; i < recipes.length; i++) {
            let recipe = new Recipes()
            recipe.category = recipes[i].category
            recipe.title = recipes[i].title
            recipe.imageUrl =recipes[i].imageUrl
            recipe.duration = recipes[i].duration
            recipe.ingredients = recipes[i].ingredients
            recipe.steps = recipes[i].steps
            recipe.favorite = recipes[i].favorite
            recipe.save((err) => {
                if (err) throw err
              })
        }

    });
    res.end()
})
//end test data load api's

//get all categories
app.get('/categories', (req, res, next) => {
    Categories.find()
        .exec((err, category) => {
          if (err) {
              return next(err)
          } if(category) {
              res.send(category)
          } else {
            res.status(404);
            return res.end(`Categoris collection is empty`);
            }
        });
})
//get all recipes under the category by category id
app.get('/categories/:categoryId/recipes', (req, res, next) => {
    Categories.find({ _id: req.params.categoryId})
        .populate(
            {path:'recipes'})
        .exec((err, category) => {
          if (err) {
              return next(err)
          } if(category) {
              res.send(category)
          } else {
            res.status(404);
            return res.end(`No recipes for the category id: ${req.params.categoryId}`);
        }
        });
})
//get recipes by id
app.get('/categories/:categoryId/recipes/:recipe', (req, res, next) =>{
    
    Recipes.findOne({ _id: req.params.recipe})
      .exec((err, recipe) => {
          if (err) {
              return next(err)
          } if(recipe) {
              res.send(recipe)
          } else {
            res.status(404);
            return res.end(`Recipe with id ${req.params.recipe} not found`);
        }
        });
})

//toggle a recipe as favorite 
app.put('/categories/:categoryId/recipes/:recipe/toggleFavorite', (req, res) =>{
    
    Recipes.findById(req.params.recipe)
      .exec((err, recipe) => {
          if (err) {
              return send(err)
          } else if(recipe) {
              if (req.body.favorite) {
                recipe.favorite = true
              } else { 
                recipe.favorite = false
              }
              
              recipe.save((err, response) => {
                if (err) {
                    res.send(err)
                } else {
                    //res.status(200);
                    return res.end(`Recipe with id ${req.params.recipe} updated`);
                }
              })
          } else {
            res.status(404);
            return res.end(`Recipe with id ${req.params.recipe} not found`);
        }
        });
})



const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
      }

      console.log(`Server is listening on ${PORT}`);
})