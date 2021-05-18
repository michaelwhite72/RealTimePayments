//import axios from 'axios';
"use strict";
const axios = require('axios');
const { urlencoded } = require('express');


class Authorization {
    constructor(client_id, client_secret, token_url, auth_url, callback_url) {
        this.client = process.env.CLIENT_ID || client_id;
        this.secret = process.env.CLIENT_SECRET || client_secret;
        this.tokenurl = process.env.TOKEN_URL || token_url;
        this.authurl = process.env.AUTH_URL || auth_url;
        this.callback = process.env.CALLBACK_URL || callback_url;
        this.date = Date.now();
        this.expires_in = -1;
        this.token = "empty";
        console.log("Initiate autentication with client_id: "+this.client+"\nToken URL: "+this.tokenurl);
    }
    getAuthCode() {
        try {
            const res = await axios.get(this.authurl+"?client_id="+
            this.client+"&response_type=code"+
            "&redirect_uri="+ urlencoded(this.call));
            if (res.status == '200') {
                return(res);
            }
        }catch (err) {
            console.error(err);
            throw(err);
        }
    }
}

module.exports = Authorization;
