var mongodb = '127.0.0.1:27017/instapay';

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    mongodb = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
}

console.log(mongodb);

var mongojs = require('mongojs');
console.log(mongodb);
var db = mongojs(mongodb);
console.log(mongodb);
db.on('error', function (err) {console.log(mongodb);

    console.log('DATABASE ERROR: ', err);
});
db.on('connect', function () {console.log(mongodb);

    console.log('DATABASE CONNECTED');
});
console.log(mongodb);

var vendors = db.collection('vendors');
console.log(mongodb);

exports.saveVendor = function (req, res) {
    console.log("IN SAVE VENDOR");
    db.vendors.save({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            companyName: req.body.company_name,
            companyAddr: req.body.company_addr,
            password: req.body.password 
        }, function(err, saved) {
            if (err || !saved) {
                console.log("Vendor not saved ", err);
                return false;
            }
            else {
                console.log("Vendor saved");
                return true;
            }
    });
}
console.log(mongodb);

exports.findVendors = function (req, res) {
    db.vendors.find(function (err, docs) {
        if (err) {
            console.log("DB ERROR: ", err);
            return null;
        }
        return docs;
    });
}
