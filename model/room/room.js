const mongoose = require('mongoose');


const Room= new mongoose.Schema({
	To_user: {type: String},
	From_user:{type: String},
	Status : {type:String, default : "Requested"},
	Sender_Id: {type:String},
	Last_Message :{type:Date,default: null},
	Response_Time : {type:Date,default:null},
	Created_At :{type:String},
	Is_Seen :{type:Boolean,default:false}	
});


// collection creation
const model = mongoose.model('room',Room);
module.exports = model;
