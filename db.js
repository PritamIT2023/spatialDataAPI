const Sequelize = require("sequelize");

// Create Sequelize instance
const sequelize = new Sequelize(
  "Talkinglands", //Database name
  "postgres", //Username
  "admin", // Password
  {
    host: "localhost",
    port: "5432",
    dialect: "postgres",
    logging: false,
  },
  {
    pool: {
      max: 5, // Maximum number of connection in pool
      min: 0, // Minimum number of connection in pool
      acquire: 30000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
      idle: 10000, // The maximum time, in milliseconds, that a connection can be idle before being released
    },
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connection to the database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();

module.exports = sequelize;
