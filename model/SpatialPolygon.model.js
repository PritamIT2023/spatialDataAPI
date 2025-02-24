const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const SpatialPolygon = sequelize.define("SpatialPolygon", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Store polygon boundaries as GeoJSON
  geometry: {
    type: DataTypes.TEXT, // Store as GeoJSON string
    allowNull: false,
    get() {
      const rawValue = this.getDataValue("geometry");
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue("geometry", JSON.stringify(value));
    },
  },
  // Metadata fields
  properties: {
    type: DataTypes.JSONB, // Store as JSON object
    allowNull: true,
    defaultValue: {},
  },
  // For choropleth data visualization (like population density)
  value: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // For categorization/filtering
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // For styling info
  fillColor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  borderColor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // For layering/grouping
  layerGroup: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = SpatialPolygon;
