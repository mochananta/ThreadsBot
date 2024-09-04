const express = require('express');
const scrapeController = require('./controllers/scrapeController');
const followersController = require('./controllers/followersController');
const followingController = require('./controllers/followingController');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use('/scrape', scrapeController);
app.get('/followers', followersController.getFollowers);
app.get('/following', followingController.getFollowing);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
