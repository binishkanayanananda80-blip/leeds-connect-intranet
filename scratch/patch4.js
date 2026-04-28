const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
  '  employeeSubCategoryId  String?\\n  joinedDate             DateTime               @default(now())',
  '  employeeSubCategoryId  String?\\n  designation            String?\\n  joinedDate             DateTime               @default(now())'
);

schema = schema.replace(
  '  supplierProfile        SupplierProfile?\\n}',
  '  supplierProfile        SupplierProfile?\\n  employeeProfile        Employee?\\n}\\n\\nmodel Employee {\\n  id              String    @id @default(cuid())\\n  userId          String    @unique\\n  employeeNumber  String    @unique\\n  firstName       String\\n  middleName      String?\\n  lastName        String\\n  addressLine1    String?\\n  addressLine2    String?\\n  addressLine3    String?\\n  mobileNumber    String?\\n  landPhoneNumber String?\\n  nicNumber       String?\\n  dateOfBirth     DateTime?\\n  dateOfJoined    DateTime?\\n  branchId        String?\\n  roleId          String?\\n  categoryId      String?\\n  subCategoryId   String?\\n  departmentId    String?\\n  designation     String?\\n  passwordHash    String?\\n  passwordChanged Boolean   @default(false)\\n  createdAt       DateTime  @default(now())\\n  updatedAt       DateTime  @updatedAt\\n\\n  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)\\n  branch      Branch?              @relation(fields: [branchId], references: [id])\\n  role        Role?                @relation(fields: [roleId], references: [id])\\n  category    EmployeeCategory?    @relation(fields: [categoryId], references: [id])\\n  subCategory EmployeeSubCategory? @relation(fields: [subCategoryId], references: [id])\\n  department  Department?          @relation(fields: [departmentId], references: [id])\\n\\n  @@map("employees")\\n}'
);

schema = schema.replace(
  'model Department {\\n  id             String       @id @default(cuid())\\n  name           String\\n  organizationId String\\n  organization   Organization @relation(fields: [organizationId], references: [id])\\n  users          User[]\\n\\n  @@unique([name, organizationId])\\n}',
  'model Department {\\n  id             String       @id @default(cuid())\\n  name           String\\n  organizationId String\\n  organization   Organization @relation(fields: [organizationId], references: [id])\\n  users          User[]\\n  employees      Employee[]\\n\\n  @@unique([name, organizationId])\\n}'
);

schema = schema.replace(
  'model EmployeeSubCategory {\\n  id          String           @id @default(cuid())\\n  name        String\\n  slug        String           @unique\\n  description String?\\n  categoryId  String\\n  category    EmployeeCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\\n  users       User[]\\n\\n  mappingRules RoleMappingRule[]\\n\\n  @@unique([name, categoryId])\\n}',
  'model EmployeeSubCategory {\\n  id          String           @id @default(cuid())\\n  name        String\\n  slug        String           @unique\\n  description String?\\n  categoryId  String\\n  category    EmployeeCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\\n  users       User[]\\n  employees   Employee[]\\n\\n  mappingRules RoleMappingRule[]\\n\\n  @@unique([name, categoryId])\\n}'
);

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Successfully applied all changes.');
