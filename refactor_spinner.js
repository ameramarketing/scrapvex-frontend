const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('scrapvex-frontend/src');
let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Check if FaSpinner is in the file
    if (content.includes('FaSpinner')) {
        // Replace component usages
        content = content.replace(/<FaSpinner/g, '<FaRecycle');
        content = content.replace(/<\/FaSpinner>/g, '</FaRecycle>');

        // Handle imports: replace "FaSpinner," with "" or "FaSpinner" with ""
        // A simple way is to remove FaSpinner from import statements
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/fa['"]/g;
        content = content.replace(importRegex, (match, p1) => {
            let icons = p1.split(',').map(s => s.trim()).filter(s => s.length > 0);
            icons = icons.filter(i => i !== 'FaSpinner');
            if (!icons.includes('FaRecycle')) {
                icons.push('FaRecycle');
            }
            if (icons.length === 0) return '';
            return `import { ${icons.join(', ')} } from "react-icons/fa"`;
        });

        if (content !== original) {
            fs.writeFileSync(file, content);
            modifiedFiles++;
            console.log(`Updated ${file}`);
        }
    }
});

console.log(`Finished. Modified ${modifiedFiles} files.`);
