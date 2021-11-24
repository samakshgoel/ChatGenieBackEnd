const adminModel = require('../admin/admin');
const userModel = require('../user/user');

const adminQueryModule = {}

/* Method for finding Admin Data */
adminQueryModule.getAdmin = async function(data){
    return await adminModel.findOne(data)
}

/* Method for Save Admin Data */
adminQueryModule.saveAdmin = async function(data){
    return await adminModel(data).save();
}

/*Method To Get All User Data */
adminQueryModule.getAllUser = async function(){
    return await userModel.find();
}

/*Method To Block User */
adminQueryModule.blockByAdmin = async function(id,action){
    return await userModel.updateOne({_id:id},{$set:{Blocked_By_Admin:action}});
}

/*Method for Reseting Admin password */
adminQueryModule.updateAdminPassword = async function(id,Password){
    return await adminModel.updateOne({_id:id},{$set:{Password:Password}});
}


module.exports = adminQueryModule;