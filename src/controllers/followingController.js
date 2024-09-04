const { scrapeFollowing } = require('../services/scrapeFollowing');
const pool = require('../../config/db');

async function getFollowing(req, res) {
    try {
        const { accountUrl } = req.query;
        const following = await scrapeFollowing(accountUrl);

        // Simpan following ke database jika diperlukan
        // const saveResult = await saveFollowingToDB(following);

        res.status(200).json(following);
    } catch (error) {
        console.error('Failed to scrape following:', error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getFollowing };
