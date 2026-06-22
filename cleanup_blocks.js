
const fs = require("fs");
function cleanupBlocks(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  // Remove empty blocks like:
  // // ========...\n// ====...\n// ========... 
  // followed by another block
  
  // Actually, split by // =====  and if the section has no code, remove it!
  const blockRegex = /\/\/\s*={10,}\s*\n\/\/\s*={0,}\s*.*?\n\/\/\s*={10,}\s*\n/g;
  let matches = [];
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
      matches.push({start: match.index, end: match.index + match[0].length, text: match[0]});
  }
  
  if (matches.length > 0) {
    let newContent = content.substring(0, matches[0].start);
    for (let i = 0; i < matches.length; i++) {
        let chunkStart = matches[i].end;
        let chunkEnd = (i + 1 < matches.length) ? matches[i+1].start : content.length;
        let chunk = content.substring(chunkStart, chunkEnd);
        
        // Check if chunk has any actual code (not just comments/whitespace)
        let hasCode = chunk.split("\n").some(line => line.trim().length > 0 && !line.trim().startsWith("//"));
        if (hasCode) {
            newContent += matches[i].text + chunk;
        }
    }
    fs.writeFileSync(filePath, newContent.replace(/\n{3,}/g, "\n\n"));
  }
}

cleanupBlocks("/media/gilco/default/Projects/gilabyte-full/gilabyte-backend/routes/api/v1.1/admin.js");
cleanupBlocks("/media/gilco/default/Projects/gilabyte-full/gilabyte-backend/routes/api/v1.1/users.js");

