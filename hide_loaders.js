const fs = require('fs');

const files = [
    'scrapvex-frontend/src/pages/AdminDashboard.jsx',
    'scrapvex-frontend/src/pages/FranchiseDashboard.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'const resP = await API.get("/admin/pickups");',
        'const resP = await API.get("/admin/pickups", { hideLoader: true });'
    );
    // Also in AdminDashboard, the WhatsApp polling:
    if (file.includes('AdminDashboard.jsx')) {
        // Find: const { data } = await API.get(url);
        // Replace: const { data } = await API.get(url, { hideLoader: reinit }); // Only hide if it's polling
        content = content.replace(
            'const { data } = await API.get(url);',
            'const { data } = await API.get(url, { hideLoader: true });'
        );
    }
    fs.writeFileSync(file, content);
});

let colContent = fs.readFileSync('scrapvex-frontend/src/pages/CollectorDashboard.jsx', 'utf8');
colContent = colContent.replace(
    'const resP = await API.get("/collector/pickups");',
    'const resP = await API.get("/collector/pickups", { hideLoader: true });'
);
fs.writeFileSync('scrapvex-frontend/src/pages/CollectorDashboard.jsx', colContent);

console.log("Updated API calls in Dashboards");
