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
app.set('view engine', 'pug');

app.get('/login', function (req, res) {
    res.render('login');
});
app.get('/register', function (req, res) {
    res.render('register');
});
app.get('/product', function (req, res) {
    res.render('product');
});

app.post('/vendors', function (req, res) {
    if (req.body.register) {
        res.setHeader('Content-Type', 'text/text');
        res.status(200);
        req.body.password = new Buffer(crypto.pbkdf2Sync(
                req.body.password, req.body.email, 100000, 512, 'sha512'), 'binary').toString('base64');
        db.saveVendor(req, function(err) {
            if (err) res.send("Error saving vendor: ", err);
            else res.send("Vendor saved successfully.");
        });
    }
    else if (req.body.login) {
        res.setHeader('Content-Type', 'text/text');
        res.status(200);
        req.body.password = new Buffer(crypto.pbkdf2Sync(
                req.body.password, req.body.email, 100000, 512, 'sha512'), 'binary').toString('base64');
        db.findVendorByEmail(req, function(err, doc) {
            if (err || !doc) res.send("Vendor not registered ", err);
            else if (doc.password === req.body.password) res.redirect("/product");
            else res.send("Invalid login.");
        });
    }
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
