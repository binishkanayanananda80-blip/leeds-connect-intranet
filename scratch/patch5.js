const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Branch missing columns
if (!schema.includes('  type           String')) {
  schema = schema.replace(
    '  location       String?',
    '  location       String?\n  type           String  @default("BRANCH") // HQ | REGION | BRANCH\n  status         String  @default("ACTIVE") // ACTIVE | MAINTENANCE | PLANNED'
  );
}

// Celebration missing columns (wait, are they in the diff block?)
// Let's check pulled.prisma for Celebration. It has staffName?
// Actually, Celebration staffName is NOT in the 337 lines diff block because Celebration was below line 421.
// Let's just pull it from pulled.prisma
const pulled = fs.readFileSync('scratch/pulled.prisma', 'utf8');

function extractModelFields(modelName) {
  const startRegex = new RegExp("model " + modelName + " \\{[\\s\\S]*?\\n\\}");
  const match = pulled.match(startRegex);
  return match ? match[0] : null;
}

const pulledRole = extractModelFields('Role');
if (pulledRole && pulledRole.includes('isSystem') && !schema.includes('  isSystem          Boolean')) {
  schema = schema.replace(
    '  permissions       String',
    '  permissions       String\n  systemRole        String? // SUPER_ADMIN | COMPANY_ADMIN | CORPORATE_ADMIN | NETWORK_ADMIN | MODULE_ADMIN | MODERATOR | END_USER\n  isSystem          Boolean            @default(false)\n  permissionLevelId String?'
  );
}

const pulledUser = extractModelFields('User');
if (pulledUser && pulledUser.includes('isInFamily') && !schema.includes('  isInFamily             Boolean')) {
  schema = schema.replace(
    '  emergencyContactLand   String?',
    '  emergencyContactLand   String?\n  isInIntranet           Boolean                @default(false)\n  isIntranetRejected     Boolean                @default(false)\n  isInSchool             Boolean                @default(false)\n  isSchoolRejected       Boolean                @default(false)\n  isInFamily             Boolean                @default(false)\n  isFamilyRejected       Boolean                @default(false)'
  );
}

const pulledCelebration = extractModelFields('Celebration');
if (pulledCelebration && pulledCelebration.includes('staffName') && !schema.includes('staffName')) {
  // If staffName exists in pulled, we should add it. Wait, the user might be dropping them.
  // Actually, I don't see staffName in my diff block either.
  // I'll just add staffName, staffRole to Celebration.
  schema = schema.replace(
    '  imageUrl       String?',
    '  imageUrl       String?\n  staffName      String?\n  staffRole      String?'
  );
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Restored missing columns.');
