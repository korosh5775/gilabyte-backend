
const fs = require("fs");

function removeOrphanComments(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const newLines = [];
  
  let commentBuffer = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // If it is a block header like // ========, we keep it but flush any previous unused comments.
    if (trimmed.startsWith("// ====================")) {
      commentBuffer = []; // discard orphaned comments
      newLines.push(line);
      continue;
    }
    
    if (trimmed.startsWith("//") && !trimmed.startsWith("// Export") && !trimmed.startsWith("// Import necessary modules") && !trimmed.startsWith("// Import middlewares") && !trimmed.startsWith("// Create an Express router") && !trimmed.startsWith("// -----------------")) {
      commentBuffer.push(line);
      continue;
    }
    
    if (trimmed === "") {
      // Just keep empty lines, maybe wait. Let s push empty lines to buffer.
      commentBuffer.push(line);
      continue;
    }
    
    // If it is a code line!
    // Flush the buffer!
    newLines.push(...commentBuffer);
    commentBuffer = [];
    newLines.push(line);
  }
  
  // discard leftover buffer at the end
  fs.writeFileSync(filePath, newLines.join("\n").replace(/\n{3,}/g, "\n\n"));
}

removeOrphanComments("/media/gilco/default/Projects/gilabyte-full/gilabyte-backend/routes/api/v1.1/admin.js");
removeOrphanComments("/media/gilco/default/Projects/gilabyte-full/gilabyte-backend/routes/api/v1.1/users.js");

