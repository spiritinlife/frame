var Lab = require('lab');
var lab = exports.lab = Lab.script();
var manifest = require('../manifest');


lab.experiment('Manifest', function () {

    lab.test('it gets manifest data', function (done) {

        Lab.expect(manifest.get('/')).to.be.an('object');

        done();
    });


    lab.test('it gets manifest meta data', function (done) {

        Lab.expect(manifest.meta('/')).to.match(/this file defines the plot device/i);

        done();
    });
});
