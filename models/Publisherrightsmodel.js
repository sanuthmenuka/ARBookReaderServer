const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const publisherrightSchema = new Schema({
    userId:  {
        type : Schema.Types.ObjectId, 
        ref: 'User',   
    },
    bio: {
      type: String,
    },
    haspublishedbefore: {
      type: Boolean,
    },
    previouspublications: {
      type: String,
    },
    status: {
        type: String,
      },
   
  });
  
  module.exports = mongoose.model("Publisherright", publisherrightSchema);
  