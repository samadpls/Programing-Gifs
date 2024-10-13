const fs = require('fs').promises;
const path = require('path');

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

exports.handler = async (event) => {
  console.log('Function started');
  console.log('Current working directory:', process.cwd());
  
  try {
    console.log('Exploring file system structure:');
    await exploreDirectory(process.cwd(), 0, 4);
    await exploreDirectory('/var', 0, 4);
    
    console.log('Environment variables:');
    console.log(JSON.stringify(process.env, null, 2));

    const testFolder = path.join(process.cwd(), 'static', 'gifs');
    console.log('Attempting to read directory:', testFolder);
    
    const files = await fs.readdir(testFolder);
    console.log('Files found:', files);

    if (files.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No images found' }),
      };
    }

    const fileName = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(testFolder, fileName);
    const data = await fs.readFile(filePath);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: data.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Error in handler:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error processing request', 
        details: err.message, 
        stack: err.stack,
        cwd: process.cwd(),
        dirname: __dirname
      }),
    };
  }
};