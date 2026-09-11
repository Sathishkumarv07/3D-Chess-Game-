const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, 'combined');

// Ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to scan directory recursively
function getFilesRecursively(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    // Ignore node_modules, .git, dist, and combined directory
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'combined') {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getFilesRecursively(fullPath, filterFn, fileList);
    } else if (filterFn(fullPath, entry)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Consolidate files into target file
function mergeFiles(files, outputFile, languageName, commentStyle = 'slash') {
  const timestamp = new Date().toISOString();
  let header = '';

  if (commentStyle === 'slash') {
    header = `/**\n * CHESSX CONSOLIDATED ${languageName.toUpperCase()}\n * Generated at: ${timestamp}\n * Total files combined: ${files.length}\n */\n\n`;
  } else if (commentStyle === 'html') {
    header = `<!--\n  CHESSX CONSOLIDATED ${languageName.toUpperCase()}\n  Generated at: ${timestamp}\n  Total files combined: ${files.length}\n-->\n\n`;
  }

  let content = header;

  files.sort().forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const code = fs.readFileSync(filePath, 'utf8');

    if (commentStyle === 'slash') {
      content += `/*******************************************************************************\n`;
      content += ` * FILE: ${relativePath}\n`;
      content += ` *******************************************************************************/\n\n`;
    } else if (commentStyle === 'html') {
      content += `<!-- ==========================================================================\n`;
      content += `     FILE: ${relativePath}\n`;
      content += `     ========================================================================== -->\n\n`;
    }

    content += code.trim();
    content += '\n\n';
  });

  fs.writeFileSync(outputFile, content, 'utf8');
  const size = (fs.statSync(outputFile).size / 1024).toFixed(1);
  console.log(`✓ Combined ${files.length} ${languageName} files into: ${path.relative(rootDir, outputFile)} (${size} KB)`);
}

function run() {
  console.log('--- Combining Frontend Files By Language ---');

  // 1. JavaScript & JSX Files
  const jsFiles = getFilesRecursively(rootDir, (fullPath, entry) => {
    if (entry === 'all_js_files_combined.js') return false;
    if (fullPath.includes('scripts')) return false;
    return entry.endsWith('.js') || entry.endsWith('.jsx');
  });
  mergeFiles(jsFiles, path.join(outputDir, 'javascript.js'), 'JavaScript & JSX', 'slash');

  // 2. CSS Stylesheets
  const cssFiles = getFilesRecursively(rootDir, (fullPath, entry) => {
    return entry.endsWith('.css');
  });
  mergeFiles(cssFiles, path.join(outputDir, 'styles.css'), 'CSS Styles', 'slash');

  // 3. HTML Templates
  const htmlFiles = getFilesRecursively(rootDir, (fullPath, entry) => {
    return entry.endsWith('.html');
  });
  mergeFiles(htmlFiles, path.join(outputDir, 'templates.html'), 'HTML Templates', 'html');

  console.log('--------------------------------------------');
  console.log(`All files successfully combined into folder: ${path.relative(rootDir, outputDir)}/`);
}

run();
