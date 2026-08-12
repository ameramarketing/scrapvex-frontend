const fs = require('fs');
const path = require('path');
const fullPath = path.join('src/pages', 'MyPickups.jsx');
let content = fs.readFileSync(fullPath, 'utf8');
content = content.replace(/\{!isCollector && \}\r?\n?/g, '');
fs.writeFileSync(fullPath, content);
