const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Branch
schema = schema.replace(
  /(model Branch \{[\s\S]*?location\s+String\?)/,
  '$1\n  type           String  @default("BRANCH") // HQ | REGION | BRANCH\n  status         String  @default("ACTIVE") // ACTIVE | MAINTENANCE | PLANNED'
);

// Role
schema = schema.replace(
  /(model Role \{[\s\S]*?permissions\s+String)/,
  '$1\n  systemRole        String? // SUPER_ADMIN | COMPANY_ADMIN | CORPORATE_ADMIN | NETWORK_ADMIN | MODULE_ADMIN | MODERATOR | END_USER\n  isSystem          Boolean            @default(false)'
);

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Restored specific missing columns with regex.');
