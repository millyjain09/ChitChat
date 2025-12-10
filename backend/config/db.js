const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://millyjain88:mongodb@cluster0.ve2bj9t.mongodb.net/Chats';

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;

