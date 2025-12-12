const express = require('express');
const { findRoute } = require('../dist/index');

const app = express();
const PORT = 3003;

// Serve static files
app.use(express.static(__dirname));

// Route calculation endpoint
app.get('/api/route', (req, res) => {
  try {
    const originLat = parseFloat(req.query.originLat);
    const originLon = parseFloat(req.query.originLon);
    const destLat = parseFloat(req.query.destLat);
    const destLon = parseFloat(req.query.destLon);

    console.log('Route request:', { originLat, originLon, destLat, destLon });

    if (isNaN(originLat) || isNaN(originLon) || isNaN(destLat) || isNaN(destLon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const origin = { lat: originLat, lon: originLon };
    const destination = { lat: destLat, lon: destLon };

    const result = findRoute(origin, destination);
    console.log('Route calculated:', { distance: result.distance, waypoints: result.waypoints });
    res.json(result);
  } catch (error) {
    console.error('Route calculation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

