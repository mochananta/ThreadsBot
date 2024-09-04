const puppeteer = require('puppeteer-core');
const pool = require('../../config/db');

async function scrapeFollowing(username) {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: false 
        });

        const page = await browser.newPage();
        await page.goto(`https://www.threads.net/@${username}`, { waitUntil: 'networkidle2' });

        await page.waitForSelector('div[aria-label="Column body"]', { visible: true });

        // Klik tombol following
        const followingSelector = 'div[aria-label="Column body"] > div > div > div:nth-child(4) > div > div';
        await page.click(followingSelector);
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.waitForSelector('[aria-label="Following"]', { visible: true });

        let previousFollowingCount = 0;
        while (true) {
            const followingData = await page.evaluate(() => {
                const elements = Array.from(
                    document.querySelectorAll('[role="dialog"] > div > div > div > div > div > div:nth-child(2) > div > div')
                );
                return elements.map((element) => {
                    const username = element.querySelector("a > span")?.innerText.trim() || "Username not found";
                    const image = element.querySelector("div img")?.getAttribute("src") || "Image not found";
                    return { username, image };
                });
            });

            if (followingData.length === previousFollowingCount) {
                break;
            }

            previousFollowingCount = followingData.length;

            const followersId = await getUserId(username);

            for (const following of followingData) {
                if (following.username && following.username !== 'Username not found') {
                    let followingId = await getUserId(following.username);
                    if (!followingId) {
                        await insertUsers([[following.username, following.image]]);
                        followingId = await getUserId(following.username);
                    }

                    if (followersId && followingId) {
                        await insertFollowing(followersId, followingId);
                    }
                }
            }
            await mouseScroll(page);
        }
        console.log('Following data has been processed.');
    } catch (error) {
        console.error('Error handling following:', error);
    } finally {
        await page.close();
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeFollowing };
