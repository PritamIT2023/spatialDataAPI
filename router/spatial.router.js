const express = require("express");
const SpatialPoint = require("../model/SpatialPoint.model.js");
const router = express.Router();

// Get all points
router.get("/api/points", async (req, res) => {
  try {
    const points = await SpatialPoint.findAll();
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get points within a bounding box
router.get("/api/points/bounds", async (req, res) => {
  const { north, south, east, west } = req.query;

  if (!north || !south || !east || !west) {
    return res.status(400).json({ error: "Missing bounding box parameters" });
  }

  try {
    const points = await SpatialPoint.findAll({
      where: {
        latitude: {
          [Sequelize.Op.between]: [parseFloat(south), parseFloat(north)],
        },
        longitude: {
          [Sequelize.Op.between]: [parseFloat(west), parseFloat(east)],
        },
      },
    });

    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific point by ID
router.get("/api/points/:id", async (req, res) => {
  try {
    const point = await SpatialPoint.findByPk(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Point not found" });
    }
    res.json(point);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new point
router.post("/api/points", async (req, res) => {
  try {
    const point = await SpatialPoint.create(req.body);
    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a point
router.put("/api/points/:id", async (req, res) => {
  try {
    const point = await SpatialPoint.findByPk(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Point not found" });
    }

    await point.update(req.body);
    res.json(point);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a point
router.delete("/api/points/:id", async (req, res) => {
  try {
    const point = await SpatialPoint.findByPk(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Point not found" });
    }

    await point.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search points by radius
router.get("/api/points/radius", async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng || !radius) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    // Haversine formula in Sequelize raw query
    const points = await sequelize.query(
      `
      SELECT *, 
        (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * cos(radians(longitude) - 
        radians(:lng)) + sin(radians(:lat)) * sin(radians(latitude)))) AS distance 
      FROM "SpatialPoints" 
      HAVING distance < :radius 
      ORDER BY distance
    `,
      {
        replacements: { lat, lng, radius },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter points by category
router.get("/api/points/category/:category", async (req, res) => {
  try {
    const points = await SpatialPoint.findAll({
      where: {
        category: req.params.category,
      },
    });

    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
