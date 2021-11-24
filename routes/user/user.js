const express = require('express');
const ROUTE = express.Router();
const authorize = require('../../services/middleware');
const roles = require('../../services/roles')
const upload = require('../../services/uploadImage');
const {userController,chatController,roomController, paymentController} = require('../../controller');

ROUTE.post('/signup',userController.signup);
ROUTE.put('/user-already-exist',userController.userAlreadyExist)
ROUTE.get('/get-self-detail',authorize(roles.User),userController.getUserSelfDetails);
ROUTE.post('/login',userController.UserLOgin);
ROUTE.post('/add-friend',authorize(roles.User), roomController.addFriend)
ROUTE.put('/get-all-user',authorize(roles.User),userController.getAllUser)
ROUTE.get('/get-friend',authorize(roles.User),roomController.getFriend)
ROUTE.get('/get-friend-list',authorize(roles.User),roomController.getfriendList)
ROUTE.put('/accept-friend',authorize(roles.User),roomController.acceptFriend)
ROUTE.delete('/unfriend/:roomId',authorize(roles.User),roomController.unfriend)
ROUTE.post('/block/:roomId',authorize(roles.User),roomController.blockUser)
ROUTE.post('/save-chat/:room_Id',authorize(roles.User), chatController.saveChat)
ROUTE.get('/get-chat/:room_Id/:FriendId',authorize(roles.User),chatController.getChat)
ROUTE.get('/get-block-list',authorize(roles.User),roomController.getBlockList)
// ROUTE.post('/upload-profile-image/:id',authorize(roles.User),upload.single('image'),userController.uploadProfileImage)
// ROUTE.get('/get-profile-image/:id',authorize(roles.User),userController.getprofileImage)
ROUTE.delete('/delete-message/:id',authorize(roles.User),chatController.deleteMessage)
ROUTE.put('/update-message/:id',authorize(roles.User),chatController.updateMessage);
ROUTE.put('/update-self-details',authorize(roles.User),userController.updateSelfDetails);
ROUTE.put('/forget-password',userController.forgetPassword);
ROUTE.put('/reset-password',userController.resetPassword);
ROUTE.post('/create-group',roomController.createGroup);
ROUTE.post('/add-user-group',roomController.addUserToGroup);
ROUTE.post('/remove-user-group',roomController.removeUserFromGroup);

ROUTE.get('/get-all-chat-list',authorize(roles.User),chatController.getAllChatList);
ROUTE.get('/get-group-list',authorize(roles.User),chatController.getAllGroupList);
ROUTE.put('/update-group-message',authorize(roles.User),chatController.updateGroupMessage);
ROUTE.post('/get-group-chat',authorize(roles.User),chatController.getGroupChat)

/***********---------Payments Method ----------***********/
ROUTE.post('/create-card-token',paymentController.createCardToken);
ROUTE.post('/create-customer',paymentController.createCustomer);
ROUTE.post('/update-customer',paymentController.updateCustomer);
ROUTE.post('/create-card',paymentController.createCard);
ROUTE.post('/get-card',paymentController.getCard);
ROUTE.post('/update-card',paymentController.updateCard)




/*******for checking purpose  */
ROUTE.post('/test',roomController.test6);
module.exports = ROUTE





