var async = require('async');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var AuthAttempt = require('../../models/auth-attempt');
var config = require('../../config');


lab.experiment('AuthAttempt Class Methods', function () {

    lab.before(function (done) {

        AuthAttempt.connect(function (err, db) {

            done(err);
        });
    });


    lab.after(function (done) {

        AuthAttempt.remove({}, function (err, result) {

            AuthAttempt.disconnect();

            done(err);
        });
    });


    lab.test('it returns a new instance when create succeeds', function (done) {

        AuthAttempt.create('127.0.0.1', 'ren', function (err, result) {

            Lab.expect(err).to.not.be.ok;
            Lab.expect(result).to.be.an.instanceOf(AuthAttempt);

            done();
        });
    });


    lab.test('it returns an error when create fails', function (done) {

        var realInsert = AuthAttempt.insert;
        AuthAttempt.insert = function () {

            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();

            callback(Error('insert failed'));
        };

        AuthAttempt.create('127.0.0.1', 'ren', function (err, result) {

            Lab.expect(err).to.be.an('object');
            Lab.expect(result).to.not.be.ok;

            AuthAttempt.insert = realInsert;

            done();
        });
    });


    lab.test('it returns false when abuse is not detected', function (done) {

        AuthAttempt.abuseDetected('127.0.0.1', 'ren', function (err, result) {

            Lab.expect(err).to.not.be.ok;
            Lab.expect(result).to.equal(false);

            done();
        });
    });


    lab.test('it returns true when abuse is detected for user + ip combo', function (done) {

        var authAttemptsConfig = config.get('/authAttempts');
        var authSpam = [];

        for (var i = 0 ; i < authAttemptsConfig.forIpAndUser ; i++) {
            authSpam.push(function (cb) {

                AuthAttempt.create('127.0.0.1', 'stimpy', function (err, result) {

                    Lab.expect(err).to.not.be.ok;
                    Lab.expect(result).to.be.an('object');

                    cb();
                });
            });
        }

        async.parallel(authSpam, function () {

            AuthAttempt.abuseDetected('127.0.0.1', 'stimpy', function (err, result) {

                Lab.expect(err).to.not.be.ok;
                Lab.expect(result).to.equal(true);

                done();
            });
        });
    });


    lab.test('it returns true when abuse is detected for an ip and multiple users', function (done) {

        var authAttemptsConfig = config.get('/authAttempts');
        var authSpam = [];

        for (var i = 0 ; i < authAttemptsConfig.forIp ; i++) {
            authSpam.push(function (cb) {

                var randomUsername = 'mudskipper' + i;
                AuthAttempt.create('127.0.0.2', randomUsername, function (err, result) {

                    Lab.expect(err).to.not.be.ok;
                    Lab.expect(result).to.be.an('object');

                    cb();
                });
            });
        }

        async.parallel(authSpam, function () {

            AuthAttempt.abuseDetected('127.0.0.2', 'yak', function (err, result) {

                Lab.expect(err).to.not.be.ok;
                Lab.expect(result).to.equal(true);

                done();
            });
        });
    });


    lab.test('it returns an error when count fails', function (done) {

        var realCount = AuthAttempt.count;
        AuthAttempt.count = function () {

            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();

            callback(Error('count failed'));
        };

        AuthAttempt.abuseDetected('127.0.0.1', 'toastman', function (err, result) {

            Lab.expect(err).to.be.an('object');
            Lab.expect(result).to.not.be.ok;

            AuthAttempt.count = realCount;

            done();
        });
    });
});
