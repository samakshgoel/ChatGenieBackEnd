const express = require('express');
const ROUTE = express.Router();
const authorize = require('../../services/middleware');
const roles = require('../../services/roles')

const {adminController, paymentController} = require('../../controller/index');

ROUTE.post('/signup',adminController.signup);
ROUTE.post('/login',adminController.UserLOgin);
ROUTE.get('/getalluser',authorize(roles.Admin),adminController.getAllUserByAdmin);
ROUTE.put('/block-user/:userId',authorize(roles.Admin),adminController.blockUserByAdmin);
ROUTE.put('/reset-password',authorize(roles.Admin),adminController.resetPasswordForAdmin);


/***********---------Payments Method ----------********** */
ROUTE.post('/get-all-customer-list',paymentController.getAllListOfCustomers);
ROUTE.post('/get-all-cards',paymentController.getAllCards);
module.exports = ROUTE;
