var ssoLocal = require('./sso-local.json')

//set the sso parameters based on the environment
if (process.env.APP_ENV != "dev" && process.env.APP_ENV != "test" && process.env.APP_ENV != "prod") {
    exports.client_id = ssoLocal.client_id;
    exports.client_secret = ssoLocal.client_secret;
    exports.authorization_url = ssoLocal.authorization_url;
    exports.token_url = ssoLocal.token_url;
    exports.issuer_id = ssoLocal.issuer_id;
    exports.cert = ssoLocal.cert;
    exports.callback_url = ssoLocal.callback_url;
    exports.appAccess = ssoLocal.bg_app_access;  //obtain the bluegroup value
    exports.publicdb2connectionURL = ssoLocal.publicdb2connectionURL;  //obtain the Db2 connecion URL on Public cloud
} else {
    exports.client_id = process.env.client_id;
    exports.client_secret = process.env.client_secret;
    exports.authorization_url = process.env.authorization_url;
    exports.token_url = process.env.token_url;
    exports.issuer_id = process.env.issuer_id;
    exports.cert = process.env.cert;
    exports.callback_url = process.env.callback_url;
    exports.appAccess = process.env.bg_app_access;  //obtain the bluegroup value
    exports.publicdb2connectionURL = process.env.publicdb2connectionURL;  //obtain the Db2 connecion URL on Public cloud
}