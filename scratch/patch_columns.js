const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Branch
if (!schema.includes('  type           String')) {
  schema = schema.replace(
    '  location       String?',
    '  location       String?\n  type           String  @default("BRANCH") // HQ | REGION | BRANCH\n  status         String  @default("ACTIVE") // ACTIVE | MAINTENANCE | PLANNED'
  );
}

// Celebration
if (!schema.includes('  staffName      String?')) {
  schema = schema.replace(
    '  imageUrl       String?',
    '  imageUrl       String?\n  staffName      String?\n  staffRole      String?'
  );
}

// Role
if (!schema.includes('  isSystem          Boolean')) {
  schema = schema.replace(
    '  permissions       String',
    '  permissions       String\n  systemRole        String? // SUPER_ADMIN | COMPANY_ADMIN | CORPORATE_ADMIN | NETWORK_ADMIN | MODULE_ADMIN | MODERATOR | END_USER\n  isSystem          Boolean            @default(false)'
  );
}

// User
if (!schema.includes('  isInFamily             Boolean')) {
  schema = schema.replace(
    '  isInIntranet           Boolean                @default(false)',
    '  isInIntranet           Boolean                @default(false)\n  isIntranetRejected     Boolean                @default(false)\n  isInSchool             Boolean                @default(false)\n  isSchoolRejected       Boolean                @default(false)\n  isInFamily             Boolean                @default(false)\n  isFamilyRejected       Boolean                @default(false)'
  );
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Restored specific missing columns.');
