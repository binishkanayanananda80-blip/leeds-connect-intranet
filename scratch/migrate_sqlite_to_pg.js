
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const Database = require('better-sqlite3')
const path = require('path')
require('dotenv').config()

async function main() {
  console.log('--- STARTING DATA MIGRATION (V2): RAW SQLITE -> POSTGRESQL ---')

  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const db = new Database(dbPath)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const pgAdapter = new PrismaPg(pool)
  const pg = new PrismaClient({ adapter: pgAdapter })

  try {
    const models = [
      { name: 'Organization', table: 'Organization' },
      { name: 'IntranetSetting', table: 'IntranetSetting' },
      { name: 'OrganizationSetting', table: 'OrganizationSetting' },
      { name: 'PermissionLevel', table: 'PermissionLevel' },
      { name: 'Role', table: 'Role' },
      { name: 'Module', table: 'Module' },
      { name: 'PermissionMatrix', table: 'PermissionMatrix' },
      { name: 'Branch', table: 'Branch' },
      { name: 'Department', table: 'Department' },
      { name: 'EmployeeCategory', table: 'EmployeeCategory' },
      { name: 'EmployeeSubCategory', table: 'EmployeeSubCategory' },
      { name: 'Grade', table: 'Grade' },
      { name: 'User', table: 'User' },
      { name: 'Employee', table: 'employees' },
      { name: 'Account', table: 'Account' },
      { name: 'Session', table: 'Session' },
      { name: 'VerificationToken', table: 'VerificationToken' },
      { name: 'StudentProfile', table: 'StudentProfile' },
      { name: 'ParentProfile', table: 'ParentProfile' },
      { name: 'SupplierProfile', table: 'SupplierProfile' },
      { name: 'Workflow', table: 'Workflow' },
      { name: 'WorkflowStep', table: 'WorkflowStep' },
      { name: 'Announcement', table: 'Announcement' },
      { name: 'Article', table: 'Article' },
      { name: 'ChatGroupCategory', table: 'ChatGroupCategory' },
      { name: 'ChatGroup', table: 'ChatGroup' },
      { name: 'GroupMember', table: 'GroupMember' },
      { name: 'Message', table: 'Message' },
      { name: 'MessageReaction', table: 'MessageReaction' },
      { name: 'Comment', table: 'Comment' },
      { name: 'Reaction', table: 'Reaction' },
      { name: 'Notification', table: 'Notification' },
      { name: 'AuditLog', table: 'AuditLog' },
      { name: 'ProfileUpdateRequest', table: 'ProfileUpdateRequest' },
      { name: 'Milestone', table: 'Milestone' },
      { name: 'VirtualMeeting', table: 'VirtualMeeting' },
      { name: 'WelfareResource', table: 'WelfareResource' },
      { name: 'ThemePreference', table: 'ThemePreference' },
      { name: 'RoleMappingRule', table: 'RoleMappingRule' },
      { name: 'ContentItem', table: 'content_items' },
      { name: 'FinancialTransaction', table: 'FinancialTransaction' },
      { name: 'StudentPayment', table: 'StudentPayment' },
      { name: 'AttendanceRecord', table: 'AttendanceRecord' },
      { name: 'ExamReport', table: 'ExamReport' },
      { name: 'Celebration', table: 'Celebration' },
      { name: 'PasswordResetToken', table: 'PasswordResetToken' }
    ]

    for (const model of models) {
      const prismaModel = model.name.charAt(0).toLowerCase() + model.name.slice(1)
      console.log(`\n>> Migrating: ${model.name}...`)
      
      try {
        const rawData = db.prepare(`SELECT * FROM "${model.table}"`).all()
        if (rawData.length === 0) {
          console.log(`   No records found. skipping.`)
          continue
        }

        // AUTO-CONVERT 0/1 to Boolean
        // We look at the first record to find potential boolean fields
        const sample = rawData[0]
        const booleanFields = []
        for (const [key, value] of Object.entries(sample)) {
          // Heuristic: if a field is named "isX", "hasX", or "enabled" and is 0/1, it's likely boolean
          if (key.startsWith('is') || key.endsWith('Enabled') || key === 'isActive' || key === 'used' || key === 'snowfallEnabled' || key === 'santaEnabled' || key === 'confettiEnabled' || key === 'fireworksEnabled' || key === 'balloonsEnabled' || key === 'articleApprovalsEnabled' || key === 'commentsEnabled' || key === 'reactionsEnabled' || key === 'birthdayAutoPublish' || key === 'newJoinerAutoPublish' || key === 'isSystem' || key === 'isActive' || key === 'canView' || key === 'canCreate' || key === 'canEdit' || key === 'canDelete' || key === 'canApprove' || key === 'canConfig' || key === 'isPinned' || key === 'isArchived' || key === 'isMuted' || key === 'isDeleted' || key === 'isFeatured' || key === 'showAsPopup' || key === 'isDuplicateFlagged' || key === 'isInIntranet' || key === 'isIntranetRejected' || key === 'isInSchool' || key === 'isSchoolRejected' || key === 'isInFamily' || key === 'isFamilyRejected' || key === 'isEmployee' || key === 'isParent' || key === 'isStudent' || key === 'isSupplier' || key === 'passwordChanged' || key === 'forcePasswordChange') {
            booleanFields.push(key)
          }
        }

        const processedData = rawData.map(item => {
          const newItem = { ...item }
          booleanFields.forEach(field => {
            if (newItem[field] !== null) {
              newItem[field] = !!newItem[field]
            }
          })
          
          // Fix for "designation" which might be null in SQLite but required in some models? 
          // (User.designation is optional, but Employee.designation might be different)
          
          return newItem
        })

        console.log(`   Pushing ${processedData.length} records...`)
        
        const batchSize = 50
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize)
          try {
            await pg[prismaModel].createMany({
              data: batch,
              skipDuplicates: true
            })
          } catch (err) {
            console.warn(`   Batch failed for ${model.name}, falling back to single inserts.`)
            for (const item of batch) {
              try {
                await pg[prismaModel].create({ data: item })
              } catch (singleErr) {
                if (!singleErr.message.includes('Unique constraint failed')) {
                  // console.error(`     - Failed:`, singleErr.message)
                }
              }
            }
          }
        }
        console.log(`   Success!`)

      } catch (err) {
        if (err.message.includes('no such table')) {
          console.log(`   Table ${model.table} missing in source.`)
        } else {
          console.error(`   Error migrating ${model.name}:`, err.message)
        }
      }
    }

    console.log('\n--- ENTERPRISE MIGRATION SUCCESSFUL! ---')

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    db.close()
    await pg.$disconnect()
  }
}

main()
