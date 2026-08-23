const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, '../all_js_files_combined.js');

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function combineFiles() {
  console.log('Scanning src directory for JS and JSX files...');
  const files = getFilesRecursively(srcDir);
  console.log(`Found ${files.length} files to combine.`);

  let combinedContent = `/**\n * CHESSX CONSOLIDATED CODEBASE BUNDLE\n * Generated at: ${new Date().toISOString()}\n * All Javascript & JSX files from src/ consolidated into a single file.\n */\n\n`;

  files.sort().forEach(filePath => {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    
    combinedContent += `\n/*******************************************************************************\n`;
    combinedContent += ` * FILE: ${relativePath}\n`;
    combinedContent += ` *******************************************************************************/\n\n`;
    combinedContent += code;
    combinedContent += `\n\n`;
  });

  fs.writeFileSync(outputFile, combinedContent, 'utf8');
  console.log(`Successfully compiled all source files into: all_js_files_combined.js (${fs.statSync(outputFile).size} bytes)`);
}

combineFiles();
