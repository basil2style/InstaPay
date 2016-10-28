var mongojs = require('mongojs');
var crypto = require('crypto');

var mongodb = '127.0.0.1:27017/instapay';

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    mongodb = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
}

var db = mongojs(mongodb, ['vendors']);
db.on('error', function (err) {
    console.log('DATABASE ERROR: ', err);
});
db.on('connect', function () {
    console.log('DATABASE CONNECTED');
});

var vendors = db.collection('vendors');

var exports = module.exports;
exports.saveVendor = function (vendor, callback) {
    const password = crypto.pbkdf2Sync(vendor.body.password, vendor.body.email, 100000, 512, 'sha512');
    db.vendors.save({
            name: vendor.body.name,
            email: vendor.body.email,
            phone: vendor.body.phone,
            companyName: vendor.body.company_name,
            companyAddr: vendor.body.company_addr,
            password: password
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
