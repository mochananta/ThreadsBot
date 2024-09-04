const puppeteer = require('puppeteer-core');
const pool = require('../../config/db');



async function loginToAccount(page, account) {
    try {
        await page.goto('https://www.threads.net/login', { waitUntil: 'networkidle2' });

        await page.type('input[autocomplete="username"]', account.username);
        await page.type('input[autocomplete="current-password"]', account.password);
        await page.click('div[role="button"]');

        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log(`Successfully logged in as ${account.username}`);
    } catch (error) {
        throw new Error(`Login failed for ${account.username}: ${error.message}`);
    }
}

async function scrapeFollowers(username) {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: false 
        });

        const page = await browser.newPage();
        await page.goto(`https://www.threads.net/@zeifurrhmn`, { waitUntil: 'networkidle2' });

        await page.waitForSelector('div[aria-label="Column body"]', { visible: true });

        // Klik tombol followers
        const followersSelector = 'div[aria-label="Column body"] > div > div > div:nth-child(3) > div > div';
        await page.click(followersSelector);
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.waitForSelector('[aria-label="Following"]', { visible: true });

        let previousFollowerCount = 0;
        while (true) {
            const followersData = await page.evaluate(() => {
                const elements = Array.from(
                    document.querySelectorAll('[role="dialog"] > div > div > div > div > div > div:nth-child(2) > div > div')
                );
                return elements.map(element => {
                    const username = element.querySelector("a > span")?.innerText.trim() || "Username not found";
                    const image = element.querySelector("div img")?.getAttribute("src") || "Image not found";
                    return { username, image };
                });
            });

            if (followersData.length === previousFollowerCount) {
                break;
            }
            previousFollowerCount = followersData.length;

            const followingId = await getUserId(username);
            for (const follower of followersData) {
                if (follower.username && follower.username !== 'Username not found') {
                    let followerId = await getUserId(follower.username);
                    if (!followerId) {
                        await insertUsers([[follower.username, follower.image]]);
                        followerId = await getUserId(follower.username);
                    }
                    if (followingId && followerId) {
                        await insertFollowers(followerId, followingId);
                    }
                }
            }
            await mouseScroll(page);
        }
        console.log('Followers data has been processed.');
    } catch (error) {
        console.error('Error handling followers:', error);
    } finally {
        await page.close();
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeFollowers };
