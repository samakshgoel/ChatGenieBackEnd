const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_SECRET_KEY);

module.exports = async (to_email, subject, text) => {
    const message = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to: to_email,
    subject:subject,
    text: text   
    };
    console.log("Message is ::::",message);
    sgMail.send(message);

};