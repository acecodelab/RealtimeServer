var express = require('express');
var router = express.Router();
var s = require('../webViewServer');
const testFolder = './public';
const fs = require('fs');
var path = require('path');
const multer = require('multer');

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
    fs.readdir(path.join(__dirname, '../public'), function (err, images) {
        if (err) {
            return console.error(err)
        }
        images.forEach(file => {
            imageListName.push(file)
        });
        res.send(imageListName)
    })

})



router.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/'));
    },
    filename: (req, file, cb) => {
        var extension = getExtension(file.originalname)
        cb(null, '1.' + extension);
    }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send('File uploaded!');
    } else {
        res.send('No file selected.');
    }
});

function getExtension(filename) {
    console.log(filename)
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}

module.exports = router;
