
## Example

```javascript

// client setup
var option =  {
    "key": "adklfalenra" // Project API Key
    "env": "product"     // enviroment ex) development, staging, product
    "timeout": 5000,     // timeout(ms)
    "maxSockets": 100    // http connections
    "proxy": "http://internal-vpcp-hogehoge" // http proxy( or false)
};

var airbrake = require('airbrake-client').createClient(options);

// notify
var err = { type: 'err_type_1', message: 'system error occurred' };
airbrake.notify(err);

// notify with callback
var err = { type: 'err_type_1', message: 'system error occurred' };
airbrake.notify(err, function(err, result){
    console.log(result);
});
```
