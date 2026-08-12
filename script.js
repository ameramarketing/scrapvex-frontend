const fs = require('fs');
const lines = fs.readFileSync('src/pages/CollectorDashboard.jsx', 'utf-8').split('\n');

let start = lines.findIndex(l => l.includes('{activeTab === "profile" && ('));
let end = lines.findIndex((l, i) => i > start && l.includes('{/* DETAIL & BILLING MODAL */}'));

console.log('Start:', start, 'End:', end);
console.log(lines.slice(start, start + 5).join('\n'));
console.log('...');
console.log(lines.slice(end - 5, end + 2).join('\n'));
