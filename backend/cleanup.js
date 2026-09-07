const mongoose = require("mongoose");
require("dotenv").config();

const cleanupUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");

    // Delete any users from the database
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} users from database`);

    process.exit(0);
  } catch (error) {
    console.error("Error cleaning up users:", error);
    process.exit(1);
  }
};

cleanupUser();