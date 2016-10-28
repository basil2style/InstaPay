var express = require('express'),
app = express(),
port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
bodyParser = require('body-parser'),
db = require('./db.js');

app.use(express.static(__dirname + '/'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post('/vendors', function (req, res) {
    if (req.body.register) {
        res.setHeader('Content-Type', 'text/text');
        res.status(200);
        if (db.saveVendor(req)) 
            res.send("success");
        else res.send("failed");
    }
});

app.get('/vendors', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200);
    res.send(JSON.stringify(db.findVendors(), null, 2));
});

app.get('/info', function (req, res) {
    var response;
    response = `Server home: http://${ip}:${port}/`;
    res.setHeader('Content-Type', 'text/plain');
    res.status(200);
    res.send(response);
});

app.listen(port, ip, function() {
    console.log(`\nServer home: http://${ip}:${port}/`);
});
