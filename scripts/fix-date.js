const Database = require('better-sqlite3');
const db = new Database('prisma/leeds_v2.db');

try {
  // Find Pamoda
  const row = db.prepare("SELECT u.id, u.dateOfBirth FROM User u JOIN employees e ON u.id = e.userId WHERE e.employeeNumber = 'PAN000001'").get();
  console.log('Before fix:', row);

  // Update dateOfBirth back to a valid timestamp format for Prisma SQLite
  // Previous format was: '2000-03-24T00:00:00.000+00:00'
  // I will set it to '2004-04-24T00:00:00.000+00:00'
  db.prepare("UPDATE User SET dateOfBirth = '2004-04-24T00:00:00.000+00:00' WHERE id = ?").run(row.id);

  const afterRow = db.prepare("SELECT u.id, u.dateOfBirth FROM User u JOIN employees e ON u.id = e.userId WHERE e.employeeNumber = 'PAN000001'").get();
  console.log('After fix:', afterRow);
} catch (e) {
  console.error('Error:', e);
} finally {
  db.close();
}
