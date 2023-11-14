var express = require('express');
var router = express.Router();
var s = require('../webViewServer');
const testFolder = './public';
const fs = require('fs');
var path = require('path');
const multer = require('multer');
const moment = require('moment-timezone');
var { pool } = require('../db');
const sizeOf = require('image-size');
const getDimensions = require('get-video-dimensions');

router.get('/checkCurrentImages', (req, res) => {
    const imageFolder = path.join(__dirname, '../public/');
    fs.readdir(imageFolder, (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            var filesFinal = []
            for (let i = 0; i < files.length; i++) {
                console.log(files[i])
                if (files[i].includes('expire')) {
                } else {
                    filesFinal.push(files[i])
                }

            }
            res.render('index', { images: filesFinal });
        }
    });
});

router.get('/delete/:image', (req, res) => {
    const imageFolder = path.join(__dirname, '../public');
    const imagePath = `${imageFolder}/${req.params.image}`;
    const expire = 'expire';
    const newPath = `${imageFolder}/${expire}_${req.params.image}`;

    fs.rename(imagePath, newPath, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting the image');
        } else {
            var imageListName = [];
            const getData = 'UPDATE adv set status=' + "'N'" + ' where name=' + "'" + req.params.image + "'";
            pool.query(getData)
                .then((result) => {
                    console.log('Image deleted:', req.params.image);
                    res.redirect('/checkCurrentImages');
                })
                .catch((err) => {
                    console.error('Error executing query:', err);
                });
        }
    });
});



router.post('/command/:cardId', function (req, res) {
    var cardId = req.params.cardId;
    var data = req.body;

    console.log('hI hERE', data);
    s.send(cardId, data, function (err, receivedData) {
        if (err) {
            res.status(500).send(err.message)
            console.error(new Date(), cardId, err);
        } else
            res.json(receivedData)
    });
});


router.post('/', function (req, res) {
    console.log(req.body, 'Sensor data');
})

router.get('/getUploadData', function (req, res) {
    const currentDate = new Date();
    console.log(currentDate, "Current Date/Time");
    var imageListName = [];
    const getData = 'SELECT * from adv where status=' + "'Y'" + ' ORDER BY id DESC LIMIT 5';
    pool.query(getData)
        .then((result) => {
            res.send(result.rows)
        })
        .catch((err) => {
            console.error('Error executing query:', err);
        });



})

router.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/'));
    },
    filename: (req, file, cb) => {
        var result = readAllFilesInDir(path.join(__dirname, '../public/'))
        if (result.length == 5) {
            deleteAllFilesInDir(path.join(__dirname, '../public/'), result[0])
        }
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    const currentDate = new Date();
    console.log(currentDate, "Current Date/Time");

    if (req.file.mimetype.startsWith('image/')) {
        const dimensions = sizeOf(req.file.path);
        if (dimensions.width !== 640 || dimensions.height !== 480) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    return res.status(400).send('Image resolution must be 640x480 pixels.');
                }
            });
        }
    }

    if (req.file.mimetype.startsWith('video/')) {
        try {
            // const dimensions = await getVideoDimensions(req.file.path);
            // if (!dimensions || dimensions.width !== 640 || dimensions.height !== 480) {
            //     fs.unlink(req.file.path, (err) => {
            //         if (err) {
            //             console.error('Error deleting file:', err);
            //         } else {
            //             throw new Error('Video resolution must be 640x480 pixels.');
            //         }
            //     });
            // }
        } catch (error) {
            return res.status(400).send(error.message);
        }
    }


    const fileExtension = path.extname(req.file.originalname);
    console.log(fileExtension)
    var size;
    if (fileExtension == '.mp4') {
        size = 2
    }
    else {
        size = 1
    }
    if (req.file.size > 1024 * 1024 * parseInt(size)) {
        return fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                return res.status(400).send('File size exceeds the limit of ' + size + ' MB.');
            }
        });
    }

    if (req.file) {
        var from = new Date(req.body.datetimefrom); // Adjust the date, time, and time zone accordingly
        var to = new Date(req.body.datetimeto);
        console.log(from + '-----' + to)

        const queryText = 'INSERT INTO public.adv(name, animation, "from", "to", status,duration)VALUES (' + "'" + req.file.originalname + "'" + ', ' + "'" + req.body.transactionResult + "'" + ', ' + "'" + timezone('UTC', from) + "'" + ',  ' + "'" + timezone('UTC', to) + "'" + ',' + "'Y'" + ',  ' + "'" + req.body.duration + "'" + ' );';

        pool.query(queryText)
            .then((result) => {
                res.send('File uploaded!');
            })
            .catch((err) => {
                console.error('Error executing query:', err);
            });

    } else {
        res.send('No file selected.');
    }
});

function getExtension(filename) {
    var ext = path.extname(filename || '').split('.');
    return ext;
}

function deleteAllFilesInDir(dirPath, file) {
    try {
        fs.unlinkSync(path.join(dirPath, file));
    } catch (error) {
        console.log(error);
    }
}

function readAllFilesInDir(dirPath) {
    var images = []
    try {
        fs.readdirSync(dirPath).forEach(file => {
            images.push(file)
        });
    } catch (error) {
        console.log(error);
    }
    return images;
}
module.exports = router;
