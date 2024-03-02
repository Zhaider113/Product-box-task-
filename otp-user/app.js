const express = require('express');
const app = express();

const apiRoute = require('./routes')
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', apiRoute);

// Catch all unmatched routes and return 404
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route does not exist' });
});

app.listen(4000, () => console.log('Server listening on port 4000'));