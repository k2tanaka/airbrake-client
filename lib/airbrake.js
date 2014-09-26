var fs = require('fs');
var os = require('os');

var xmlbuilder = require('xmlbuilder');
var stackTrace = require('stack-trace');
var _ = require('lodash');

var Request = require('./request');

var URL = 'http://api.airbrake.io/notifier_api/v2/notices';
var NOTICE_VERSION = '2.3';

var Airbrake = function() {
    this.host = 'http://' + os.hostname();
    this.key = null;
    this.env = null;
    this.appVersion = null;

    this.request = null;
};

module.exports = Airbrake;


Airbrake.PACKAGE = (function() {
  var json = fs.readFileSync(__dirname + '/../package.json', 'utf8');
  return JSON.parse(json);
})();

function stringify(obj) {
    var d = '';
    for (var k in obj) {
        d += (k + ': ' + obj[k] + ', ');
    }

    return d;
}

function editMessage(err) {
    var e = err.message || err;

    if (!_.isObject(e)) {
        return e;
    }
    return JSON.stringify(e);
}

function addTrace(xml, err) {
    var trace = stackTrace.parse(err);
    if (trace.length === 0) {
        return;
    }

    var node = xml.ele('errow').ele('backtrace');

    trace.forEach(function(callSite) {
        node
        .ele('line')
            .att('method', callSite.getFunctionName() || '')
            .att('file', callSite.getFileName() || '')
            .att('number', callSite.getLineNumber() || '');
    });
}

function addCgiData(xml) {

    var cgiData = (function(){
        var o = {};

        o['os.hostname'] = os.hostname();
        o['process.pid'] = process.pid;
        o['process.version'] = process.version;
        o['process.memoryUsage'] = process.memoryUsage();
        o['os.loadavg'] = os.loadavg();

        return o;
    }());

    var node = xml.ele('request').ele('cgi-data');

    for (var key in cgiData) {
        var val = cgiData[key];

        if (_.isObject(val)) {
            val = stringify(val);
        }

        node
        .ele('var')
        .att('key', key)
        .txt(val);
    }
}

/**
 * setup
 * @param {Object} option
 *      {
 *          key: 'adklfalenra' // Project API Key
 *          env: 'product'     // enviroment ex) development, staging, product
 *          timeout: 5000,     // timeout(ms)
 *          maxSockets: 100    // http pool
 *          proxy: 'http://internal-vpcp-hogehoge' // http proxy
 *      }
 */
Airbrake.createClient = function(option) {
    var instance = new this();

    instance.key = option.key;
    instance.env = option.env;
    instance.appVersion = option.appVersion || '';

    // setup request
    instance.request = new Request(option);

    return instance;
};

/**
 * notify
 * @param {Object} err
 */
Airbrake.prototype.notify = function(err, callback) {

    callback = callback || function(){};

    var body = this._genXml(err);

    var headers = {
        'Content-Length': body.length,
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
    };

    this.request.post(URL, '', body, headers, callback);
};

/**
 *  private
 */
Airbrake.prototype._genXml = function(err, pretty) {

    var errClass = err.type || err.id || err._id || err.name || 'Error';

    var xml = xmlbuilder.create({
        notice: {
            '@version': NOTICE_VERSION,

            'api-key': { '#text': this.key },

            'notifier': {
                'name': { '#text': Airbrake.PACKAGE.name },
                'version': { '#text': Airbrake.PACKAGE.version },
                'url': { '#text': Airbrake.PACKAGE.homepage },
            },

            'error': {
                'class': { '#text': errClass },
                'message': { '#text': editMessage(err) },
            },

            'request': {
                'url': { '#text': this.host }
            },

            'server-environment': {
                'environment-name': { '#text': this.env },
                'app-version': { '#text': this.appVersion },
            }
        }
    });

    // set backtrace
    addTrace(xml, err);

    // set cgi-data
    addCgiData(xml);

    return xml.doc().toString({pretty: pretty});
};

