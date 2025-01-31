const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

const exploreDirectory = async (dirPath, depth = 0, maxDepth = 3) => {
  if (depth > maxDepth) return;
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    console.log('  '.repeat(depth) + `📁 ${dirPath}`);
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        await exploreDirectory(itemPath, depth + 1, maxDepth);
      } else {
        console.log('  '.repeat(depth + 1) + `📄 ${item.name}`);
      }
    }
  } catch (error) {
    console.error(`Error exploring ${dirPath}:`, error.message);
  }
};

app.get('/', async (req, res) => {
  console.log('Request received');
  
  const potentialPaths = [
    path.join(process.cwd(), 'public/gifs'),
    path.join(process.cwd(), 'static/gifs'),
    path.join(__dirname, '../public/gifs'),
    path.join(__dirname, '../static/gifs')
  ];

  try {
    let gifsFolder = null;
    for (const testPath of potentialPaths) {
      try {
        await fs.access(testPath);
        gifsFolder = testPath;
        break;
      } catch (error) {
        console.log(`${testPath} not accessible`);
      }
    }

    if (!gifsFolder) {
      throw new Error('Gifs folder not found');
    }

    console.log('Gifs folder found at:', gifsFolder);
    const files = await fs.readdir(gifsFolder);
    console.log('Files found:', files);

    if (files.length === 0) {
      return res.status(500).json({ error: 'No images found' });
    }

    const fileName = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(gifsFolder, fileName);
    const data = await fs.readFile(filePath);

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(data);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Error processing request', 
      details: err.message,
      stack: err.stack,
      cwd: process.cwd(),
      dirname: __dirname
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;