const puppeteer = require('puppeteer-core');
const fs = require('fs');
const scrollPage = require('../utils/scrollPage');
const pool = require('../../config/db');
const { saveProfileData, savePostData } = require('./dbuserinfo');


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

    async function scrapePostDetails(browser, postUrl) {
        const postPage = await browser.newPage();
        await postPage.goto(postUrl, { waitUntil: 'networkidle2' });

        try {
            await postPage.waitForSelector('span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1fhwpqd.xo1l8bm.x12rw4y6.x1yc453h.x1s3etm8.xo8pqpo span', { timeout: 10000 });

            const views = await postPage.evaluate(() => {
                return document.querySelector('span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1fhwpqd.xo1l8bm.x12rw4y6.x1yc453h.x1s3etm8.xo8pqpo span')?.innerText || '0 views';
            });

            await postPage.close();
            return views;

        } catch (error) {
            console.error(`Error processing ${postUrl}: ${error}`);
            await postPage.close();
            return '0 views';
        }
    }

    async function scrapeThreads(page, browser, accountUrl, maxPosts = 10) {
        try {
            await page.goto(accountUrl, { waitUntil: 'networkidle2' });

            await scrollPage(page);

            const profileData = await page.evaluate(() => {
                const name = document.querySelector('h2.x1lliihq')?.innerText || 'Username Not Found';
                const usernameprofile = document.querySelector('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft')?.innerHTML || 'Name Not Found'
                const imageProfile = document.querySelector('.x1ywlc9c img')?.src || 'Image Not Found';
                const caption = document.querySelector('div.x1v67u4u')?.innerText || 'Bio Not Found';
                const bio = document.querySelector('div.x6s0dn4.x78zum5.x14vqqas.xu0aao5')?.innerText || 'Last Description Not Found';
                return {
                    usernameprofile,
                    name,
                    imageProfile,
                    caption,
                    bio
                };
            });

            const posts = await page.evaluate((maxPosts) => {
                const postElements = document.querySelectorAll('div.x78zum5.xdt5ytf div.x9f619.x1n2onr6.x1ja2u2z div.x1a2a7pz.x1n2onr6 div.xrvj5dj.xd0jker.x1evr45z');
                const postData = [];

                postElements.forEach((post, index) => {
                    if (index >= maxPosts) return;

                    const slidePost = [];
                    const slides = post.querySelectorAll('div.xmper1u.x78zum5.x115b2v8.x88g3oa picture.x87ps6o img');

                    if (slides.length > 0) {
                        slides.forEach((slide) => {
                            slidePost.push(slide.src || 'Image Not Found');
                        });
                    } else {
                        const imagePost = post.querySelector('picture.x87ps6o img')?.src || 'Image Not Found';
                        const videoPost = post.querySelector('video')?.src || 'Video Not Found';
                        const mediaPost = imagePost !== 'Image Not Found' ? imagePost : videoPost;
                        slidePost.push(mediaPost);
                    }

                    const description = post.querySelector('div.x1a6qonq.x6ikm8r.x10wlt62.xj0a0fe.x126k92a.x6prxxf.x7r5mf7')?.innerText || 'Description Not Found';
                    const time = post.querySelector('time')?.innerText || 'Time Not Found';
                    const like = post.querySelector('div.x6s0dn4.x78zum5.xl56j7k.xezivpi:nth-of-type(1) span.x10l6tqk')?.innerText || '0';
                    const comment = post.querySelector('div.x6s0dn4.x78zum5.xl56j7k.xezivpi:nth-of-type(2) span.x10l6tqk')?.innerText || '0';
                    const repost = post.querySelector('div.x6s0dn4.x78zum5.xl56j7k.xezivpi:nth-of-type(3) span.x10l6tqk')?.innerText || '0';
                    const share = post.querySelector('div.x6s0dn4.x78zum5.xl56j7k.xezivpi:nth-of-type(4) span.x10l6tqk')?.innerHTML || '0';

                    const postUrl = post.querySelector('a[href*="/post/"]')?.href;
                    
                    postData.push({
                        postUrl,
                        mediaPost: slidePost,
                        description,
                        views: null,  
                        time,
                        like,
                        comment,
                        repost,
                        share
                    });
                });

                return postData;
            }, maxPosts);

            for (const post of posts) {
                post.views = await scrapePostDetails(browser, post.postUrl);
            }

            return { profileData, posts };

        } catch (error) {
            throw new Error('Error during scraping: ' + error.message);
        }
    }

    async function scrapeMultipleAccounts(loginAccounts, accountsuser, maxPosts = 10) {
        let browser;
        const scrapingResults = [];
        try {
            browser = await puppeteer.launch({
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                headless: true  
            });
    
            const page = await browser.newPage();
            let loggedIn = false;
    
            for (const loginAccount of loginAccounts) {
                try {
                    if (!loggedIn) {
                        await loginToAccount(page, loginAccount);
                        loggedIn = true;
                    }
    
                    for (const accountUrl of accountsuser) {
                        try {
                            const { profileData, posts } = await scrapeThreads(page, browser, accountUrl, maxPosts);
                            scrapingResults.push({
                                account: accountUrl,
                                profileData,
                                posts,
                            });
    
                            const profileId = await saveProfileData(profileData); 
                            await savePostData(posts, profileId); // Ensur
    
                            console.log(`Successfully scraped ${accountUrl} using ${loginAccount.username}`);
                        } catch (scrapeError) {
                            console.error(`Failed to scrape ${accountUrl} using ${loginAccount.username}: ${scrapeError.message}`);
                            continue;
                        }
                    }
    
                    break; 
                } catch (loginError) {
                    console.error(`Failed to login using ${loginAccount.username}: ${loginError.message}`);
                    loggedIn = false; 
                    continue; 
                }
            }
    
            return scrapingResults; 
        } catch (error) {
            throw new Error('Error during multiple account scraping: ' + error.message);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }    

module.exports = { scrapeMultipleAccounts };
