const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const spatialRoutes = require("./router/spatial.router.js");
const spatialPolygon = require("./router/spatialPolygon.router.js");
const sequelize = require("./db.js");
// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/", spatialRoutes);
app.use("/", spatialPolygon);

// API Routes

// Initialize database and start server
(async () => {
  try {
    // await sequelize.sync();
    //console.log("Database synchronized");
    // Sample data for Montana (simplified)

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
})();

module.exports = app;
