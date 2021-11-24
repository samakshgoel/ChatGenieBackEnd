const mongoose = require('mongoose');

const Image= new mongoose.Schema({
	
	User_Id :{type:String},
    image :{type:String}	
});


// collection creation
const model = mongoose.model('image',Image);
module.exports = model;