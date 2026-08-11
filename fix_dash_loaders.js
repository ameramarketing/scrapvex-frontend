const fs = require('fs');

const filesToFix = [
    'scrapvex-frontend/src/pages/AdminDashboard.jsx',
    'scrapvex-frontend/src/pages/CollectorDashboard.jsx',
    'scrapvex-frontend/src/pages/FranchiseDashboard.jsx',
    'scrapvex-frontend/src/pages/UserDashboard.jsx'
];

filesToFix.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <div className="spinner"></div> or <div className="premium-spinner"></div> with <FaRecycle className="spin" style={{fontSize: "40px", color: "var(--primary)"}} />
    content = content.replace(/<div className="spinner"><\/div>/g, '<FaRecycle className="spin" style={{fontSize: "45px", color: "var(--primary)"}} />');
    content = content.replace(/<div className="premium-spinner"><\/div>/g, '<FaRecycle className="spin" style={{fontSize: "45px", color: "var(--primary)"}} />');
    
    // Ensure FaRecycle is imported
    if (!content.includes('FaRecycle')) {
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/fa['"]/;
        content = content.replace(importRegex, (match, p1) => {
            return `import { ${p1}, FaRecycle } from "react-icons/fa"`;
        });
    }

    fs.writeFileSync(file, content);
    console.log(`Updated custom loader in ${file}`);
});
