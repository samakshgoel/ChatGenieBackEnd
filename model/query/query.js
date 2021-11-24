const userModel = require('../user/user');
const chatModel = require('../chat/chat');
const roomModel = require('../room/room');
const groupModel = require('../group/group');
const groupchatModel = require('../groupchat/groupchat');
const { ObjectId } = require('bson');

const queryModule = {}

/* Function to find User deatils */
queryModule.getUser = async function(data){
    return await userModel.findOne(data)
}

/* Function to Save User details */ 
queryModule.saveUser = async function(data){
    return await new userModel(data).save();
}

/* Method for updating Payment Customer ID */
queryModule.saveCustomerId = async function(Email,id){
    return await userModel.updateOne({Email:Email},{$set:{Payment_ID:id}})
}

/* Function to Save Chat Message */
queryModule.saveChatMessage = async function(data){
    return await new chatModel(data).save();
}

 /* Function to get All User Names */
queryModule.getUserByName = async function(data){
    return await userModel.find({$and :[{First_Name : new RegExp(data.name,'i')},{_id:{$ne:data._id}},{Blocked_By_Admin:{$ne:true}} ]}).skip(data.skip).limit(data.limit)
}

/* Function Use to find room in getalluser API */
queryModule.findRoomInAllUser = async function(myId,userId){
    return await roomModel.findOne({$or :
        [
            {
                $and : [
                    {To_user:myId} , 
                    {From_user:userId}
                    

                ]
            },
            {
                $and : [
                    {To_user:userId} , 
                    {From_user:myId}
                ]
            }
        ]
    })
}

/* Function for Uploading Image */
queryModule.uploadImage = async function(id,path){
    return await userModel.updateOne({_id:id},{$set:{ProfileImage:path}})
}

/* Function for update self details  */
queryModule.updateUserDetails = async function(id,data){
    return await userModel.updateOne({_id:id},{$set:data})
}

/* Method for Update Password for user */
queryModule.updateResetPassword = async function(id,password){
    return await userModel.updateOne({_id:id},{Password:password})

}

/* Method to find friend */
queryModule.IsFriendshipExist = async function(data){

    return await roomModel.findOne({$or :[
        {$and : [{To_user:data._id} , {From_user:data.__id}]},
        {$and : [{To_user:data.__id} , {From_user:data._id}]}

    ]})
}

/* Method for Adding Friend */
queryModule.saveData = async function(data){
    return await roomModel(data).save();
}

/* Method for update add friend data */
queryModule.updateAddFriend = async function(data, id){
    console.log("idididi",id)
    return await roomModel.updateOne({_id:data},{$set:{Status:"Requested", Response_Time:Date.now(),Sender_Id:id , Is_Seen:false,Last_Message : Date.now(),Created_At : Date.now()}})
}
   
// /* Method for getting friend list */
queryModule.getFriendList = async function(data){
    return await roomModel.find({$and :
        [
            {
                $or : [
                    {To_user:data} , 
                    {From_user:data}
                ]
            },
            {
                $or : [
                    {Status :"Requested"} , 
                    {Status :"Friend"}
                ]
            }
            

        ]
    }).sort( { Last_Message: -1 } )
}

// queryModule.getFriendList = async function(data){
//     return await roomModel.aggregate([
//         {
//           $match: {$and :
//           [
//               {
//                   $or : [
//                       {To_user:data} , 
//                       {From_user:data}
//                   ]
//               },
//               {
//                   $or : [
//                       {Status :"Requested"} , 
//                       {Status :"Friend"}
//                   ]
//               }
              
  
//           ]
//         }
//         },
//         {
//             $project: {
//              To_user: '$To_user', From_user: '$From_user', Status: '$Status',Sender_Id:"$Sender_Id",Last_Message:"$Last_Message", Response_Time:"$Response_Time", Is_Seen:"$Is_Seen"
//             }
//         },
//         {
//           $sort: { Last_Message: -1 }
//         }
//       ])
// }

