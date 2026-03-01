const mongoose = require("mongoose");

module.exports = () => {
  return mongoose
    .connect(process.env.DB_URL || "mongodb://127.0.0.1:27017/Projects", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connected to database successfully"))
    .catch((error) => console.error("❌ Database connection failed:", error));
};
