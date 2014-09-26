var error = {
    common: {
        name: 'ServerException',
        message: 'server exception.',
        code: 0
    },
    unsupported: {
        name: 'RequestUnSupportedException',
        message: 'request unsupported exception.',
        code: 1
    },
};

module.exports = function _e(type, name, message, code) {
    var e = error[type] || error.common;
    return {
        name: name || e.name,
        message: message || e.message,
        code: code || e.code
    };
};

