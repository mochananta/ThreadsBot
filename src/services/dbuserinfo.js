const pool = require('../../config/db');

async function saveProfileData(profileData) {
    try {
        const connection = await pool.getConnection();
    
        const [profileResult] = await connection.execute(
            `INSERT INTO profil (usernameprofile, name, imageProfile, caption, bio) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE imageProfile=VALUES(imageProfile), caption=VALUES(caption), bio=VALUES(bio)`,
            [profileData.name, profileData.usernameprofile, profileData.imageProfile, profileData.caption, profileData.bio]
        );
    
        const profileId = profileResult.insertId || (
            await connection.query(`SELECT id FROM profil WHERE usernameprofile = ?`, [profileData.usernameprofile])
        )[0][0].id;
    
        connection.release();
        return profileId;
    } catch (error) {
        throw new Error(`Error saving profile data: ${error.message}`);
    }
}

async function savePostData(posts, profileId) {
    try {
        const connection = await pool.getConnection();
    
        for (const post of posts) {
            await connection.execute(
                `INSERT INTO post (profileId, mediaPost, description, views, time, \`like\`, \`comment\`, \`repost\`, \`share\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [profileId, JSON.stringify(post.mediaPost), post.description, post.views, post.time, post.like, post.comment, post.repost, post.share]
            );
        }
    
        connection.release();
        console.log(`Post data successfully saved for profile ID ${profileId}`);
    } catch (error) {
        throw new Error(`Error saving post data: ${error.message}`);
    }
}

module.exports = { saveProfileData, savePostData };
