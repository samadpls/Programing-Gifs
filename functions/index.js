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
  console.log('__dirname:', __dirname);
  
  const potentialPaths = [
    process.cwd(),
    path.join(process.cwd(), '..'),
    '/var/task',
    '/opt',
    '/'
  ];

  try {
    console.log('Exploring file system structure:');
    for (const p of potentialPaths) {
      console.log(`Exploring ${p}:`);
      await exploreDirectory(p, 0, 3);
    }
    
    console.log('Environment variables:');
    console.log(JSON.stringify(process.env, null, 2));

    // Attempt to find the gifs folder
    let gifsFolder = null;
    for (const p of potentialPaths) {
      const testPath = path.join(p, 'static', 'gifs');
      try {
        await fs.access(testPath);
        gifsFolder = testPath;
        break;
      } catch (error) {
        console.log(`${testPath} not accessible`);
      }
    }

    if (!gifsFolder) {
      throw new Error('Gifs folder not found in any of the expected locations');
    }

    console.log('Gifs folder found at:', gifsFolder);
    const files = await fs.readdir(gifsFolder);
    console.log('Files found:', files);

    if (files.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No images found' }),
      };
    }

    const fileName = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(gifsFolder, fileName);
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