const mongoose = require('mongoose');

const Chat= new mongoose.Schema({

	Message: {type: String},
	Message_Type : {type:String, default:'Text'},
	User_Id:{type: String},
	Room_Id :{type:String},
	Deleted : {type:Boolean, default:false},
	Is_Seen :{type:Boolean,default:false},
	Created_At : {type: Date, default: Date.now()},
    Updated_At : {type : Date , default :Date.now()}
	
});


// collection creation
const model = mongoose.model('chat',Chat);
module.exports = model;