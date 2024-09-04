const pool = require('../../config/db');

async function getAccountsuserFromDB() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT usernameuser FROM accountsuser');
        return rows.map(row => `https://www.threads.net/@${row.usernameuser}`);
    } catch (err) {
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = getAccountsuserFromDB;
