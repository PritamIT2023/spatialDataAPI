const express = require("express");
const SpatialPoint = require("../model/SpatialPoint.model.js");
const router = express.Router();

// Get all polygons
router.get("/api/polygons", async (req, res) => {
  try {
    const polygons = await SpatialPolygon.findAll();
    res.json(polygons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get polygons by category (e.g., 'state', 'county', etc.)
router.get("/api/polygons/category/:category", async (req, res) => {
  try {
    const polygons = await SpatialPolygon.findAll({
      where: {
        category: req.params.category,
      },
    });
    res.json(polygons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get polygons by layer group
router.get("/api/polygons/layer/:layerGroup", async (req, res) => {
  try {
    const polygons = await SpatialPolygon.findAll({
      where: {
        layerGroup: req.params.layerGroup,
      },
    });
    res.json(polygons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific polygon by ID
router.get("/api/polygons/:id", async (req, res) => {
  try {
    const polygon = await SpatialPolygon.findByPk(req.params.id);
    if (!polygon) {
      return res.status(404).json({ error: "Polygon not found" });
    }
    res.json(polygon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get polygons by value range (e.g., population density between X and Y)
router.get("/api/polygons/value-range", async (req, res) => {
  const { min, max } = req.query;

  if (!min || !max) {
    return res.status(400).json({ error: "Missing min or max parameters" });
  }

  try {
    const polygons = await SpatialPolygon.findAll({
      where: {
        value: {
          [Op.between]: [parseFloat(min), parseFloat(max)],
        },
      },
    });
    res.json(polygons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new polygon
router.post("/api/polygons", async (req, res) => {
  try {
    const polygon = await SpatialPolygon.create(req.body);
    res.status(201).json(polygon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a polygon
router.put("/api/polygons/:id", async (req, res) => {
  try {
    const polygon = await SpatialPolygon.findByPk(req.params.id);
    if (!polygon) {
      return res.status(404).json({ error: "Polygon not found" });
    }

    await polygon.update(req.body);
    res.json(polygon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a polygon
router.delete("/api/polygons/:id", async (req, res) => {
  try {
    const polygon = await SpatialPolygon.findByPk(req.params.id);
    if (!polygon) {
      return res.status(404).json({ error: "Polygon not found" });
    }

    await polygon.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find polygons containing a point
router.get("/api/polygons/contains-point", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing latitude or longitude parameters" });
  }

  try {
    // Using a raw SQL query with PostGIS ST_Contains function
    const polygons = await sequelize.query(
      `
      SELECT * FROM "SpatialPolygons" 
      WHERE ST_Contains(
        ST_SetSRID(ST_GeomFromGeoJSON(geometry), 4326),
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
      )
    `,
      {
        replacements: { lat, lng },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.json(polygons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch import polygons (useful for importing GeoJSON collections)
router.post("/api/polygons/batch", async (req, res) => {
  try {
    const { features, layerGroup, category } = req.body;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: "Invalid features array" });
    }

    const createdPolygons = await Promise.all(
      features.map((feature) => {
        return SpatialPolygon.create({
          name: feature.properties?.name || "Unnamed Polygon",
          geometry: feature.geometry,
          properties: feature.properties || {},
          value: feature.properties?.value,
          unit: feature.properties?.unit,
          category: category || feature.properties?.category,
          layerGroup: layerGroup || feature.properties?.layerGroup,
          fillColor: feature.properties?.fillColor,
          borderColor: feature.properties?.borderColor,
        });
      })
    );

    res.status(201).json({
      message: `Successfully imported ${createdPolygons.length} polygons`,
      count: createdPolygons.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
