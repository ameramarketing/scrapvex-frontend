const fs = require('fs');

const files = [
    'scrapvex-frontend/src/pages/AdminDashboard.jsx',
    'scrapvex-frontend/src/pages/FranchiseDashboard.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find all <table ...> and wrap them in a div with overflowX: auto
    // Because JSX requires closing tags, we have to match </table> too, but it's easier to just do string replacements.
    
    // Replace `<table style={{...}}>` with `<div style={{overflowX:"auto", width:"100%"}}><table style={{...}}>`
    // And `</table>` with `</table></div>`
    
    content = content.replace(/<table style={{/g, '<div style={{overflowX: "auto", width: "100%"}}>\n<table style={{');
    content = content.replace(/<\/table>/g, '</table>\n</div>');

    fs.writeFileSync(file, content);
    console.log(`Wrapped tables in ${file}`);
});
