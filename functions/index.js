const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  const testFolder = path.join(__dirname, '..', 'static', 'gifs');

  try {
    const files = await fs.readdir(testFolder);

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
    console.error('Error reading images:', err);
    
    // Print current directory contents
    try {
      const currentDirFiles = await fs.readdir(path.join(__dirname, '..'));
      console.error('Current directory contents:', currentDirFiles);
    } catch (dirErr) {
      console.error('Error reading current directory:', dirErr, currentDirFiles);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error reading images', 
        details: err.message 
      }),
    };
  }
};
