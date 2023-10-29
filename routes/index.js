var express = require('express');
var router = express.Router();
var s = require('../webViewServer');
const testFolder = './public';
const fs = require('fs');
var path = require('path');


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
    var imageListName=[];
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

module.exports = router;
