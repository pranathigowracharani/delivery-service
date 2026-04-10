const fs = require('fs');
const path = require('path');

const cssDir = 'd:/delivery-project/delivery-frontend/src/styles';
const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css') && f !== 'Dashboard.css' && f !== 'index.css');

files.forEach(file => {
  let filepath = path.join(cssDir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Replace glassmorphism usage
  content = content.replace(/var\(--glass-bg\)/g, 'var(--bg-card)');
  content = content.replace(/var\(--glass-border\)/g, 'var(--border-color)');
  content = content.replace(/backdrop-filter:[^;]+;/g, '');

  // Make buttons pill shaped automatically
  // By finding .btn {... border-radius: X; } and changing to var(--radius-full)
  content = content.replace(/(\.btn[^{]*{[^}]*border-radius:\s*)[^;]+(;)/g, '$1var(--radius-full)$2');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated ' + file);
  }
});
