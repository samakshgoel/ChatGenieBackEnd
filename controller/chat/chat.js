const groupModel = require('../../model/group/group');
const queryModule = require('../../model/query/query');
const { ObjectId } = require('bson');
module.exports = {

    /* Function for save the chat */
    async saveChat(req,res){
        message = req.body.message;
        room_Id = req.params.room_Id;

        try{
            let mydata = await queryModule.getUser({Email:req.user.Email})
            let myChat = {
                Message:message,
                User_Id: mydata._id,
                Room_Id : room_Id
            }

            await queryModule.saveChatMessage(myChat);
            return res.status(200).send({code:200,status:'Chat save successfully',myChat})

        }catch(err){

            return res.status(422).send({code:422,status:'failed'})
        }
    },

    /* Function for Get All Chat */
    async getChat(req,res){
        room_Id = req.params.room_Id;
        friendId = req.params.FriendId;
        if(!room_Id && !friendId) return res.status(401).send({code:401,status:"failed",msg:"Room Id and friend Id is required"})
        try{
            let seenMessage = await queryModule.updateAllchat(room_Id,friendId)
            let chat = await queryModule.getAllChat(room_Id);             
            return res.status(200).send({code:200,status:'success', data:chat})
        }catch(err){
            return res.status(422).send({code:422,status:'failed to get chat',message : err.message})
        }
    },


    /* Function for delete message */
    async deleteMessage(req,res){
        req.user.msg_id = req.params.id
        // if(!id) return res.status(422).send({code:422,status:"failed",msg:"id was missing"})

        try{
            let getMessage = await queryModule.getOneMessage(req.user)
            getMessage = JSON.parse(JSON.stringify(getMessage));            
            if(!getMessage) return res.status(422).send({code:422,status:'failed',msg:"Message not exist"})
            await queryModule.deleteOneMessage(getMessage._id);       
            let getChat = await queryModule.getDeletedMessage(getMessage._id)
            return res.status(200).send({code:200,status:'success',msg:"delete successfully",data:getChat})


        }catch(err){
            console.log("error :",err)
            return res.status(422).send({code:422,status:'failed',msg:"Message not exist"})

        }
    },


    /* Funtion for Update Message */
    async updateMessage(req,res){

        req.user.msg_id = req.params.id
        req.user.message = req.body.message;
        if(!req.user.msg_id) return res.status(422).send({code:422,status:"failed",msg:"id was missing"})
        if(!req.user.message) return res.status(422).send({code:422,status:"failed",msg:"message was missing"})

        try{
            let userData = await queryModule.getUser({Email:req.user.Email})
            let getMessage = await queryModule.getOneMessage(req.user);
            console.log("getMessage",getMessage)
            if(!getMessage) return res.status(422).send({code:422,status:'failed',msg:"Message not exist"})            
            let updateMessage = await queryModule.updateOneMessage(req.user);
            let msg = await queryModule.findOneMessage(req.user.msg_id);
            return res.status(200).send({code:200,status:'success',msg:"update Message successfully",data:msg})
        }catch(err){
            console.log("error :",err)
            return res.status(422).send({code:422,status:'failed',msg:err.message})
        }
    },

    /* Funtion for getting all chat list */
    async getAllChatList(req,res){
       let id = req.user._id;
       id = JSON.parse(JSON.stringify(id));
       console.log("oidddd",id)
       try{

           freindList = await queryModule.getFriendChatList(id);
           console.log("freindList freindListfreindList",freindList)
           groupList = await queryModule.getGroupChatList(id);
           console.log("groupListgroupListgroupList : ",groupList)
           const result = [...freindList,...groupList]
           result.sort(function(a,b){return b.Last_Message_Time - a.Last_Message_Time})
           return res.status(200).send({code:200,status:'success',data:result});

       }catch(err){
           console.log("error in get all chat list: ",err);
           return res.status(422).send({code:422,status:'failed',msg:err.message});
       }
    },

    /* Funtion for getting all group list */
    async getAllGroupList(req,res){
        console.log("heyeyeyey")
        let id = req.user._id;
        id = ObjectId(id);
        console.log("id in group list:::",id)
        if(!id) return res.status(422).send({code:422,status:'failed',msg:'Id is required.'})
        let group = []

        try{
            let isInGroup = await queryModule.getGroupList(id)
            console.log("Testttt",isInGroup)
            // console.log("isInGroup in group list:::",isInGroup)
            isInGroup = JSON.parse(JSON.stringify(isInGroup));
            for(let i = 0; i <isInGroup.length; i++){
                for(let j = 0 ; j <isInGroup[i].Users.length;j++){
                    if(!isInGroup[i].Users[j].Is_Remove && isInGroup[i].Users[j].User_Id==req.user._id){
                        console.log(isInGroup[i].Users[j].Is_Remove , isInGroup[i].Users[j].User_Id, isInGroup[i].Users[j]._id,isInGroup[i]._id)
                        
                        // console.log("Yes i am in" ,group)
                        group.push(isInGroup[i])
                    }
                }
                            
            }
            
            return res.status(200).send({code:200,status:'success',data:group});
        }catch(err){
            console.log("error in group :",err)
            return res.status(422).send({code:422,status:'failed',msg:err.message});
        }

    },

     /* Funtion for updating group message */
    async updateGroupMessage(req,res){
        let data = req.body;
        if(!data) return res.send("Data is required.")
        try{
            let isSender = await queryModule.isMsgSender(data);
            console.log("IsSender :::", isSender);
            if(!isSender) return res.status(422).send({code:422,status:'failed',response: "Not Unauthorized"});
            let updateMessage = await queryModule.updateGroupMessage(data)
            updateMessage.Message = data.msg;
            console.log("Update message :", updateMessage);
            return res.status(200).send({code:200,status:'success',response:updateMessage});

        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:'failed',response:err.message});
        }
    },

    async getGroupChat(req,res){
        let data = req.body;
        data.User_Id = req.user._id;
        // id = ObjectId(id);
        console.log("req.bodyreq.bodyreq.body",req.body)
        if(!data.User_Id) return res.status(422).send({code:422,status:'failed',msg:'Id is required'})

        try{
            let isInGroup = await queryModule.isUser(data)
            if(isInGroup.Users.length ==0) return res.status(422).send({code:422,status:'failed',msg:'You are not authorized'});
            let chats = await queryModule.getGroupChat(data.Group_Id);
            return res.status(200).send({code:200,status:'success',msg:chats});
        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:'failed',msg:err.message});
        }
    }
}