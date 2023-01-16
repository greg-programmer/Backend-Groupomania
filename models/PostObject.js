//Object pour la sauce//

const mongoose = require('mongoose');
const thingSchemaCreate = mongoose.Schema({
    userId: { type: String, required: true },
    content: { type: String, required: true }, 
    imageUrl: { type: String},
    likes: { type: Number },  
    usersLiked :[String,Number], 
},
{
    timestamps:true
}
)
//Pour pouvoir lire notre schéma//
module.exports = mongoose.model('PostUser', thingSchemaCreate);