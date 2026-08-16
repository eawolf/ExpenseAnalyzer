const fs = require('fs');
const https = require('https');

const styles = ['bottts', 'adventurer', 'avataaars', 'micah', 'lorelei', 'fun-emoji', 'thumbs'];
const seeds = ['Felix', 'Aneka', 'Milo', 'Jude', 'Nala', 'Oscar', 'Luna', 'Cleo', 'Leo', 'Max', 'Bella', 'Charlie', 'Lucy', 'Daisy', 'Molly', 'Buddy'];

const avatars = [];

// Generate a mix of styles and seeds
for (let i = 0; i < 16; i++) {
  const style = styles[i % styles.length];
  const seed = seeds[i % seeds.length];
  avatars.push(`https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`);
}

async function downloadAvatars() {
  const b64s = [];
  
  for (const url of avatars) {
    await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const b64 = 'data:image/svg+xml;base64,' + Buffer.from(data).toString('base64');
          b64s.push(b64);
          resolve();
        });
      }).on('error', reject);
    });
  }

  const content = `export const DEFAULT_AVATARS = ${JSON.stringify(b64s, null, 2)};\n`;
  fs.writeFileSync('src/utils/avatars.ts', content);
  console.log('Saved 16 modern avatars!');
}

downloadAvatars();
