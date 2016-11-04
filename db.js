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
            first_name: user.body.first_name,
            last_name: user.body.last_name,
            email: user.body.email,
            user_name: user.body.user_name,
            password: user.body.password,
            home_addr: user.body.home_addr,
            postal_code: user.body.postal_code,
            phone: user.body.phone
        }, function(err, saved) {
            if (err || !saved) {
                console.log("User not saved ", err);
                callback(null, err);
            }
            else {
                console.log("User saved");
                callback(null, saved);
            }
    });
}
exports.findUserByEmail = function (req, callback) {
    db.users.findOne({
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