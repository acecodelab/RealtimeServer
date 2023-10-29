var express = require('express');
var router = express.Router();
var s = require('../webViewServer');

router.post('/command/:cardId', function(req, res) {
    var cardId = req.params.cardId;
    var data = req.body;

    console.log('hI hERE', data);
    s.send(cardId, data, function(err, receivedData){
        if(err){
            res.status(500).send(err.message)
			console.error(new Date(),cardId, err);
        }else
            res.json(receivedData)
    });
});


router.post('/',function(req,res){
console.log(req.body,'Sensor data');
})

module.exports = router;
