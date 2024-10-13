const fs = require('fs').promises;
const path = require('path');

const exploreDirectory = async (dirPath, depth = 0, maxDepth = 3) => {
  if (depth > maxDepth) return;
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        console.log('  '.repeat(depth) + `📁 ${item.name}`);
        await exploreDirectory(itemPath, depth + 1, maxDepth);
      } else {
        console.log('  '.repeat(depth) + `📄 ${item.name}`);
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
    await exploreDirectory('/var', 0, 4);
    await exploreDirectory(process.cwd(), 0, 4);
    
    console.log('Environment variables:');
    console.log(JSON.stringify(process.env, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'File system exploration completed. Check function logs for details.' 
      }),
    };
  } catch (err) {
    console.error('Error in handler:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error exploring file system', 
        details: err.message, 
        stack: err.stack 
      }),
    };
  }
};