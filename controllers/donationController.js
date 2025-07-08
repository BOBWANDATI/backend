// === controllers/donationController.js ===
const axios = require('axios');
const moment = require('moment');
const Donation = require('../models/Donation'); // ✅ Ensure this file exists
require('dotenv').config();

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  BUSINESS_SHORT_CODE,
  PASS_KEY,
  CALLBACK_URL,
  SAFARICOM_BASE_URL,
} = process.env;

// ✅ Get M-Pesa access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  const response = await axios.get(
    `${SAFARICOM_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return response.data.access_token;
};

// ✅ STK Push Donation Handler
exports.stkPush = async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const access_token = await getAccessToken();
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(
      `${BUSINESS_SHORT_CODE}${PASS_KEY}${timestamp}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: `254${phone}`,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: `254${phone}`,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'PeaceDonation',
      TransactionDesc: 'Donation',
    };

    const response = await axios.post(
      `${SAFARICOM_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { MerchantRequestID, CheckoutRequestID, ResponseCode } = response.data;

    // ✅ Save only successful requests
    if (ResponseCode === "0") {
      const donation = await Donation.create({
        merchantRequestID: MerchantRequestID,
        checkoutRequestID: CheckoutRequestID,
        phoneNumber: `254${phone}`,
        amount,
        status: 'Pending',
        response: response.data,
      });

      console.log("✅ Donation saved to DB:", donation);
    } else {
      console.warn("❌ STK Push was unsuccessful, not saving to DB");
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ STK Push Error:', error?.response?.data || error.message);
    res.status(500).json({ errorMessage: 'M-Pesa STK Push failed.' });
  }
};
