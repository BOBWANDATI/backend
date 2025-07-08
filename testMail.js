require("dotenv").config();
const sendEmail = require("./utils/sendEmail");

sendEmail("your-email@example.com", "✅ Test Email", "<h1>This is a test</h1>");
