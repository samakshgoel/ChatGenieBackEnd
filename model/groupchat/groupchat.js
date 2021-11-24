const mongoose = require('mongoose');

let Is_Seen = new mongoose.Schema({
    User_Id : { type : mongoose.Schema.ObjectId}
})

const groupChat= new mongoose.Schema({

	Message: {type: String},
	Message_Type : {type:String,default:'Text'},
	User_Id:{type : mongoose.Schema.ObjectId},
	Group_Id :{type:mongoose.Schema.ObjectId,required: true },
	Deleted : {type:Boolean, default:false},
	Is_Seen :[Is_Seen],
	Created_At : {type: Date, default: Date.now()},
    Updated_At : {type : Date , default :Date.now()},
    Deleted_At : {type: Date, default : null}
	
});


// collection creation
const model = mongoose.model('groupchat',groupChat);
module.exports = model;