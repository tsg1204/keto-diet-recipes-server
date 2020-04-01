const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RecipeSchema = new Schema({
  category: [],
  title: String,
  imageUrl: String,
  duration: Number,
  date_created: Date,
  ingredients: [],
  steps: [],
  favorite: String
})

module.exports = mongoose.model('Recipes', RecipeSchema)