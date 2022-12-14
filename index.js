// Load the http and fs modules
var http = require("http");
var fs = require("fs");
const testFolder = './static/gifs';

const hostname = '127.0.0.1';
const port = process.env.PORT | 3000
// Create an HTTP server that listens for incoming requests on port 8080
// http.createServer(function(request, response) {
// const cache = require('node-cache');

// // Clear the cache
// cache.flushAll();
var module = require('module');

// Use the module
// Create a custom `require.cache.clear()` method
require.cache.clear = function() {
	// Loop through all the keys in the require cache
	Object.keys(require.cache).forEach(function(key) {
	  // Delete the key from the require cache
	  delete require.cache[key];
	});
  };
  
  // Use the custom `require.cache.clear()` method to clear the cache
  
// Clear the cache
require.cache.clear();

// Require the module again to load the updated version
const updatedModule = require('module');

const server=http.createServer((request,response)=>{
  // If the request is for the root url "/", serve the image file
  if (request.url == "/") {
    // Read the image file from the filesystem
	fs.readdir(testFolder,(err,files)=>{
		var fileName=files[Math.floor(Math.random()*files.length)];
		console.log(fileName)
	fs.readFile("./static/gifs/"+fileName, function(err, data) {
		if (err) {
			// If there was an error reading the file, send a 404 Not Found response
			response.writeHead(404);
			response.end();
			return;
		}
	
		// Otherwise, send the image file data in the response
		response.writeHead(200, { "Content-Type": "image/jpeg" });
		response.end(data);
		});
		
	})
   
  }
})



server.listen(port, () => {console.log('Server Started');});
// fs.readdir(testFolder, (err, files) => {
// 	var fileName= files[Math.floor(Math.random()*files.length)];
// 	console.log(fileName)  
//   });