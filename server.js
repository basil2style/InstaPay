var express = require('express'),
app = express(),
port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
bodyParser = require('body-parser');
crypto = require('crypto'),
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
        var passHashBinary = crypto.pbkdf2Sync(req.body.password, req.body.email, 100000, 512, 'sha512');
        req.body.password = passHashBinary.digest('hex');
        db.saveVendor(req, function(err) {
            if (err) res.send("Error saving vendor: ", err);
            else res.send("Vendor saved successfully.");
        });
    }
    else if (req.body.login) {
        res.setHeader('Content-Type', 'text/text');
        res.status(200);
        var passHashBinary = crypto.pbkdf2Sync(req.body.password, req.body.email, 100000, 512, 'sha512');
        req.body.password = passHashBinary.digest('hex');
        db.findVendorByEmail(req, function(err, doc) {
            console.log("DOC: ", doc.password.buffer);
            console.log("PASS: ", req.body.password);
            if (err || !doc) res.send("Vendor not registered ", err);
            else if (doc.password.buffer === req.body.password) res.send("Login success.");
            else res.send("Invalid login.");
        });
    }
});

app.get('/vendors', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200);
    db.findVendors(function (err, docs) {
        if (!err)
            res.send(JSON.stringify(docs, null, 2));
        else res.send("Error finding vendors: ", err);
    });
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
