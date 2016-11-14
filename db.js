var mongojs = require('mongojs');

var mongodb = '127.0.0.1:27017/instapay';

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    mongodb = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
}

var db = mongojs(mongodb, ['vendors', 'products', 'users']);
db.on('error', function (err) {
    console.log('DATABASE ERROR: ', err);
});
db.on('connect', function () {
    console.log('DATABASE CONNECTED');
});

var vendors = db.collection('vendors');
var products = db.collection('products');

var exports = module.exports;
exports.saveVendor = function (vendor, callback) {
    db.vendors.save({
            first_name: vendor.body.fname,
            last_name: vendor.body.lname,
            email: vendor.body.email,
            password: vendor.body.password,
            company_name: vendor.body.companyname,
            company_addr: vendor.body.companyaddr,
            postal_code: vendor.body.pcode,
            phone: vendor.body.phone
        }, function(err, saved) {
            if (err || !saved) {
                console.log("Vendor not saved ", err);
                callback(null, err);
            }
            else {
                console.log("Vendor saved");
                callback(null, saved);
            }
    });
}
exports.findVendors = function (callback) {
    db.vendors.find(function (err, docs) {
        if (err) {
            console.log("DB ERROR: ", err);
            callback(null, err);
        } else callback(null, docs);
    });
}
exports.findProducts = function (callback) {
    db.products.find(function (err, docs) {
        if (err) {
            console.log("DB ERROR: ", err);
            callback(null, err);
        } else callback(null, docs);
    });
}
exports.findVendorByEmail = function (req, callback) {
    db.vendors.findOne({
        email: req.body.email
    }, function(err, doc) {
        if (err || !doc) {
            console.log("DB ERROR: ", err);
            callback(null, err);
        } else {
            callback(null, doc);
        }
    });
}
exports.saveProduct = function (product, callback) {
    db.products.save({
            vendor: product.body.email,
            product_id: product.body.productid,
            name: product.body.productname,
            price: product.body.productprice
        }, function(err, saved) {
            if (err || !saved) {
                console.log("Product not saved ", err);
                callback(null, err);
            }
            else {
                console.log("Product saved");
                callback(null, saved);
            }
    });
}
exports.saveUser = function (user, callback) {
    db.users.save({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userName: user.userName,
            password: user.password,
            homeAddr: user.homeAddr,
            postalCode: user.postalCode,
            phone: user.phone
        }, function(err, saved) {
            if (err) {
                console.log('DB ERROR: ', err);
                user.err = 'Database error. Try after some time.';
            } else if (!saved) {
                user.err = 'Registration failed. Try again.';
            } else if (saved) {
                console.log('SAVED: ' + JSON.stringify(saved));
                user.success = true;
            }
            callback(err);
    });
}
exports.findUserByEmail = function (req, callback) {
    db.users.findOne({
        $or: [
            { email: req.email }, 
            { userName: req.userName }
        ]
    }, function(err, doc) {
        if (err) {
            console.log('DB ERROR: ', err);
            req.err = 'Database error. Try after some time.';
        } else if (!doc || doc.password != req.password) {
            req.err = 'Invalid login. Try again.';
        } else if (doc.password == req.password) {
            req.success = true;
        }
        callback(req);
    });
}