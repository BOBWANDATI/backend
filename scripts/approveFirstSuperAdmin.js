// scripts/approveFirstSuperAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Admin.findOneAndUpdate(
      { role: 'super' },
      { approved: true },
      { new: true }
    );

    if (result) {
      console.log(`✅ Super admin '${result.bobwandati}' has been approved.`);
    } else {
      console.log('⚠️ No super admin found.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
