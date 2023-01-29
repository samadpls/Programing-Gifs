var http = require("http");
var fs = require("fs");
const testFolder = './static/gifs';

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
  response.writeHead(200, {
    "Content-Type": "image/gif",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  response.end(data);
});


    });
  }
});

server.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
