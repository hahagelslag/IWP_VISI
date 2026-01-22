// Simpele server om je chatbot te draaien
// Je hoeft hier niets aan te veranderen!

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Dit is een lijst van bestandstypes die de browser moet begrijpen
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
};

// Maak de server
const server = http.createServer((req, res) => {
    // Als iemand de hoofdpagina opent, geef index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Decode URL to handle spaces and other special characters (e.g., %20 -> space)
    filePath = decodeURIComponent(filePath);
    filePath = '.' + filePath;
    
    // Bepaal wat voor bestand het is
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'text/plain';
    
    // Lees het bestand en stuur het naar de browser
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Bestand niet gevonden
                res.writeHead(404);
                res.end('Bestand niet gevonden');
            } else {
                // Andere fout
                res.writeHead(500);
                res.end('Server fout: ' + error.code);
            }
        } else {
            // Alles goed, stuur het bestand
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start de server
server.listen(PORT, () => {
    console.log('✅ Vistolabs chatbot draait op http://localhost:3000');
    console.log('   Open deze link in je browser!');
    console.log('   Druk op Ctrl+C om te stoppen.');
});
