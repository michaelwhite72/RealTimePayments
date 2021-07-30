"use strict";
const axios = require("axios");

class FFDC {
  constructor(token) {
    this.token = token;
  }
  async callAPI(url, data) {
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + this.token,
      },
    };
    try {
      const res = await axios.post(url, data, headers);
      if (res.status < 300) {
        return res.data;
      } else {
        throw res;
      }
    } catch (err) {
      throw err;
    }
  }

  async callAPIGet(url) {
    const headers = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + this.token,
      },
    };
    try {
      const res = await axios.get(url, headers);
      console.log(res.data);
      if (res.status < 300) {
        return res.data;
      } else {
        throw res;
      }
    } catch (err) {
      throw err;
    }
  }
}

module.exports = FFDC;