/* Method for accepting friend request */
queryModule.acceptFriendRquest = async function(id, action){
    return await roomModel.updateOne({_id:id},{$set:{Status:action, Is_Seen:true}}) 
}

/* Method to check room friendship status */
queryModule.areFriends = async function(data){
    return await roomModel.findOne({_id:data})
}
/* Method to unfriend */
queryModule.unfriend = async function(data){
    return await roomModel.updateOne({_id:data._id},{$set:{Status:"Add", Sender_Id:data.Sender_Id}})
}

/* Method for block the user */
queryModule.blockUser = async function(data, id, Action ){
    return await roomModel.updateOne({_id:data._id},{$set:{Status:Action, Sender_Id:id}})
}

/* Method for getting Block list */
queryModule.getBlockList = async function(data){
    return await roomModel.aggregate([
        {
            $match:{$and :
                [
                    {
                        $or : [
                            {"To_user":data} , 
                            {"From_user":data}
                        ]
                    },
                    {
                        $and : [
                            {"Sender_Id":data} , 
                            {"Status" :"Block"}
                        ]
                    }
                ]
            }
                
        },{
            "$project":{
                "To_user":{
                    $cond:{
                        if:{$eq:['$From_user',data]},then:{"$toObjectId":"$To_user"},else:{"$toObjectId":"$From_user"}
                    }
                },
                "_id":{
                    "$toString":"$_id"
                },
                Status:1,
                Response_Time:1,
                Created_At:1,
                Is_Seen:1,
                Last_Message:1,
                Sender_Id:1
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'To_user',
                foreignField:'_id',
                as:'To_user_details'
            }
        },
        {
            $unwind:"$To_user_details"
        },
        {
            $project:{
                _id:1,
                To_user:1,
                From_user:1,
                Sender_Id:1,
                Response_Time:1,
                Created_At:1,
                Name:{
                    $concat:['$To_user_details.First_Name'," ", "$To_user_details.Last_Name"]
                },
                Status :1
                
            }
        }
    ])
}

/* Method for getting last message*/
queryModule.getLastMessage = async function(data){
    return await chatModel.findOne({$and :
        [
            {Room_Id:data},
            {Deleted:false}
        ]}).sort({_id:-1}).limit(1)
}

/* Method for getting All Chat*/
queryModule.getAllChat = async function(data){
    return await chatModel.find({$and :
        [
            {Room_Id:data},
            {Deleted:false}
        ]}).sort({Created_At: 1})
}

/* Method for getting one particular message*/
queryModule.getOneMessage = async function(data){
    return await chatModel.findOne({$and :
        [
            {_id:data.msg_id},
            {User_Id: data._id}
        ]})
}

/* Method for deleting One particular message*/
queryModule.deleteOneMessage = async function(data){
    return await chatModel.updateOne({_id:data},{$set:{Deleted:true}})
}

/* Method for getting deleted message*/
queryModule.getDeletedMessage = async function(data){
    return await chatModel.findOne({_id:data})
}

/* Method for update  message*/
queryModule.updateOneMessage = async function(data){
    return await chatModel.updateOne({$and :
        [
            {_id:data.msg_id},
            {User_Id:data._id}
        ]},{$set:{Message:data.message}})
}

/* Method for finding one message*/
queryModule.findOneMessage = async function(data){
    return await chatModel.findOne({_id:data})
}

/* Method for updating all the messages */
queryModule.updateAllchat = async function(room_Id,friendId){
    return await chatModel.updateMany({$and :
        [
            {Room_Id:room_Id},
            {User_Id:friendId}
        ]},{$set:{Is_Seen:true}})
}

queryModule.updateSeenMessage = async function(msgId){
    return await chatModel.updateOne({_id:msgId},{$set:{Is_Seen:true}});
}

