const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: {
    type: String,
  },
  author: {
    type: String,
  },
  language: {
    type: String,
  },
  ageCategory: {
    type: String,
  },
  genre: {
    type: String,
  },
  ARcontent: {
    type: String,
  },
  description: {
    type: String,
  },
  tag1: {
    type: String,
  },
  tag2: {
    type: String,
  },
  Link: {
    type: String,
  },
  image: {
    type: String,
  },
  ratings: {
    type: Number,
  },
});

module.exports = mongoose.model("Book", bookSchema);
