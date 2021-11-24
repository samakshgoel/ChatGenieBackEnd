const socket = require('socket.io')
const roomModel = require('./model/room/room');
const chatModel = require('./model/chat/chat');
const queryModule = require('./model/query/query');
const io = require('./index')
const { ObjectId } = require('bson');


exports = module.exports = function(io){

  let onlineUserList = [];

     /* sockets method */
 io.on('connection', socket => {
    console.log('user connected');
  /************************************************************************* */
    /* Method To Join Room */
    socket.on('joinRoom', (Data) => {
      console.log("DATA join here",Data)
      socket.join(Data.Room_Id);
      
    });
  /************************************************************************* */
    /* Method For Accept Friend */
    socket.on('acceptfriend',(data)=>{
      let dataa ={Data : data.To_user, Status:data.Status}
      io.to(data.Sender_Id).emit('acceptFriendResponse',dataa);
    })
  /************************************************************************* */
    /* Method For Unfriend */
    socket.on('Unfriend',(data)=>{
      queryModule.areFriends(data.Room_Id).then(response=>{
        if(response){
          response = JSON.parse(JSON.stringify(response));
          queryModule.unfriend(response).then(data=>{
            let mydata = {Room_Id:response._id,Status:"Add"}
            io.to(response.From_user).to(response.To_user).emit('UnfriendResponse',mydata);
          }).catch(err=>{
            console.log(err)
          }) 
        }
      }).catch(err=>{
        console.log(err)
      }) 
    })
  /************************************************************************* */
    /* Method For Block and Unblock User */
    socket.on('BlockUnblock',(data)=>{
      console.log("Data that is coming in block and unblock socket event ::",data);
      queryModule.areFriends(data.Room_Id).then(response=>{
        if(response){
          response = JSON.parse(JSON.stringify(response));
          if(data.Status){
            let myData = {Room_Id : response._id,Status:"Block"}
            queryModule.blockUser(response,data.MyId, myData.Status).then(data=>{
              io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
            }).catch(err=>{
              console.log("err :",err)
            })
          }else{
            let myData = {Room_Id : response._id,Status:"Add"}
            queryModule.blockUser(response,data.MyId, myData.Status).then(data=>{
              io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
            }).catch(err=>{
              console.log("err :",err)
            })
          }
        }
      }).catch(err=>{
        console.log("error is :",err)
      })
    })
    /************************************************************************* */
    /* Method For Seen Message */
    socket.on('sendMsgSeen',(data)=>{
      console.log("seen ka Data :",data)
      
      queryModule.updateSeenMessage(data.MessageId).then(Data=>{
        data.Is_Seen = true
        io.to(data. UserId).emit("sendMsgSeenResponse",data)
      })
  
    })
  /************************************************************************* */
    /* Method for Add friend */
    socket.on('addfriend', (Data)=>{
      console.log("DATATA is here for adding friend ",Data);
        let id= Data.data.Sender_Id !== Data.data.From_user? Data.data.From_user: Data.data.To_user
        Data.data.Status = "Requested"
        io.to(id).emit('addFriendResponse', Data);
    })
  /************************************************************************* */
    /* Method for giving Active Status*/  
    socket.on('online',(data)=>{
      console.log("List of online user at present :", onlineUserList);
      let myIndex = onlineUserList.indexOf(data.UserId);
      if(myIndex == -1){
        onlineUserList.push(data.UserId);
        
      }
      for(let i= 0 ; i<onlineUserList.length;i++){
        console.log(onlineUserList[i])
        io.to(onlineUserList[i]).emit("onlineResponse",onlineUserList);
      }
    })
/************************************************************************* */
    /* Method for giving Unactive Status */
    socket.on("offline",(data)=>{
      console.log("heyyyyyyyyyyyyyyyyy i am offline")
      let myIndex = onlineUserList.indexOf(data.UserId);
      console.log("Data in offline socket:::::::::::::::::::", data)
      if (myIndex !== -1) {
        onlineUserList.splice(myIndex, 1);
      }
      console.log("Users in online array after going offline : ",onlineUserList)
      for(let i= 0 ; i<onlineUserList.length;i++){
        console.log("Users in online array after going offline2 : ",onlineUserList)
        io.to(onlineUserList[i]).emit("offlineResponse",onlineUserList);
      }
    })
/************************************************************************* */
    /*Method for Showing Typing in chat*/
    socket.on('typing',(data)=>{
      console.log("DATATATAT of typing",data)
      io.to(data.UserId).emit('typingResponse',data);
    })
  /************************************************************************* */
    /* Method for chatting */
    socket.on('messagedetection', function (msg) {
      console.log('messagedetection', msg);
    
      chatModel(msg).save().then(data=>{
        io.to(msg.Friend_Id).to(msg.User_Id).emit('updateMessages', data); 
        roomModel.updateOne({_id: msg.Room_Id},{$set :{Last_Message: Date.now()}}).then(data=>{
          console.log("data: ",data)
        }).catch(err=>console.log("error: ",err))
      }).catch(err=>{
        console.log(err)
      });
  
      socket.on('leave', Room_Id => {
        socket.leave(Room_Id);
        console.log('left ' , Room_Id);
      });
  
    });
  
  /************************************************************************* */
    /* Method for Deleting Message */
    socket.on('deleteMessage',(data)=>{ 
      io.to(data.Room_Id).emit('deleteMessageResponse',data._id);
    })
  /************************************************************************* */
    /* Method for Updating Message */
    socket.on('updateMessage',(data)=>{
      
      Data = {id:data._id,msg:data.Message}
      io.to(data.Room_Id).emit('updateMessageResponse',Data);
    })
  /************************************************************************* */
    /* Method for leaving Socket Room */
    socket.on('leave', user => {
      console.log('left ' , user.Room_Id);
      socket.leave(user.Room_Id);
    });
  
/************************************************************************* */
    /*Method for chatting in the group */
    socket.on('chatOnGroup',msg=>{

      chatModel(msg).save().then(data=>{
        queryModule.getUser({_id:msg.UserId}).then(data2=>{
          data.First_Name = data2.First_Name;
          data.Last_Name = data2.Last_Name;
          io.to(msg.Room_Id).emit('chatOnGroupResponse', data);
          
        }).catch(err=>console.log("error: ",err)) 
      }).catch(err=>{
        console.log(err)
      });
  
      socket.on('leave', Room_Id => {
        socket.leave(Room_Id);
        console.log('left ' , Room_Id);
      });

    })
/************************************************************************* */
    /* Method For Disconnecting Socket */
    socket.on('disconnect', function (data) {
      socket.leave(data.UserId);
    });


    /********-----Sockets for GROUPS-----*******/

    /* Method for creating group for chat*/
    socket.on('createGroup',Data=>{

      console.log("DAta is ",Data)
      AdminDetails = {
        First_Name: Data.First_Name,
        Last_Name : Data.Last_Name,
        User_Id: Data.myUserId,
        User_Type:"Admin",
      }

      Data.Users.push(AdminDetails);
      
      let myGroup = {
        Group_Name:Data.Group_Name,
        Users : Data.Users,
        Group_Creater_Id: Data.myUserId
      }
      queryModule.createGroup(myGroup).then(data=>{
        Data._id = data._id;
        for (let i = 0 ; i<data.Users.length; i++){
          console.log("Data.Users[i].User_Id::::::",Data.Users[i].User_Id)
          io.to(Data.Users[i].User_Id).emit('createGroupResponse',Data);
          console.log(i," emit done ")
        }
      
      }).catch(err=>{
        console.log("error in creating group ",err)
      }) 
    });

    /* Method for adding friend in the group */
/************************************************************************* */
    socket.on('addFriendToGroup',data=>{
      console.log("data iiiiiiii",data)
      queryModule.isAdmin(data).then(haveAccess=>{
        if(haveAccess){
          for(let i = 0;i < data.Users.length ;i++){
            queryModule.isUserExist(data.GroupId,data.Users[i].User_Id).then(user=>{
              if(user.Users.length !=0){
                queryModule.addRemoveUserToGroup(user).then(userAdded=>{
                  if(userAdded.modifiedCount==1){
                    data.GroupId = ObjectId(data.GroupId);
                    queryModule.getGroupDetails(data.GroupId).then(myResponse=>{
                      console.log("myresponse",myResponse);
                    myResponse = JSON.parse(JSON.stringify(myResponse));
                    console.log("Data in adding friend to group :", myResponse);
                      for(let i = 0 ; i<myResponse.Users.length; i++){
                        io.to(myResponse.Users[i].User_Id).emit('addFriendToGroupResponse',myResponse);
                        console.log("data.Users[i].UserId::", myResponse.Users[i].User_Id )
                      }
                  })
                    
                  }else{
                    io.to(data.myId).emit('addFriendToGroupResponse',"Something Went Wrong1");
                  }
                }).catch(err=>{console.log("error in add friend to group 1 ",err)})
              }else{
                queryModule.addToGroup(data.GroupId,data.Users[i]).then(userAdded=>{
                  if(userAdded.modifiedCount==1){
                    data.GroupId = ObjectId(data.GroupId);
                    queryModule.getGroupDetails(data.GroupId).then(myResponse=>{
                      console.log("myresponse",myResponse);
                    myResponse = JSON.parse(JSON.stringify(myResponse));
                    console.log("Data in adding friend to group :", myResponse[0].Users.length);
                      for(let i = 0 ; i<myResponse[0].Users.length; i++){
                        io.to(myResponse[0].Users[i].User_Id).emit('addFriendToGroupResponse',myResponse);
                        console.log("data.Users[i].UserId::", myResponse[0].Users[i].User_Id )
                      }
                  })
                  }else{
                    io.to(data.myId).emit('addFriendToGroupResponse',"Something Went Wrong2");
                  }
                })
              }
            }).catch(err=>{console.log("error in add friend to group 2",err)})
          }
        }else{
          io.to(data.myId).emit('addFriendToGroupResponse',"You're not an authorize person!!!");
        }
      }) 
    })
/************************************************************************* */
     /* Method for removing friend from the group */
    socket.on('removeFriendFromGroup',data=>{
      console.log("Data in remove friend Group : ", data.myId, " ", data.friendId, " ",data.GroupId);
      queryModule.getGroupDetails(data.GroupId).then(response=>{
        if(response.Group_Creater_Id != data.friendId){
          queryModule.isAdmin(data).then(haveAccess=>{
            if(haveAccess){
              console.log("IS Admin")
              data.friendId = ObjectId(data.friendId);
              queryModule.checkFriendIsInGroup(data).then(isMember=>{
                console.log("ISmember:::", isMember)
                if(isMember.Users.length!=0){
                  queryModule.removeFromGroup(data).then(removeFriend=>{
                    console.log("remve friend d djed wejd::",removeFriend)
                    if(removeFriend.modifiedCount==1){

                      for(let i = 0 ; i<response.Users.length; i++){
                        let id  = JSON.parse(JSON.stringify(response.Users[i].User_Id))
                        io.to(id).to(data.friendId).emit('removeFriendFromGroupResponse',data);
                        console.log("data.Users[i].UserId::", id )
                      }
                    }else{
                      io.to(data.myId).emit('removeFriendFromGroupResponse',"Something Went Wrong1!!!");
                    }
                  })
                }
              }).catch(err=>{console.log("error in remove friend from group 2", err)})
            }
          }).catch(err=>{console.log("error in remove friend from group 1", err)})
        }else{
          io.to(data.myId).emit('removeFriendFromGroupResponse',"Can't remove the group creater!!!");
        }
      }).catch(err=>{console.log("error in remove friend from group 0",err)})
    })
/************************************************************************* */
    socket.on('exitFromGroup',data=>{
      data.friendId = ObjectId(data.friendId);
      queryModule.checkFriendIsInGroup(data).then(isMember =>{
        if(isMember.Users.length !=0){
          queryModule.removeFromGroup(data).then(removedUser=>{
            if(removedUser.modifiedCount==1){
              let gid = JSON.parse(JSON.stringify(data.GroupId));
              io.to(gid).emit('exitFromGroupResponse',data);
            }else{
              io.to(gid).emit('exitFromGroupResponse',"Can't remove");
            }
          }).catch(err=>{console.log("error in exist from group 2", err)})
        }else{
          io.to(data.GroupId).emit('exitFromGroupResponse',"Not a member");
        }
      }).catch(err=>{console.log("error in exist from group 1", err)})


    })
/************************************************************************* */
    socket.on('makeAdmin',data=>{
      queryModule.isAdmin(data).then(response=>{
        if(response.Users[0].User_Type == "Admin"){
          queryModule.modifyGroupAdmin(data).then(nowAdmin=>{
            if(nowAdmin.modifiedCount == 1){
              io.to(data.myId).to(data.friendId).emit("makeAdminResponse","Now Admin");
            }else{
              io.to(data.myId).emit("makeAdminResponse","Something went wrong!!")
            }
          }).catch(err=>{console.log("Error in making admin 2 ",err)})

        }else{
          io.to(data.myId).emit("makeAdminResponse","You are not authorised")
        }
      }).catch(err=>{console.log("error in making admin 1 ",err)});
    })
/************************************************************************* */
    socket.on('removeAdmin',data=>{
      console.log("data in removing admin ", data);
      queryModule.isAdmin(data).then(response=>{
        if(response.Users[0].User_Type == "Admin"){
          queryModule.modifyGroupAdmin(data).then(removeAdmin=>{
            if(removeAdmin.modifiedCount == 1){
              io.to(data.myId).to(data.friendId).emit("removeAdminResponse","Remove From Admin");
            }else{
              io.to(data.myId).emit("removeAdminResponse","Something went wrong!!")
            }
          })
        }else{
          io.to(data.myId).emit("removeAdminResponse","You are not authorised")
        }
      })
    })
/************************************************************************* */
    socket.on('groupChat',data=>{
      queryModule.isUser(data).then(isUser=>{
        if(isUser.Users.length != 0){
          queryModule.getUser({_id :isUser.Users[0].User_Id}).then(UserDetails=>{
            UserDetails = JSON.parse(JSON.stringify(UserDetails));
            queryModule.saveGroupChat(data).then(chat=>{
              console.log("chaaaaaaaaaaaaattt",chat)
              chat = JSON.parse(JSON.stringify(chat));
              chat.User_Name = UserDetails.First_Name + " " + UserDetails.Last_Name;
              if(chat){
                io.to(data.Group_Id).emit("groupChatResponse",chat);
              }
            }).catch(err=>{console.log("error in group chat 1 ",err)})
          }).catch(err=>{console.log("error in group chat 2 ",err)})
      }else{
        io.to(data.User_Id).emit("groupChatResponse","You are not authorized!")
      }
      }).catch(err=>{console.log("error in group chat 1 ",err)})

    })
/************************************************************************* */
    socket.on('updateGroupMessage',data=>{
      console.log("data in update soket", data)
      io.to(data.Group_Id).emit('updateGroupMessageResponse',data); 
    })
/************************************************************************* */
    socket.on('deleteGroupMessage',data=>{
      queryModule.isMsgSender(data).then(data1=>{
        if(data1){
          queryModule.deletegroupMessage(data).then(deletedMessage=>{
            io.to(data.Group_Id).emit("deleteGroupMessageResponse",data)
          }).catch(err=>{
            console.log("errrrr in delete response", err);
          })
        }
      }).catch(err=>{
        console.log("errrrr ", err);
      })
      
    })
/************************************************************************* */

    socket.on('groupProfile',data=>{
      console.log("groupProfilegroupProfiledatata",data)
      //ProfileImage , group id , Message_Type,Message,ProfileImageUpdatedBy(User_Id)
      queryModule.uploadGroupImage(data).then(imageResponse=>{
        console.log("imageResponse::",imageResponse)
        data.User_Id = data.ProfileImageUpdatedBy;
        data.Group_Id = data._id;
        queryModule.saveGroupChat(data).then(savechat=>{
          console.log("saveChat ::",savechat);
          if(savechat){
            queryModule.isGroup(data._id).then(groupDetails=>{
              groupDetails = JSON.parse(JSON.stringify(groupDetails));
              console.log("onlineUserList:::",onlineUserList)
              for(let i =0;i<groupDetails.Users.length;i++){
                console.log("imageResponse::",groupDetails.Users[i].User_Id)
                io.to(groupDetails.Users[i].User_Id).emit('groupProfileResponse',data);
              }
            }).catch(err=>{console.log("err1",err)})
          }
        }).catch(err=>{console.log("err2",err)})
      }).catch(err=>{console.log("err3",err)})
    })

/********* video calling and audio calling **********/

    // socket.on('ToCallAPerson',data=>{
    //   console.log("data in ToCallAPerson",data)
    //   data.users.forEach(ele=>{
    //     let index = onlineUserList.indexOf(ele);
    //     if(index){
    //       io.to(data.CallerId).emit('ToCallAPersonResponse',data)
    //     }else{
    //       io.to(data.CallerId).emit('ToCallAPersonResponse',[])
    //     }
    //   })
    // })



    socket.on('tocallaperson',data=>{
      console.log("is it entering")
      console.log("data in ToCallAPerson",data)
      let index
      data.users.forEach(ele=>{
        index = onlineUserList.indexOf(ele.UserId);
      })
      console.log("index:::",index)
      if(index>=0){
        io.to(data.CallerId).to(data.users[0].UserId).emit('ToCallAPersonResponse',data)
        console.log("emit")
      }else{
        data.users=[]
        io.to(data.CallerId).emit('ToCallAPersonResponse',data)
      }
    })


    // socket.on('afterCreateOffer',data=>{
    //   console.log("data in afterCreateOffer:",data)
    //   io.to(data.friendId).emit('afterCreateOfferResponse',data);
    // })


    socket.on('exchangeSDP',(data,id)=>{
      console.log('exchangeSDP response hererererererre::::',data,"  ",id )
      console.log('exchangeSDP response hererererererre::::',data,"  ",id )
      io.to(id).emit('exchangeSDP',data);
    })  
  });



}

