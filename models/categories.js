const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategorySchema = new Schema({
  id: String,
  title: String,
  recipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipes'
  }]
})

module.exports = mongoose.model('Categories', CategorySchema)