/* Method for getting friend list in alphabetically sorted order */
queryModule.getOnlyFriendList = async function(data){
    return await roomModel.aggregate([
        {
            $match:{$and :
                [
                    {
                        $or : [
                            {"To_user":data} , 
                            {"From_user":data}
                        ]
                    },
                    {
                        $or : [
                            {"Status" :"Requested"} , 
                            {"Status" :"Friend"}
                        ]
                    }
                ]
            }
                
        },
        {
            "$project":{
                "To_user":{
                    $cond:{
                        if:{$eq:['$From_user',data]},then:{"$toObjectId":"$To_user"},else:{"$toObjectId":"$From_user"}
                    }
                },
                "_id":{
                    "$toString":"$_id"
                },
                Status:1,
                Response_Time:1,
                Created_At:1,
                Is_Seen:1,
                Last_Message:1,
                Sender_Id:1
            }
        },
        
        {
            $lookup: {
                from: 'users',
                localField: "To_user",
                foreignField: '_id',
                as: 'To_user_details'
            }
        },
        
        {
            $lookup:{
                from:'chats',
                localField:'_id',
                foreignField:'Room_Id',
                as:'chat'
            }
        },
        { $addFields: {
            "chats": { "$slice": ["$chat", -1] },
          }
        },
        
        {$unwind:"$chats"},
        {$unwind:"$To_user_details"},

        {
            $project:{
                _id:1,
                To_user:1,
                From_user:1,
                Sender_Id:1,
                Response_Time:1,
                Created_At:1,
                Is_Seen:1,
                Last_Message:1,
                ProfileImage:"$To_user_details.ProfileImage",
                Name:{
                    $concat:['$To_user_details.First_Name'," ", "$To_user_details.Last_Name"]
                },
                Gender:"$To_user_details.Gender",
                Status :{
                    $cond:{
                        if:{
                            $and:[
                                {$eq:['$Sender_Id',data]},
                                {$eq:["$Status","Requested"]}
                            ]
                        },then:"Pending",else:"$Status"
                    }
                },
                Last_Msg:'$chats.Message',
                Last_Message_Type:"$chats.Last_Message_Type"
                
                
            }
        },
        { "$sort": { Last_Message: -1 }}
    ])
},

/* Method for checking friend in the group */
queryModule.checkFriendIsInGroup = async function(data){
    return await groupModel.findOne({_id: data.GroupId},{Users: {$elemMatch: {User_Id:data.friendId}}})
}

queryModule.isAdmin = async function(data){
    return await groupModel.findOne({_id: data.GroupId},{Users: {$elemMatch: {User_Id:data.myId, User_Type:"Admin"}}});
}

queryModule.addToGroup = async function(GroupId,Users){
    return await groupModel.updateOne({_id:GroupId},{$addToSet : {Users:Users}})
}

queryModule.createGroup = async function(data){
    return await groupModel(data).save();
}

queryModule.removeFromGroup = async function(data){
    data.GroupId = ObjectId(data.GroupId);
    console.log("qury data is jere ", data)
    return await groupModel.updateOne({_id:data.GroupId, "Users.User_Id":data.friendId},{$set : {"Users.$.Is_Remove":true}})
}

queryModule.getGroupDetails = async function(id){
    return await groupModel.aggregate([
        {
        $match:{_id :id }
        },
        {
            $unwind: '$Users'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'Users.User_Id',
                foreignField: '_id',
                as: 'data'
            }
        },
        {
            $unwind: '$data'
        },
        {$group:
            {
              _id:'$_id',
              "Group_Name":{ "$first": "$Group_Name" },
              'Is_delete':{'$first':"$Is_delete"},
              'Group_Creater_Id':{'$first':"$Is_delete"},
              'createdAt':{'$first':"$createdAt"},
              "ProfileImage":{'$first':"$ProfileImage"},
              'Users':{
                  $push:{
                    "User_Id":"$Users.User_Id",
                    'myId':'$data._id',
                    'User_Status':'$Users.User_Status',
                    'Is_Remove':'$Users.Is_Remove',
                    'User_Type':'$Users.User_Type',
                    'First_Name': '$data.First_Name',
                    'Last_Name': '$data.Last_Name',
                    'createdAt':'$Users.createdAt',
                    'removedAt':'$Users.removedAt',
                    '_id':'$Users._id',
                    'Gender':"$data.Gender",
                    'ProfileImage':"$data.ProfileImage"

                  }
              }
          }
        }
    ]);
}

