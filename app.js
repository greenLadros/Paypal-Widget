//ivri korem 2020
/*
This is a paypal payment widget i mad usin Node.js, express and the paypal sdk.
i created this for practice and fun but fill free to use it in your apps, enjoy.
*/

//init
//import
const express = require('express')
const ejs = require('ejs')
const paypal = require('paypal-rest-sdk')

const app = express()
app.set('view engine', 'ejs')

//setting the paypal transaction
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'fill in yours',
    'client_secret': 'fill in yours'
});

//Routes
app.get('/', (req, res) => {
    res.render('index')
})

app.post('/pay', async (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Donation",
                    "sku": "001",
                    "price": "5.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "5.00"
            },
            "description": "Donation with no reason"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    })
});

//in case of success
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

//in case of cancel
app.get('/cancel', (req, res) => res.send('Cancelled'));

//start listening at port 3000
app.listen('3000', () => { console.log('server started') })