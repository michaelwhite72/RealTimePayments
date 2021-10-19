const path = require("path");
const express = require("express");
const Authenticator = require("./authenticator.js");
const Authorization = require("./authorization.js");
const FFDC = require("./ffdc.js");
const CORS = require("cors");

const app = express();
const B2B = new Authenticator();
const B2C = new Authorization();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  express.static(path.resolve(__dirname, "../dist"), {
    maxAge: "1y",
    etag: false,
  })
);
app.use(CORS());

/// B2C Login URL
app.get("/api/b2c/login", (req, res) => {
  // Redirecting to the right URL
  var URL = B2C.getURL();
  res.redirect(URL);
});

/// B2B Login URL
app.get("/api/b2b/login", async (req, res) => {
  try {
    var token = await B2B.getToken();
    res.setHeader("Content-Type", "application/json");
    res.json(token);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Refresh Token
app.get("/refresh", async (req, res) => {
  try {
    var token = await B2C.refreshToken();
    res.setHeader("Content-Type", "application/json");
    res.json(token);
  } catch (err) {
    res.status(500).send(err);
  }
});

// B2C Callback URL
app.get("/callback", async (req, res) => {
  console.log(req.query);
  if (req.query.code) {
    try {
      var token = await B2C.getToken(req.query.code);
      console.log(token);
      res.setHeader("Content-Type", "application/json");
      res.json(token);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(500);
    res.send("could not get authorization code");
  }
});

// POST PAYMENT to GPP
app.post("/api/payment", async (req, res) => {
  console.log("in payment");
  var data = {
    sourceId: "Fake Web Payment - RTP App",
    initiatingParty: "LOCALOFFICEUS1",
    // MEMO field
    paymentInformationId: req.body.paymentInformationId,
    requestedExecutionDate: req.body.executionDate,
    instructedAmount: {
      // USER SETTABLE AMOUNT FIELD
      amount: req.body.amount,
      // CURENCY FIELD
      currency: "USD",
    },
    paymentIdentification: {
      endToEndId: req.body.paymentInformationId,
    },
    debtor: {
      name: "First American",
    },
    debtorAgent: {
      identification: "020010001",
    },
    debtorAccountId: {
      identification: "276395636",
    },
    creditor: {
      name: req.body.creditor,
    },
    creditorAgent: {
      // 131000000 - Bank of America *or* 000000007 - CitiBank
      identification: "131000000",
    },
    creditorAccountId: {
      // HARDCODED FOR RTP APP
      identification: req.body.creditorAccountId,
    },
    remittanceInformationUnstructured: req.body.memo,
  };
  const url =
    "https://api.fusionfabric.cloud/payment/payment-initiation/realtime-payments/v2/us-real-time-payment/tch-rtps/initiate";

  try {
    if (!req.body.token) {
      res.status(500).send("Missing token!");
    }

    const ffdc = new FFDC(req.body.token);
    const result = await ffdc.callAPI(url, data);

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Payment Request -- ISO20022 v2
app.post("/api/initiate-payment-request", async (req, res) => {
  console.log("payment request initiated");
  console.log(req.body.pmtInfoId);
  var paymentRequestInitiate = {
    InitiationContext: {
      id: "real_time",
      subId: "string",
      schmeNm: "TCH_RTPS",
      saveOnError: true,
      sourceId: "FEEDER_TCH",
    },
    CdtrPmtActvtnReq: {
      GrpHdr: {
        MsgId: req.body.pmtInfoId,
        CreDtTm: `${req.body.date}T13:21:00.941`,
        NbOfTxs: "1",
        InitgPty: {
          Id: {
            OrgId: {
              Othr: [
                {
                  Id: "020010001",
                },
              ],
            },
          },
        },
      },
      PmtInf: [
        {
          PmtInfId: req.body.pmtInfoId,
          PmtMtd: "TRF",
          ReqdExctnDt: req.body.date,
          Dbtr: {
            Nm: req.body.dbtrNm,
          },
          DbtrAcct: {
            Id: {
              Othr: {
                Id: "745521145",
              },
            },
          },
          DbtrAgt: {
            FinInstnId: {
              ClrSysMmbId: {
                MmbId: "131000000",
              },
            },
          },
          CdtTrfTx: [
            {
              PmtId: {
                // InstrId: "1506926089718",
                // EndToEndId: "1506926089718",
                InstrId: req.body.pmtInfoId,
                EndToEndId: req.body.pmtInfoId,                        
              },
              PmtTpInf: {
                SvcLvl: {
                  Cd: "SDVA",
                },
                LclInstrm: {
                  Prtry: "CONSUMER",
                },
              },
              Amt: {
                InstdAmt: {
                  Ccy: "USD",
                  Amt: req.body.amt,
                },
              },
              ChrgBr: "SLEV",
              CdtrAgt: {
                FinInstnId: {
                  ClrSysMmbId: {
                    MmbId: "131000000",
                  },
                },
              },
              Cdtr: {
                Nm: "Maine Seafood",
              },
              CdtrAcct: {
                Id: {
                  Othr: {
                    Id: "112233445",
                  },
                },
              },
            },
          ],
        },
      ],
    },
    // need to review this because the var starts with "@" symbol
    "@xmlns": "urn:iso:std:iso:20022:tech:xsd:pain.013.001.05",
  };
  const url =
    "https://api.fusionfabric.cloud/payment/iso/payment-request/v2/real-time/initiate";

  try {
    if (!req.body.token) {
      res.status(500).send("Missing token!");
    }

    const ffdc = new FFDC(req.body.token);
    const result = await ffdc.callAPI(url, paymentRequestInitiate);

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
});

// Transaction Search - Payment Request by Debtor Account
app.get("/api/transaction-search-debtorID", async (req, res) => {
  console.log("initial transaction");
  // res.json({ msg: "Payments Transaction request in progress" });
  const url =
    "https://api.fusionfabric.cloud/payment/operations/search/v1/payment-request?transactionType=RequestForPayment&debtorAccount=1919191919";

  try {
    if (!req.query.token) {
      console.log("Missing Token");
      res.status(500).send("Missing token!");
    } else {
      const ffdc = new FFDC(req.query.token);
      const result = await ffdc.callAPIGet(url);
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(process.env.BACK_PORT || 8000, () => {
  console.log(`Server is listening on port ${process.env.BACK_PORT}`);
});
