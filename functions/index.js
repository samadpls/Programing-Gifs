const fs = require('fs').promises;
const path = require('path');

const findGifsFolder = async (startPath) => {
  const queue = [startPath];
  while (queue.length > 0) {
    const currentPath = queue.shift();
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);
        if (item.isDirectory()) {
          if (item.name === 'gifs') {
            return itemPath;
          }
          queue.push(itemPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
    }
  }
  return null;
};

exports.handler = async (event) => {
  console.log('Function started');
  console.log('Current working directory:', process.cwd());

  try {
    console.log('Searching for gifs folder...');
    const gifsFolder = await findGifsFolder('/var');
    
    if (!gifsFolder) {
      console.error('Gifs folder not found');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gifs folder not found' }),
      };
    }

    console.log('Gifs folder found at:', gifsFolder);

    const files = await fs.readdir(gifsFolder);
    console.log('Files in gifs folder:', files);

    if (files.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No images found' }),
      };
    }

    const fileName = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(gifsFolder, fileName);
    console.log('Selected file:', filePath);

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
        stack: err.stack 
      }),
    };
  }
};