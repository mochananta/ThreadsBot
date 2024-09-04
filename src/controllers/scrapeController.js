const express = require('express');
const { scrapeMultipleAccounts } = require('../services/Scraping-Account');
const getAccountsuserFromDB = require('../services/getAccountsFromDB');
const getLoginAccountsFromDB = require('../services/getLoginAccountsFromDB');

const router = express.Router();

router.get('/', async (req, res) => {
    const maxPosts = parseInt(req.query.max) || 10;

    try {
        const accountsuser = await getAccountsuserFromDB(); 
        const loginAccounts = await getLoginAccountsFromDB(); 

        const scrapingResults = await scrapeMultipleAccounts(loginAccounts, accountsuser, maxPosts);

        res.json(scrapingResults); 
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

module.exports = router;
