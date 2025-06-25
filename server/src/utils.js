const mongoose = require("mongoose");

let conn = null;
async function connectDB() {
  if (!conn) {
    conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");
  }

  return conn;
}

module.exports = { connectDB };
