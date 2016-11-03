var express = require('express'),
session = require('express-session'),
app = express(),
bodyParser = require('body-parser');
crypto = require('crypto'),
db = require('./db.js');

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
CRYPTO_ITERATIONS = 10000,
CRYPTO_KEY_LENGTH = 512,
CRYPTO_DIGEST = 'sha512',
CRYPTO_STRING_TYPE = 'base64';

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.set('view engine', 'pug');

app.use('/', express.static(__dirname + '/views'));

app.get('/login', function (req, res) {
    var sess = req.session;
    if (sess.email) {
        res.redirect('/product');
    } else res.render('login');
});
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/register', function (req, res) {
    var sess = req.session;
    if (sess.email) {
        res.redirect('/product');
    } else res.render('register');
});
app.get('/product', function (req, res) {
    var sess = req.session;
    if (!sess.email) {
        res.redirect('/login');
    } else res.render('product');
});

app.post('/vendor', function (req, res) {
    if (req.body.register) {
        res.setHeader('Content-Type', 'text/text');
        res.status(200);
        req.body.password = new Buffer(crypto.pbkdf2Sync(
                req.body.password,
                req.body.email,
                CRYPTO_ITERATIONS,
                CRYPTO_KEY_LENGTH,
                CRYPTO_DIGEST
            ), 'binary').toString(CRYPTO_STRING_TYPE);
        db.saveVendor(req, function(err) {
            if (err) res.send("Error saving vendor: ", err);
            else res.send("Vendor saved successfully.");
        });
    }
    else if (req.body.login) {
        var sess = req.session;
        if (sess.email) {
            res.redirect('/product');
        } else {
            res.setHeader('Content-Type', 'text/text');
            res.status(200);
            req.body.password = new Buffer(crypto.pbkdf2Sync(
                    req.body.password,
                    req.body.email,
                    CRYPTO_ITERATIONS,
                    CRYPTO_KEY_LENGTH,
                    CRYPTO_DIGEST
                ), 'binary').toString(CRYPTO_STRING_TYPE);
            db.findVendorByEmail(req, function(err, doc) {
                if (err || !doc) res.send("Vendor not registered ", err);
                else if (doc.password === req.body.password) {
                    sess.email = req.body.email;
                    res.redirect("/product");
                }
                else res.send("Invalid login.");
            });
        }
    }
});

app.post('/user', function (req, res) {
    if (req.body.register) {
        req.body.password = new Buffer(crypto.pbkdf2Sync(
                req.body.password,
                req.body.email,
                CRYPTO_ITERATIONS,
                CRYPTO_KEY_LENGTH,
                CRYPTO_DIGEST
            ), 'binary').toString(CRYPTO_STRING_TYPE);
        db.saveUser(req, function(err) {
            if (err) res.send(err);
            else res.send(1);
        });
    }
    else if (req.body.login) {
        var sess = req.session;
        if (sess.email) {
            res.redirect('/product');
        } else {
            res.setHeader('Content-Type', 'text/text');
            res.status(200);
            req.body.password = new Buffer(crypto.pbkdf2Sync(
                    req.body.password,
                    req.body.email,
                    CRYPTO_ITERATIONS,
                    CRYPTO_KEY_LENGTH,
                    CRYPTO_DIGEST
                ), 'binary').toString(CRYPTO_STRING_TYPE);
            db.findVendorByEmail(req, function(err, doc) {
                if (err || !doc) res.send("Vendor not registered ", err);
                else if (doc.password === req.body.password) {
                    sess.email = req.body.email;
                    res.redirect("/product");
                }
                else res.send("Invalid login.");
            });
        }
    }
});

app.post('/product', function (req, res) {
    var sess = req.session;
    if (!sess.email) {
        res.redirect('/login');
    } else {
        res.setHeader('Content-Type', 'text/text');
        res.status(200);
        req.body.email = sess.email;
        db.saveProduct(req, function(err) {
            if (err) res.send("Error saving product: ", err);
            else res.send("Product saved successfully.");
        });
    }
});

app.get('/vendors', function (req, res) {
    db.findVendors(function(err, docs) {
        if (!err) {
            res.status(200);
            res.send(JSON.stringify(docs, null, 2));
        }
        else res.send("ERROR");
    });
});
app.get('/products', function (req, res) {
    db.findProducts(function(err, docs) {
        if (!err) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
            res.status(200);
            res.send(JSON.stringify(docs, null, 2));
        }
        else res.send("ERROR");
    });
});

app.get('/products/:id', function (req, res) {
    db.findProducts(function(err, docs) {
        if (!err) {
            var found = false;
            for (doc of docs) {
                if (req.params.id == doc.pID) {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
                    res.status(200);
                    res.send(doc);
                    found = true;
                }
            }
            if (!found) {
                res.status(200);
                res.send('Product not found.');
            }
        }
        else res.send("ERROR");
    });
});

app.listen(port, ip, function() {
    console.log(`\nServer home: http://${ip}:${port}/`);
    console.log(`Server endpoint: http://${ip}:${port}/login :Login vendor`);
    console.log(`Server endpoint: http://${ip}:${port}/register :Register vendor`);
    console.log(`Server endpoint: http://${ip}:${port}/product :Add product`);
    console.log(`Server endpoint: http://${ip}:${port}/products :Show all added products`);
    console.log(`Server endpoint: http://${ip}:${port}/vendor :Do login or do register and redirect`);
    console.log(`Server endpoint: http://${ip}:${port}/vendors :Show all registered vendors`);
});

