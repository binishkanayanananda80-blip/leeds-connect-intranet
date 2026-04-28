const Database = require('better-sqlite3');
const db = new Database('prisma/leeds_v2.db');

const rows = db.pragma('table_info(GroupMember)');
console.log(JSON.stringify(rows, null, 2));
db.close();
