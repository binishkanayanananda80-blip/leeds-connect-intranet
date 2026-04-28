const fs = require('fs');

const pulled = fs.readFileSync('scratch/pulled.prisma', 'utf8');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

function extractModel(modelName) {
  const startRegex = new RegExp("model " + modelName + " \\{[\\s\\S]*?\\n\\}");
  const match = pulled.match(startRegex);
  return match ? match[0] : null;
}

const modelsToExtract = ['RoleMappingRule', 'PermissionLevel', 'content_items'];
let appendedContent = "\n\n";

for (const model of modelsToExtract) {
  if (!schema.includes("model " + model + " {")) {
    const modelContent = extractModel(model);
    if (modelContent) {
      appendedContent += modelContent + "\n\n";
    }
  }
}

// Add the Employee model
appendedContent += `model Employee {
  id              String    @id @default(cuid())
  userId          String    @unique
  employeeNumber  String    @unique
  firstName       String
  middleName      String?
  lastName        String
  addressLine1    String?
  addressLine2    String?
  addressLine3    String?
  mobileNumber    String?
  landPhoneNumber String?
  nicNumber       String?
  dateOfBirth     DateTime?
  dateOfJoined    DateTime?
  branchId        String?
  roleId          String?
  categoryId      String?
  subCategoryId   String?
  departmentId    String?
  designation     String?
  passwordHash    String?
  passwordChanged Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch      Branch?              @relation(fields: [branchId], references: [id])
  role        Role?                @relation(fields: [roleId], references: [id])
  category    EmployeeCategory?    @relation(fields: [categoryId], references: [id])
  subCategory EmployeeSubCategory? @relation(fields: [subCategoryId], references: [id])
  department  Department?          @relation(fields: [departmentId], references: [id])

  @@map("employees")
}
`;

schema += appendedContent;

// Add employeeProfile to User
if (schema.includes('supplierProfile        SupplierProfile?') && !schema.includes('employeeProfile        Employee?')) {
  schema = schema.replace(
    '  supplierProfile        SupplierProfile?\n}',
    '  supplierProfile        SupplierProfile?\n  employeeProfile        Employee?\n}'
  );
}

// Add designation to User
if (schema.includes('  employeeSubCategoryId  String?') && !schema.includes('  designation            String?')) {
  schema = schema.replace(
    '  employeeSubCategoryId  String?\n  joinedDate             DateTime               @default(now())',
    '  employeeSubCategoryId  String?\n  designation            String?\n  joinedDate             DateTime               @default(now())'
  );
}

// Add employees Employee[] to Department
if (schema.includes('model Department {') && !schema.includes('  employees      Employee[]')) {
  schema = schema.replace(
    '  organization   Organization @relation(fields: [organizationId], references: [id])\n  users          User[]',
    '  organization   Organization @relation(fields: [organizationId], references: [id])\n  users          User[]\n  employees      Employee[]'
  );
}

// Add employees Employee[] to EmployeeSubCategory
if (schema.includes('model EmployeeSubCategory {') && !schema.includes('  employees   Employee[]')) {
  schema = schema.replace(
    '  category    EmployeeCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  users       User[]',
    '  category    EmployeeCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  users       User[]\n  employees   Employee[]'
  );
}

// Add employees Employee[] to EmployeeCategory
if (schema.includes('model EmployeeCategory {') && !schema.includes('  employees      Employee[]')) {
  schema = schema.replace(
    '  users          User[]\n  announcements  Announcement[]',
    '  users          User[]\n  employees      Employee[]\n  announcements  Announcement[]'
  );
}

// Add employees Employee[] to Branch
if (schema.includes('model Branch {') && !schema.includes('  employees    Employee[]')) {
  schema = schema.replace(
    '  users        User[]\n\n  @@unique([name, organizationId])',
    '  users        User[]\n  employees    Employee[]\n\n  @@unique([name, organizationId])'
  );
}

// Add employees Employee[] to Role
if (schema.includes('model Role {') && !schema.includes('  employees         Employee[]')) {
  schema = schema.replace(
    '  users             User[]\n  matrix            PermissionMatrix[]\n\n  @@unique([name, organizationId])',
    '  users             User[]\n  matrix            PermissionMatrix[]\n  employees         Employee[]\n\n  @@unique([name, organizationId])'
  );
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Final patch applied successfully.');
