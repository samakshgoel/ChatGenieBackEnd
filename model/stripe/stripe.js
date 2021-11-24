const stripe = require('stripe')(process.env.STRIPE_KEY);

const paymentQuery = {}


paymentQuery.createCardToken = async function(data){
    const token = await stripe.tokens.create({
        card: {
        number: data.number,
        exp_month: data.exp_month,
        exp_year: data.exp_year,
        cvc: data.cvc,
        },
    });
    return token;
}


paymentQuery.createCard = async function(id,source){
    return  await stripe.customers.createSource(
      id,
      {source: source}
    );
}


paymentQuery.createAccount = async function(){
    return await stripe.accounts.create({
        type: 'custom',
        country: 'India',
        email: 'samaksh.bhadanitech@gmail.com',
        capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true},
        },
    });
}


paymentQuery.createCustomer = async function(email){
    return await stripe.customers.create({
      description: 'Customer of ChatGenie',
      email:email
    });
}


paymentQuery.updateCustomer = async function(id,description){
    await stripe.customers.update(
         id,
        {description: description}
    );
}

paymentQuery.listOfAllCustomers = async function(limit){
    return await stripe.customers.list({
        limit: limit,
    });
}


paymentQuery.listOfAllCards = async function(limit){
    return await stripe.issuing.cards.list({
        limit: 3,
    });
}


paymentQuery.getCard = async function(id){
    return await stripe.customers.listSources(id, {
        object: "card",
        });
}

paymentQuery.updateCard = async function(id,cardId,exp_month,exp_year){
    await stripe.customers.updateSource(
        id,
        cardId,
        {exp_month: exp_month, exp_year:exp_year}
    );
}

module.exports = paymentQuery;