queryModule.getGroupList = async function(data){
    console.log("data in query folder ",data)
    return  await groupModel.aggregate([
        // {
        //     $match:{$and:[
        //         {'Users.User_Id' :data },
        //         {'Users.Is_Remove':{$ne:true}}
        //     ]}
        // },
        {
        $match:{'Users.User_Id' :data }
        },
        {
            $unwind: '$Users'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'Users.User_Id',
                foreignField: '_id',
                as: 'data'
            }
        },
        {
            $unwind: '$data'
        },
        {$group:
            {
              _id:'$_id',
              "Group_Name":{ "$first": "$Group_Name" },
              'Is_delete':{'$first':"$Is_delete"},
              'Group_Creater_Id':{'$first':"$Is_delete"},
              'createdAt':{'$first':"$createdAt"},
              "ProfileImage":{'$first':"$ProfileImage"},
              'Users':{
                  $push:{
                    "User_Id":"$Users.User_Id",
                    'myId':'$data._id',
                    'User_Status':'$Users.User_Status',
                    'Is_Remove':'$Users.Is_Remove',
                    'User_Type':'$Users.User_Type',
                    'First_Name': '$data.First_Name',
                    'Last_Name': '$data.Last_Name',
                    'createdAt':'$Users.createdAt',
                    'removedAt':'$Users.removedAt',
                    '_id':'$Users._id',
                    'ProfileImage':"$data.ProfileImage",
                    'Gender':"$data.Gender",  
                  }
              }
          }
        }
    ])
}


queryModule.modifyGroupAdmin = async function(data){
    return await groupModel.updateOne({_id:data.GroupId, "Users._id":data.friendId},{$set : {"Users.$.User_Type":data.action}})
}

queryModule.saveGroupChat = async function(data){
    return await groupchatModel(data).save();
}

queryModule.isUser = async function(data){
    return await groupModel.findOne({_id: data.Group_Id},{Users: {$elemMatch: {User_Id:data.User_Id, Is_Remove:false}}});
}

/* Method for getting group last message*/
queryModule.getGroupLastMessage = async function(data){
    console.log("datatattatatattatatatta", data)
    return await groupchatModel.findOne({$and :[
            {Group_Id:data},
            {Deleted:false}
        ]}).sort({_id:-1}).limit(1)
}

queryModule.updateGroupMessage = async function(data){
    return await groupchatModel.findOneAndUpdate({_id:data._id},{$set:{Message:data.msg,Updated_At:Date.now()}});
}

queryModule.isMsgSender = async function(data){
    console.log("data in query folder ", data)
    data.User_Id = ObjectId(data.User_Id);
    data._id = ObjectId(data._id);
    return await groupchatModel.findOne({$and :
        [
            {_id:data._id},
            {User_Id:data.User_Id}
        ]})
}

queryModule.deletegroupMessage = async function(data){
    return await groupchatModel.findOneAndUpdate({_id:data._id},{$set:{Deleted:true,Deleted_At:Date.now()}});
}

queryModule.getGroupChat = async function(Group_Id){
    // Group_Id = ObjectId(Group_Id);
    return await groupchatModel.find({Group_Id:Group_Id}).sort({Created_At: 1})
}


queryModule.isUserExist = async function(GroupId,User_Id){
    return await groupModel.findOne({_id: GroupId},{Users: {$elemMatch: {User_Id:User_Id, Is_Remove:true}}});
}

queryModule.addRemoveUserToGroup = async function(data){
    return await groupModel.updateOne({_id:data._id, "Users.User_Id":data.Users[0].User_Id},{$set : {"Users.$.Is_Remove":false}})
}

