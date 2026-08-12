const fs = require('fs');
const path = require('path');

const filesToEdit = [
  'About.jsx', 'BookPickup.jsx', 'Contact.jsx', 'ForgotPassword.jsx',
  'Home.jsx', 'Login.jsx', 'MyPickups.jsx', 'Notifications.jsx',
  'PrivacyPolicy.jsx', 'Profile.jsx', 'Rates.jsx', 'Register.jsx',
  'TermsConditions.jsx', 'UserDashboard.jsx'
];

filesToEdit.forEach(file => {
  const fullPath = path.join('src/pages', file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remove import
  content = content.replace(/import Navbar from ['"]\.\.\/components\/Navbar['"];\r?\n?/g, '');
  
  // Remove component usage
  content = content.replace(/<Navbar \/>\r?\n?/g, '');
  content = content.replace(/\{!isCollector && <Navbar \/>\}\r?\n?/g, '');
  
  fs.writeFileSync(fullPath, content);
  console.log('Cleaned ' + file);
});
