require("dotenv").config();

const configurations = {
  ConnectionStrings: {
    MongoDB: process.env.MONGO_SECRET,
  },
  Authentication: {
    Google: {
      ClientId: process.env.CLIENT_ID,  // Replace with your actual Google Client ID
      ClientSecret: process.env.CLIENT_SECRET,  // Replace with your actual Google Client Secret
      CallbackUrl: process.env.CALLBACK  // Your callback URL for Google
    },  
  },
};

module.exports = configurations;
