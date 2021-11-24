const express = require('express');
const ROUTE = express.Router();
const {paymentController} = require('../../controller')

ROUTE.post('/create-card-token',paymentController.createCardToken);
