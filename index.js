const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {

	let filePath = path.join(
		__dirname,
		'public', 
		req.url === '/' ? 'index.html' : req.url
	);

	// get extension of the file
	let extName = path.extname(filePath);

	// initial content type
	let contentType = 'text/html';

	switch(extName){
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.json':
			contentType = 'application/json';
			break;
		case '.png':
			contentType = 'image/png';
			break;
		case '.jpg':
			contentType = 'image/jpg';
			break;
	}


	// read file
	fs.readFile(filePath, (err, content) => {
		if (err) {
			if (err.code == 'ENOENT'){
				// Page not found
				fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
					res.writeHead(200, { 'Content-Type': 'text/html' });
					res.end(content, 'utf8');
				});
			} else {
				// some server error
				res.writeHead(500);
				res.end(`Server Error: ${err.code}`);
			}
		} else {
			// if no error -- successful response
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf8');
		}
	});
	
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));