var querystring = require('querystring');

var request = require('request');

var _e = require('./error');

function Request(options) {
    this.options = {};
    this.options.url = options.url;
    this.options.timeout = options.timeout || 5000;
    this.options.maxSockets = options.maxSockets || 100;
    this.options.proxy = options.proxy;
}

module.exports = Request;

/**
 * execute
 * @param {Object} options
 * @param {Function} callback
 */
Request.prototype.execute = function(options, callback) {
    var self = this;
    request(options, function(err, res, body) {
        if (err) {
            return callback(err);
        }

        if (res.statusCode !== 200) {
            return callback(res.statusCode, body);
        }

        callback(null, body);
    });
};

/**
 * @param {String} url
 * @param {String} path ホスト名の後に続くpath
 * @param {String} method HTTP method
 * @param {Object} headers
 * @return {Object} options
 */
Request.prototype.getOptions = function(url, path, method, headers) {
    var opts = {
        uri: url + path,
        method: method,
        headers: headers,
        encoding: 'utf8',
        timeout: this.options.timeout,
        pool: {
            maxSockets: this.options.maxSockets
        },
        strictSSL: false
    };

    if (this.options.proxy) {
        opts.proxy = this.options.proxy;
    }

    return opts;
};

/**
 * http methods
 * @param {String} url
 * @param {String} path
 * @param {Object} data
 * @param {Object} headers
 * @param {Function} callback
 */
Request.prototype.post = function(url, path, data, headers, callback) {
    headers = headers || {};

    var options = this.getOptions(url, path, 'POST', headers);
    options.body = data;

    this.execute(options, callback);
};

Request.prototype.get = function(url, path, data, headers, callback) {
    callback(_e('unsupported'));
};

Request.prototype.put = function(url, path, data, callback) {
    callback(_e('unsupported'));
};

Request.prototype.delete = function(url, path, data, callback) {
    callback(_e('unsupported'));
};

