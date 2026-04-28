const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Insert Employee model right above StudentProfile
if (!schema.includes('model Employee {')) {
  schema = schema.replace('model StudentProfile {', `model Employee {
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

model StudentProfile {`);
}

// 2. Add employeeProfile to User model
if (!schema.includes('employeeProfile Employee?')) {
  schema = schema.replace('supplierProfile SupplierProfile?', 'supplierProfile SupplierProfile?\n  employeeProfile Employee?');
}

// 3. Add employees Employee[] to Department
if (!schema.includes('employees      Employee[]') && schema.includes('model Department {')) {
  schema = schema.replace(
    /model Department \{[\s\S]*?users\s+User\[\]/g,
    match => match + '\n  employees      Employee[]'
  );
}

// 4. Add employees Employee[] to EmployeeSubCategory
if (schema.includes('model EmployeeSubCategory {')) {
  schema = schema.replace(
    /model EmployeeSubCategory \{[\s\S]*?users\s+User\[\]/g,
    match => {
      if (match.includes('employees   Employee[]')) return match;
      return match + '\n  employees   Employee[]';
    }
  );
}

// 5. User designation is already present (verified previously), but just in case it isn't:
if (!schema.includes('designation            String?')) {
  schema = schema.replace(
    'notes                  String?',
    'notes                  String?\n  designation            String?'
  );
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Schema patched successfully.');
