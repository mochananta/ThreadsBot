const pool = require('../../config/db');

async function getLoginAccountsFromDB() {
    const [rows] = await pool.query('SELECT username, password FROM login_accounts WHERE is_active = 1');
    return rows;
}

module.exports = getLoginAccountsFromDB;
