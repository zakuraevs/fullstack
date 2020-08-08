const mongoose = require('mongoose')

const schema = new mongoose.Schema({

/*
type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]
  }
*/

  title: {
    type: String,
  },
  published: {
    type: Number
  },
  author: {
    type:  String
  },
  genres: [
    {
      type: String
    }
  ]
})

module.exports = mongoose.model('Book', schema)