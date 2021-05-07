//import express from 'express'
//import path from 'path';
const path = require('path');
const express = require('express');
const Authenticator = require('./authenticator.js') 
const FFDC = require('./ffdc.js');

const app = express();
const B2B = new Authenticator();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(
    path.resolve(__dirname, '../dist'),
    { maxAge: '1y', etag: false})
);


app.get('/api/login', async (req, res) => {
    try {
        var token = await B2B.getToken();
        res.setHeader('Content-Type', 'application/json');
        //console.log(token);
        res.json(token);
    } catch(err) {
        res.status(500).send(err);
    };   
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
})

app.post('/api/payment', async (req, res) => {
    var data = 
    {
        "sourceId": "Payment source system name",
        "initiatingParty": "LOCALOFFICEUS1",
        "paymentInformationId": "1545922187435",
        "requestedExecutionDate": "2018-12-06",
        "instructedAmount": 
        {
            
            "amount": 100,
            "currency": "USD"
            
        },
        "paymentIdentification": 
        {
            
            "endToEndId": "1545922187435"
            
        },
        "debtor": 
        {
            
            "name": "Dbtr Name"
            
        },
        "debtorAgent": 
        {
            
            "identification": "020010001"
            
        },
        "debtorAccountId": 
        {
            
            "identification": "745521145"
            
        },
        "creditor": 
        {
            
            "name": "Cdtr Name"
            
        },
        "creditorAgent": 
        {
            
            "identification": "131000000"
            
        },
        "creditorAccountId": 
        
        {
            "identification": "1111111111"
        },
        "remittanceInformationUnstructured": "RmtInf1234"
        
    }
    const url = "https://api.fusionfabric.cloud/payment/payment-initiation/realtime-payments/v2/us-real-time-payment/tch-rtps/initiate"

    if (!req.body.token) {
        res.status(500).send("Missing token!");
    }
    const ffdc = new FFDC(req.body.token);
    try {
        const result = await ffdc.callAPI(url, data);

        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});