queryModule.getGroupChatList = async function(data){
    return await groupModel.aggregate([
        {
            $match:{$and:[
                {'Users.User_Id' :ObjectId(data) },
                {'Users.Is_Remove':false}
            ]}
                
        },     
        {
            $unwind: '$Users'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'Users.User_Id',
                foreignField: '_id',
                as: 'data'
            }
        },
        {
            $unwind: '$data'
        },
        {$group:
            {
              _id:'$_id',
              "Group_Name":{ "$first": "$Group_Name" },
              'Is_delete':{'$first':"$Is_delete"},
              'Group_Creater_Id':{'$first':"$Is_delete"},
              'createdAt':{'$first':"$createdAt"},
              "ProfileImage":{'$first':"$ProfileImage"},
              'Users':{
                  $push:{
                    "User_Id":"$Users.User_Id",
                    'myId':'$data._id',
                    'User_Status':'$Users.User_Status',
                    'Is_Remove':'$Users.Is_Remove',
                    'User_Type':'$Users.User_Type',
                    'First_Name': '$data.First_Name',
                    'Last_Name': '$data.Last_Name',
                    'createdAt':'$Users.createdAt',
                    'removedAt':'$Users.removedAt',
                    "ProfileImage":"$data.ProfileImage",
                    '_id':'$Users._id'  
                  }
              }
          }
        },    
        {
            $lookup:{
                from:'groupchats',
                localField:'_id',
                foreignField:'Group_Id',
                as:'data2'
            }
        },
        {$addFields:{
            'data4':{$slice:['$data2',-1]}
        }},
        {$unwind:'$data4'},
        {
            $project:{
                _id:1,
                Users:1,
                Group_Name:1,
                ProfileImage:1,
                Last_Message_Type:"$data4.Message_Type",
                Last_Message:'$data4.Message',
                Last_Message_Time:"$data4.Created_At",
                Last_Message_Seen:'$data4.Is_Seen',
            }
        }
        
    ]);
}

queryModule.getFriendChatList = async function(data){
    return await roomModel.aggregate([
                
        {
            $match:{$and :
                [
                    {
                        $or : [
                            {"To_user":data} , 
                            {"From_user":data}
                        ]
                    },
                    {
                        "Status" :{$ne:"Block"}
                    }
                ]
            }
                
        }
        ,{
            "$project":{
                "To_user":{
                    $cond:{
                        if:{$eq:['$From_user',data]},then:{"$toObjectId":"$To_user"},else:{"$toObjectId":"$From_user"}
                    }
                },
                "_id":{
                    "$toString":"$_id"
                },
                Status:1,
                Response_Time:1,
                Created_At:1,
                Is_Seen:1,
                Last_Message:1,
                Sender_Id:1
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'To_user',
                foreignField:'_id',
                as:'To_user_details'
            }
        },
        {
            $unwind:"$To_user_details"
        },
        {
            $lookup:{
                from:'chats',
                localField:'_id',
                foreignField:'Room_Id',
                as:'chat'
            }
        },
        { $addFields: {
            "chatDetails": { "$slice": ["$chat", -1] },
          }
        },
        {$unwind:'$chatDetails'},
        {
            $project:{
                _id:1,
                To_user:1,
                From_user:"$To_user_details._id",
                Sender_Id:1,
                Response_Time:1,
                Created_At:1,
                Gender:"$To_user_details.Gender",
                ProfileImage:"$To_user_details.ProfileImage",
                First_Name:'$To_user_details.First_Name',
                Last_Name:"$To_user_details.Last_Name",
                // Name:{
                //     $concat:['$To_user_details.First_Name'," ", "$To_user_details.Last_Name"]
                // },
                Status :1,
                Last_Message_Type : "$chatDetails.Message_Type",
                Last_Message:"$chatDetails.Message",
                Last_Message_Time: "$chatDetails.Created_At",
                Last_Message_Seen: "$chatDetails.Is_Seen"
                
            }
        },
        ])
}

queryModule.uploadGroupImage = async function(data){
    return await groupModel.updateOne({_id:data._id},{$set:{ProfileImage:data.ProfileImage, ProfileImageUpdatedBy:data.ProfileImageUpdatedBy}});
}

queryModule.isGroup = async function(groupId){
    return await groupModel.findOne({_id:groupId});
}
module.exports = queryModule;


/**

 */