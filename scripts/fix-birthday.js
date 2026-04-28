const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'prisma', 'leeds_v2.db'))

// PAN000001's birthday is March 24, but today is April 24.
// Fix: update the birthday to April 24 (keep birth year 2000)
const emp = db.prepare("SELECT id, name, dateOfBirth FROM User WHERE entityId = 'PAN000001'").get()
console.log('Before:', emp)

// Set birthday to today April 24, 2004
db.prepare("UPDATE User SET dateOfBirth = '2004-04-24T00:00:00.000Z' WHERE id = ?").run(emp.id)

const updated = db.prepare("SELECT name, dateOfBirth, isInIntranet FROM User WHERE id = ?").get(emp.id)
console.log('After:', updated)

// Also check AMB000001
const amb = db.prepare("SELECT id, name, dateOfBirth, isInIntranet FROM User WHERE entityId = 'AMB000001'").get()
console.log('AMB000001:', amb)

// Show all users with birthdays
const all = db.prepare("SELECT name, dateOfBirth, isInIntranet FROM User WHERE dateOfBirth IS NOT NULL").all()
console.log('\nAll users with birthdays set:', all)

db.close()
console.log('Done!')
