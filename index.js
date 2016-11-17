const exec = require('child_process').exec;
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
const async = require('async');

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, '/tmp/upload')
    },
    filename(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.pdf')
    }
});

const upload = multer({
    storage
});

app.post('/upload', upload.single('pdffile'), (req, res) => {
    if (!req.file) {
        return res.sendStatus(400);
    }
    console.log(req.file);
    const {
        filename
    } = req.file;
    const filepath = path.join('/tmp/upload', filename);
    async.series([
        callback => {
            const pdf2htmlEXCmd = [
                'pdf2htmlEX',
                '--zoom 1.3',
                '--no-drm 1',
                '--dest-dir /tmp/converted',
                '--clean-tmp 1',
                '--tmp-dir /tmp/converting',
                filepath
            ];
            exec(pdf2htmlEXCmd.join(' '), (errorConvert, stdout, stderr) => {
                console.log(errorConvert);
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);

                if (errorConvert) {
                    return callback({
                        status: 500,
                        json: { error: errorConvert }
                    });
                }

                if (stderr) {
                    return callback({
                        status: 500,
                        json: { error: stderr }
                    });
                }
                callback();
            });
        },
        callback => {
            const pdfFilename = filename.substring(0, filename.length - 3) + 'html';
            fs.readFile(path.join('/tmp/converted', pdfFilename, 'utf8'), (readFileError, file) => {
                if(readFileError) {
                    return callback({
                        status: 500,
                        error: readFileError
                    });
                }
                res.send(file);
                callback();
            });
        }
    ], error => {
        if (error) {
            res.status(500).json({
                error
            });
        }
        fs.unlink(filepath, errorDelFile => console.error(errorDelFile));
    });

})

app.listen(3000, '0.0.0.0', () => {
    console.log('App listening on port 3000!')
});

