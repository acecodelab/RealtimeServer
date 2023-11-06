var express = require('express');
var router = express.Router();
var s = require('../webViewServer');
const testFolder = './public';
const fs = require('fs');
var path = require('path');
const multer = require('multer');
var { pool } = require('../db');

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
    var imageListName = [];
    const getData = 'SELECT * from adv ORDER BY id DESC LIMIT 5';
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

router.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        const queryText = 'INSERT INTO public.adv(name, animation, "from", "to", status)VALUES (' + "'" + req.file.originalname + "'" + ', ' + "'" + req.body.transactionResult + "'" + ', ' + "'" + req.body.datetimefrom + "'" + ',  ' + "'" + req.body.datetimeto + "'" + ',' + "'Y'" + ' );';

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
