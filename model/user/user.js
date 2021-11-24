const mongoose = require('mongoose');

const User= new mongoose.Schema({

	Login_Type :{type:String},
	First_Name: {type: String, },
	Last_Name:{type: String},
	Gender :{type:String, default:null},
	Email : {type: String , unique: true, default: null},
	Password : {type : String , default : null},
	ProfileImage: {type:String, default:null},
	Fb_User_Id: {type:String,default:null},
	Blocked_By_Admin:{type:String, default:false},
	Payment_ID : {type:String,default:null}
});


// collection creation
const model = mongoose.model('user',User);
module.exports = model;