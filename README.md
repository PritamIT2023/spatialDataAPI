# Spatial Data API Documentation

This documentation covers the setup and usage of our spatial data APIs for both point and polygon data. These APIs allow applications to store, retrieve, and manipulate geographic data for visualization and analysis.

## Table of Contents

- [Project Overview](#project-overview)
- [Installation & Setup](#installation--setup)
- [Points API](#points-api)
  - [Model Structure](#points-model-structure)
  - [Endpoints](#points-endpoints)
  - [Sample Requests](#points-sample-requests)
- [Polygons API](#polygons-api)
  - [Model Structure](#polygons-model-structure)
  - [Endpoints](#polygons-endpoints)
  - [Sample Requests](#polygons-sample-requests)
- [Working with GeoJSON](#working-with-geojson)
- [Example Use Cases](#example-use-cases)

## Project Overview

This project provides two separate but complementary APIs:

1. **Points API**: For managing discrete location data (e.g., events, businesses, landmarks)
2. **Polygons API**: For managing area-based geographic data (e.g., states, districts, regions)

Both APIs are built with Express.js and Sequelize ORM, using PostgreSQL with PostGIS extensions for powerful spatial querying capabilities.

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL with PostGIS extension
- npm or yarn

### Setting Up the Database

1. Create PostgreSQL databases:

```sql
CREATE DATABASE spatial_points_db;
CREATE DATABASE spatial_polygons_db;
```

2. Enable PostGIS extension on each database:

```sql
\c spatial_points_db
CREATE EXTENSION postgis;

\c spatial_polygons_db
CREATE EXTENSION postgis;
```

### Project Setup

1. Clone the repository or create a new project:

```bash
mkdir spatial-api
cd spatial-api
npm init -y
```

2. Install dependencies:

```bash
npm install express sequelize pg pg-hstore cors body-parser dotenv
```

3. Create environment configuration:

Create a `.env` file with the following:

```
# Points API
POINTS_API_PORT=3000
POINTS_DATABASE_URL=postgres://postgres:password@localhost:5432/spatial_points_db

# Polygons API
POLYGONS_API_PORT=3001
POLYGONS_DATABASE_URL=postgres://postgres:password@localhost:5432/spatial_polygons_db
```

4. Create the server files:
   - Create `points-api.js` with the Points API code
   - Create `polygons-api.js` with the Polygons API code

5. Start the servers:

```bash
node points-api.js
node polygons-api.js
```

## Points API

The Points API manages location-based point data, perfect for mapping applications that display discrete locations like events, businesses, or landmarks.

### Points Model Structure

```javascript
const SpatialPoint = sequelize.define('SpatialPoint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  eventTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});
```

### Points Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/points` | Retrieve all points |
| GET | `/api/points/bounds` | Get points within a bounding box |
| GET | `/api/points/:id` | Get a specific point by ID |
| POST | `/api/points` | Create a new point |
| PUT | `/api/points/:id` | Update an existing point |
| DELETE | `/api/points/:id` | Delete a point |
| GET | `/api/points/radius` | Find points within a radius |
| GET | `/api/points/category/:category` | Filter points by category |

### Points Sample Requests

#### Create a new point:

```bash
curl -X POST http://localhost:3000/api/points \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Muhsinah at Black Cat",
    "description": "Jazz-influenced hip hop artist Muhsinah plays the Black Cat tonight with Exit Clov and Gods'\''illa.",
    "latitude": 38.9175,
    "longitude": -77.0365,
    "address": "1811 14th Street NW",
    "eventTime": "9:00 p.m.",
    "price": "$12",
    "category": "music"
  }'
```

#### Get points within bounds:

```bash
curl "http://localhost:3000/api/points/bounds?north=39.0&south=38.8&east=-76.9&west=-77.1"
```

#### Find points within radius:

```bash
curl "http://localhost:3000/api/points/radius?lat=38.9175&lng=-77.0365&radius=2"
```

## Polygons API

The Polygons API manages area-based geographic data, perfect for choropleth maps or region-based visualizations like population density, election results, or demographic data.

### Polygons Model Structure

```javascript
const SpatialPolygon = sequelize.define('SpatialPolygon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Store polygon boundaries as GeoJSON
  geometry: {
    type: DataTypes.TEXT, // Store as GeoJSON string
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('geometry');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('geometry', JSON.stringify(value));
    }
  },
  // Metadata fields
  properties: {
    type: DataTypes.JSONB, // Store as JSON object
    allowNull: true,
    defaultValue: {}
  },
  // For choropleth data visualization (like population density)
  value: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // For categorization/filtering
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // For styling info
  fillColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  borderColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // For layering/grouping
  layerGroup: {
    type: DataTypes.STRING,
    allowNull: true
  }
});
```

### Polygons Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/polygons` | Retrieve all polygons |
| GET | `/api/polygons/category/:category` | Get polygons by category |
| GET | `/api/polygons/layer/:layerGroup` | Get polygons by layer group |
| GET | `/api/polygons/:id` | Get a specific polygon by ID |
| GET | `/api/polygons/value-range` | Get polygons with values in a range |
| POST | `/api/polygons` | Create a new polygon |
| PUT | `/api/polygons/:id` | Update an existing polygon |
| DELETE | `/api/polygons/:id` | Delete a polygon |
| GET | `/api/polygons/contains-point` | Find polygons containing a point |
| POST | `/api/polygons/batch` | Batch import polygons |

### Polygons Sample Requests

#### Create a new polygon:

```bash
curl -X POST http://localhost:3001/api/polygons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Montana",
    "description": "State of Montana",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [-116.04, 49.00],
          [-104.05, 49.00],
          [-104.05, 45.00],
          [-116.04, 45.00],
          [-116.04, 49.00]
        ]
      ]
    },
    "properties": {
      "stateCode": "MT",
      "region": "West"
    },
    "value": 6.858,
    "unit": "people per square mile",
    "category": "state",
    "fillColor": "#FDDD90",
    "layerGroup": "us-population-density"
  }'
```

#### Get polygons by value range:

```bash
curl "http://localhost:3001/api/polygons/value-range?min=5&max=10"
```

#### Find polygon containing a point:

```bash
curl "http://localhost:3001/api/polygons/contains-point?lat=46.8&lng=-110.3"
```

## Working with GeoJSON

Both APIs support GeoJSON formatting, which is the standard for geographic data on the web. The Polygons API specifically stores polygon data in GeoJSON format.

### GeoJSON Example

```json
{
  "type": "Feature",
  "properties": {
    "name": "Montana",
    "stateCode": "MT",
    "value": 6.858,
    "unit": "people per square mile"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-116.04, 49.00],
        [-104.05, 49.00],
        [-104.05, 45.00],
        [-116.04, 45.00],
        [-116.04, 49.00]
      ]
    ]
  }
}
```

### Batch Importing GeoJSON

The Polygons API provides a batch endpoint for importing GeoJSON collections:

```bash
curl -X POST http://localhost:3001/api/polygons/batch \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      {
        "type": "Feature",
        "properties": {
          "name": "Montana",
          "value": 6.858,
          "unit": "people per square mile"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[-116.04, 49.00], [-104.05, 49.00], [-104.05, 45.00], [-116.04, 45.00], [-116.04, 49.00]]]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "name": "Wyoming",
          "value": 5.851,
          "unit": "people per square mile"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[-111.05, 45.00], [-104.05, 45.00], [-104.05, 41.00], [-111.05, 41.00], [-111.05, 45.00]]]
        }
      }
    ],
    "layerGroup": "us-population-density",
    "category": "state"
  }'
```

## Example Use Cases

### Interactive Map with Event Locations

Use the Points API to build an interactive map that displays events in a city, filtering by category or searching within a specific radius of the user's location.

### Population Density Choropleth Map

Use the Polygons API to create a choropleth map showing population density across states or counties, with color gradients representing different density values.

### Real Estate Visualization

Combine both APIs to display available properties (points) within specific neighborhoods or districts (polygons), with filtering by price, size, or other criteria.

### Election Results Dashboard

Use the Polygons API to visualize election results by state, county, or district, with color coding based on voting percentages.

---

This documentation provides a comprehensive overview of the spatial data APIs. For more detailed information or specific implementation guidance, please consult the API source code or reach out to the development team.
