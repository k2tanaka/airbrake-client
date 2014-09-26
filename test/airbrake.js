var should = require('should');
var options = require('./options.json');
var airbrake = require('../').createClient(options);

describe('airbrake.js', function() {

    describe('airbrake', function() {
        it('err notify', function(done) {
            var err = {
                type: 'error_2',
                message: {data: {1: {2:{3:{4: 'aaaaaaaaaaaaaaa'}}}}}            };

            airbrake.notify(err, done);
        });
    });
});
