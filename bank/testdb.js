const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async ()=>{
    try {
        const db = await open({
            filename: './bank.db',
            driver: sqlite3.Database
        });

        console.log("DB Connected Successfully!");

        const res = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables in DB:", res);

        await db.close();
    } catch (err) {
        console.error("DB Connection Error:", err.message);
    }
})();
