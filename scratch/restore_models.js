const fs = require('fs');

const pulled = fs.readFileSync('scratch/pulled.prisma', 'utf8');
let committed = fs.readFileSync('prisma/schema.prisma', 'utf8');

function extractModel(modelName) {
  const startRegex = new RegExp("model " + modelName + " \\{[\\s\\S]*?\\n\\}");
  const match = pulled.match(startRegex);
  return match ? match[0] : null;
}

const modelsToExtract = ['Employee', 'RoleMappingRule', 'PermissionLevel', 'content_items'];
let appendedContent = "\n\n";

for (const model of modelsToExtract) {
  if (!committed.includes("model " + model + " {")) {
    const modelContent = extractModel(model);
    if (modelContent) {
      appendedContent += modelContent + "\n\n";
    }
  }
}

if (appendedContent.trim() !== "") {
  committed += appendedContent;
}

// Add the missing fields
committed = committed.replace(
  "  roleId                 String?",
  "  roleId                 String?\n  subCategoryId          String?\n  departmentId           String?\n  designation            String?"
);

committed = committed.replace(
  "  organization   Organization @relation(fields: [organizationId], references: [id])\n  users          User[]",
  "  organization   Organization @relation(fields: [organizationId], references: [id])\n  users          User[]\n  employees      Employee[]"
);

committed = committed.replace(
  "  category    EmployeeCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  users       User[]",
  "  category    EmployeeCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  users       User[]\n  employees   Employee[]"
);

fs.writeFileSync('prisma/schema.prisma', committed, 'utf8');
console.log('Restored models and added fields.');
