module.exports = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/secureFiles",
  VT_API_KEY: process.env.VT_API_KEY || "",
  SHODAN_API_KEY: process.env.SHODAN_API_KEY || process.env.Shodan_API_Key || "",
};