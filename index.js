require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan')
const socket = require('socket.io')
var socketEvents = require('./socketEvents');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(require('cors')())
app.use(morgan('dev'))
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* Connection to Database */
mongoose
.connect(process.env.Mongo_Connection, {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => {
console.log('Successfully connected to the database')
})
.catch(err => {
console.log('Could not connect to the database. Exiting now...', err)
process.exit()
})

const User_Routes = require('./routes/user/user');
const Admin_Routes = require('./routes/admin/admin');

app.use('/admin',Admin_Routes);
app.use('/user',User_Routes);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000/home/chat"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
const server = app.listen(3000,()=>{
    console.log("http://localhost:3000")
})
const io = socket(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST","PUT","DELETE"],
      },
});

socketEvents(io);

// module.exports = io;

//  /* sockets method */
// io.on('connection', socket => {
//   console.log('user connected');

//   /* Method To Join Room */
//   socket.on('joinRoom', (Data) => {
//     console.log("DATA join here",Data)
//     socket.join(Data.Room_Id);
//   });

//   /* Method For Accept Friend */
//   socket.on('acceptfriend',(data)=>{
//     let dataa ={Data : data.To_user, Status:data.Status}
//     io.to(data.Sender_Id).emit('acceptFriendResponse',dataa);
//   })

//   /* Method For Unfriend */
//   socket.on('Unfriend',(data)=>{
//     queryModule.areFriends(data.Room_Id).then(response=>{
//       if(response){
//         response = JSON.parse(JSON.stringify(response));
//         queryModule.unfriend(response).then(data=>{
//           let mydata = {Room_Id:response._id,Status:"Add"}
//           io.to(response.From_user).to(response.To_user).emit('UnfriendResponse',mydata);
//         }).catch(err=>{
//           console.log(err)
//         }) 
//       }
//     }).catch(err=>{
//       console.log(err)
//     }) 
//   })

//   /* Method For Block and Unblock User */
//   socket.on('BlockUnblock',(data)=>{
//     queryModule.areFriends(data.Room_Id).then(response=>{
//       if(response){
//         response = JSON.parse(JSON.stringify(response));
//         if(data.Status){
//           let myData = {Room_Id : response._id,Status:"Block"}
//           queryModule.blockUser(response).then(data=>{
//             io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
//           }).catch(err=>{
//             console.log("err :",err)
//           })
//         }else{
//           let myData = {Room_Id : response._id,Status:"Add"}
//           queryModule.blockUser(response).then(data=>{
//             io.to(response.From_user).to(response.To_user).emit("BlockUnblockResponse",myData)
//           }).catch(err=>{
//             console.log("err :",err)
//           })
//         }
//       }

//     }).catch(err=>{
//       console.log("error is :",err)
//     })
//   })
  
//   /* Method For Seen Message */
//   socket.on('sendMsgSeen',(data)=>{
//     console.log("seen ka Data :",data)
    
//     queryModule.updateSeenMessage(data.MessageId).then(Data=>{
//       // let chatData = chatModel.findOne({_id:data.MessageId});
//       data.Is_Seen = true
//       io.to(data. UserId).emit("sendMsgSeenResponse",data)
//     })

//   })

//   /* Method for Add friend */
//   socket.on('addfriend', (Data)=>{
//       let id= Data.data.Sender_Id !== Data.data.From_user? Data.data.From_user: Data.data.To_user
//       io.to(id).emit('addFriendResponse', Data);
//   })

//   /* Method for giving Active Status*/  
//   socket.on('online',(data)=>{
//     console.log("Data coming from online socket ",data)
//     data.active_Status = "Online"
//     io.sockets.emit("onlineResponse",data);

//   })
//   /*Method for Showing Typing in chat*/
//   socket.on('typing',(data)=>{
//     console.log("DATATATAT of typing",data)
//     io.to(data.UserId).emit('typingResponse',data);
//   })

//   /* Method for chatting */
//   socket.on('messagedetection', function (msg) {
//     console.log('messagedetection', msg);
  
//     chatModel(msg).save().then(data=>{
//       io.to(msg.Room_Id).emit('updateMessages', data); 
//       roomModel.updateOne({_id: msg.Room_Id},{$set :{Last_Message: Date.now()}}).then(data=>{
//         console.log("data: ",data)
//       }).catch(err=>console.log("error: ",err))
//     }).catch(err=>{
//       console.log(err)
//     });

//     socket.on('leave', Room_Id => {
//       socket.leave(Room_Id);
//       console.log('left ' , Room_Id);
//     });

//   });


//   /* Method for Deleting Message */
//   socket.on('deleteMessage',(data)=>{ 
//     io.to(data.Room_Id).emit('deleteMessageResponse',data._id);
//   })

//   /* Method for Updating Message */
//   socket.on('updateMessage',(data)=>{
    
//     Data = {id:data._id,msg:data.Message}
//     io.to(data.Room_Id).emit('updateMessageResponse',Data);
//   })

//   /* Method for leaving Socket Room */
//   socket.on('leave', Room_Id => {
//     socket.leave(Room_Id);
//     console.log('left ' , Room_Id);
//   });

//   /* Method For Disconnecting Socket */
//   socket.on('disconnect', function () {
//     socket.broadcast.emit('userdisconnect', ' user has left');
//   });
// });
console.log("my name is khan")



