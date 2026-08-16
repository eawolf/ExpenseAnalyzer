const fs = require('fs');

const svgs = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f43f5e"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90 Q 50 60 80 90" stroke="white" stroke-width="10" fill="none" stroke-linecap="round"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#3b82f6"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90 Q 50 60 80 90" stroke="white" stroke-width="10" fill="none" stroke-linecap="round"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#10b981"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90 Q 50 60 80 90" stroke="white" stroke-width="10" fill="none" stroke-linecap="round"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#8b5cf6"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90 Q 50 60 80 90" stroke="white" stroke-width="10" fill="none" stroke-linecap="round"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f59e0b"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90 Q 50 60 80 90" stroke="white" stroke-width="10" fill="none" stroke-linecap="round"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#06b6d4"/><circle cx="50" cy="40" r="20" fill="white"/><path d="M20 90 Q 50 60 80 90" stroke="white" stroke-width="10" fill="none" stroke-linecap="round"/></svg>'
];
const b64s = svgs.map(s => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64'));
fs.writeFileSync('src/utils/avatars.ts', 'export const DEFAULT_AVATARS = ' + JSON.stringify(b64s, null, 2) + ';\n');
