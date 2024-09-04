const { scrapeFollowers } = require('../services/scrapeFollowers');
const pool = require('../../config/db');

async function getFollowers(req, res) {
    try {
        const { accountUrl } = req.query;
        const followers = await scrapeFollowers(accountUrl);

        // Simpan followers ke database jika diperlukan
        // const saveResult = await saveFollowersToDB(followers);

        res.status(200).json(followers);
    } catch (error) {
        console.error('Failed to scrape followers:', error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getFollowers };
