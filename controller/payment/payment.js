const queryModule = require('../../model/query/query');

const paymentQuery = require('../../model/stripe/stripe');

module.exports = {

    async createCardToken(req,res){
        let data = req.body;
        try{
            let token = await paymentQuery.createCardToken(data);
            return res.status(200).send({ code:200, status: 'Failed', data:token});
        }catch(err){
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }
    },

    async createCustomer(req,res){
        email = req.body.Email;
        if(!email) return res.status(422).send({ code:422, status: 'Failed', msg : "Email not found" });
        try{
            const customer = await paymentQuery.createCustomer(email)
            console.log("customer kaha hai ",customer)
            let updateData = await queryModule.saveCustomerId(email,customer.id)
            console.log("Update Data ::",updateData);
            return res.status(200).send({ code:200, status: 'Failed', data:customer});
        }catch(err){
            console.log("error is ::",err)
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }
    },

    async updateCustomer(req,res){
        id = req.body.id
        description = req.body.description
        if(!id || !description) return res.status(422).send({ code:422, status: 'Failed', msg : "Data wasn't found" });
        try{
            const customer = await paymentQuery.updateCustomer(id,description)
            console.log("customer kaha hai ",customer)
            return res.status(200).send({ code:200, status: 'Failed', data:customer});
        }catch(err){
            console.log("error is ::",err)
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }
    },

    async getAllListOfCustomers(req,res){
       limit = req.body.limit;
       try{
           const list = await paymentQuery.listOfAllCustomers(limit);
            console.log("customer kaha hai ",list)
            return res.send(list);
       }catch(err){
        return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
       }
    },

    async createCard(req,res){
        id = req.body.id;
        token = req.body.token;

        try{
            let createCard = await paymentQuery.createCard(id,token);
            console.log("Card is created now , ",createCard)
            return res.status(200).send({code:200,status:"success",data:createCard});

        }catch(err){
            console.log(err)
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }
    },

    async getAllCards(req,res){
        let limit = req.body.limit;
        try{
            let cards = await paymentQuery.listOfAllCards(limit);
            console.log("Card is created now , ",cards)
            return res.status(200).send({code:200,status:"success",data:cards});
        }catch(err){
            console.log(err)
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });

        }
    },


    async getCard(req,res){
        let id = req.body.id;
        try{
            let cards = await paymentQuery.getCard(id);
            console.log("Card is created now , ",cards)
            return res.status(200).send({code:200,status:"success",data:cards});
        }catch(err){
            console.log(err)
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });

        }
    },

    async updateCard(req,res){
        let id = req.body.id;
        let cardId = req.body.cardId;
        let exp_month = req.body.exp_month;
        let exp_year = req.body.exp_year;

        try{
            let updateData = await paymentQuery.updateCard(id,cardId,exp_month,exp_year);
            console.log("Card is created now , ",updateData)
            return res.status(200).send({code:200,status:"success",data:updateData});
        }catch(err){
            console.log(err)
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }
    }

}