import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  merchantRequestID: String,
  checkoutRequestID: String,
  phoneNumber: String,
  amount: String,
  status: String,
  response: Object,
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
