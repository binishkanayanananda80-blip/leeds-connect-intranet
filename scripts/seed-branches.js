const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'leeds_v2.db')
const db = new Database(dbPath)

const BRANCHES = [
  "Panadura (Head Office)",
  "Maggona",
  "Galle",
  "Matara",
  "Ambalangoda",
  "Kepuela",
  "Horana",
  "Maharagama",
  "Embilipitiya",
  "Tissamaharama",
  "Boralesgamuwa",
  "Kottawa",
  "Homagama",
  "Matugama",
  "Tangalle",
  "Malambe",
  "Piliyandala",
  "Walgama"
]

function cuid() {
  return 'c' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

try {
  // Get org ID
  const org = db.prepare('SELECT id FROM Organization LIMIT 1').get()
  if (!org) { console.error('No organization found!'); process.exit(1) }
  console.log('Organization:', org.id)

  // Get all existing branches
  const existing = db.prepare('SELECT id, name FROM Branch').all()
  console.log('Existing branches:', existing.map(b => b.name))

  // Delete branches NOT in our list (if no users attached)
  for (const branch of existing) {
    if (!BRANCHES.includes(branch.name)) {
      // Check for linked users or employees in either casing
      let userCount = 0
      try { userCount = db.prepare('SELECT COUNT(*) as c FROM User WHERE branchId = ?').get(branch.id).c } catch(e) {}
      try { if (!userCount) userCount = db.prepare('SELECT COUNT(*) as c FROM "user" WHERE branchId = ?').get(branch.id).c } catch(e) {}
      
      if (userCount === 0) {
        db.prepare('DELETE FROM Branch WHERE id = ?').run(branch.id)
        console.log(`❌ Deleted: ${branch.name}`)
      } else {
        console.log(`⚠️  Skipped (has ${userCount} users): ${branch.name}`)
      }
    }
  }

  // Get existing names after deletion
  const existingAfter = db.prepare('SELECT name FROM Branch').all().map(b => b.name)

  // Insert missing branches
  const insert = db.prepare(`INSERT INTO Branch (id, name, type, status, organizationId) VALUES (?, ?, ?, ?, ?)`)
  for (const name of BRANCHES) {
    if (!existingAfter.includes(name)) {
      const id = cuid()
      const type = name.includes('Head Office') ? 'HQ' : 'BRANCH'
      insert.run(id, name, type, 'ACTIVE', org.id)
      console.log(`✅ Created: ${name}`)
    } else {
      console.log(`— Already exists: ${name}`)
    }
  }

  // Final count
  const final = db.prepare('SELECT name FROM Branch ORDER BY name').all()
  console.log('\n📋 Final branch list:')
  final.forEach((b, i) => console.log(`  ${i + 1}. ${b.name}`))
  console.log('\n✅ Done!')
} catch (e) {
  console.error('Error:', e.message)
} finally {
  db.close()
}
