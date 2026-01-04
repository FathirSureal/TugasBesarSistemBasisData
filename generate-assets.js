const fs = require('fs');
const path = require('path');

// Buat direktori public
const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(publicDir, 'assets');
const imagesDir = path.join(assetsDir, 'images');
const iconsDir = path.join(assetsDir, 'icons');

[publicDir, assetsDir, imagesDir, iconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Buat favicon.ico placeholder
const faviconContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#3b82f6"/>
  <text x="50" y="60" text-anchor="middle" fill="white" font-family="Arial" font-size="40" font-weight="bold">DW</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconContent);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ''); // Placeholder file

console.log('✅ Created favicon files');

// Buat manifest.json
const manifest = {
  "short_name": "Desa Wisata RBAC",
  "name": "Desa Wisata Management System",
  "icons": [
    {
      "src": "favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
};

fs.writeFileSync(
  path.join(publicDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ Created manifest.json');

// Buat robots.txt
const robotsTxt = `# Allow all
User-agent: *
Allow: /

# Sitemap
Sitemap: https://desa-wisata-rbac.vercel.app/sitemap.xml`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('✅ Created robots.txt');

// Buat placeholder images menggunakan base64
const createPlaceholderImage = (width, height, color, text) => {
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="${Math.min(width, height)/5}">${text}</text>
    </svg>
  `).toString('base64')}`;
};

// Simpan sebagai file HTML untuk preview
const placeholderHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Placeholder Images</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .image-container { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
    .image-box { border: 1px solid #ddd; padding: 10px; text-align: center; }
    img { border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>Placeholder Images for Desa Wisata RBAC</h1>
  <p>Copy the base64 data URLs below for development:</p>
  
  <div class="image-container">
    <div class="image-box">
      <h3>Logo (200x200)</h3>
      <img src="${createPlaceholderImage(200, 200, '#3b82f6', 'LOGO')}" alt="Logo">
      <textarea rows="3" style="width:300px;margin-top:10px;">${createPlaceholderImage(200, 200, '#3b82f6', 'LOGO')}</textarea>
    </div>
    
    <div class="image-box">
      <h3>Hero BG (1920x1080)</h3>
      <img src="${createPlaceholderImage(300, 169, 'linear-gradient(135deg,#667eea,#764ba2)', 'HERO')}" alt="Hero BG" style="width:300px;height:169px;">
      <textarea rows="3" style="width:300px;margin-top:10px;">${createPlaceholderImage(1920, 1080, 'linear-gradient(135deg,#667eea,#764ba2)', 'HERO BG')}</textarea>
    </div>
    
    <div class="image-box">
      <h3>Login BG (1920x1080)</h3>
      <img src="${createPlaceholderImage(300, 169, 'linear-gradient(135deg,#1e3a8a,#3b82f6)', 'LOGIN')}" alt="Login BG" style="width:300px;height:169px;">
      <textarea rows="3" style="width:300px;margin-top:10px;">${createPlaceholderImage(1920, 1080, 'linear-gradient(135deg,#1e3a8a,#3b82f6)', 'LOGIN BG')}</textarea>
    </div>
  </div>
  
  <p><strong>Note:</strong> In production, replace these placeholders with actual images.</p>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'placeholders.html'), placeholderHtml);
console.log('✅ Created placeholders.html');

console.log('\n🎉 All public assets generated successfully!');
console.log('\n📁 Public directory structure:');
console.log('public/');
console.log('├── favicon.svg');
console.log('├── favicon.ico');
console.log('├── manifest.json');
console.log('├── robots.txt');
console.log('├── placeholders.html');
console.log('└── assets/');
console.log('    ├── images/');
console.log('    └── icons/');