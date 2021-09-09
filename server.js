//integrate New Relic in to the application
require('newrelic');

const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const Window = require('window');
var _ = require('lodash');
var session = require('express-session');
var cookieSession = require('cookie-session')
var passport = require('passport'); 
var cookieParser = require('cookie-parser');
var fs = require('fs');
var intersect=require('intersect');
var https = require('https');
var settings = require('./settings.js');

var app = express();

// work around intermediate CA issue
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const window = new Window();

//createServer() section is run only for local environment
if (process.env.APP_ENV != "dev" && process.env.APP_ENV != "test" && process.env.APP_ENV != "prod") {
    https.createServer({
        key: fs.readFileSync('certificates/key.pem'),
        cert: fs.readFileSync('certificates/cert.pem')
   }, app).listen(9443);
}

app.use(cookieParser());
app.use(cookieSession({
    name:"session",
    keys: ['key1', 'key2']
}));
//app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));

app.use(function(req, res, next) {
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    //res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
    next();
});

app.use(passport.initialize());
app.use(passport.session()); 

var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
var Strategy = new OpenIDConnectStrategy({
    authorizationURL : settings.authorization_url,
    tokenURL : settings.token_url,
    clientID : settings.client_id,
    scope: 'openid',
    response_type: 'code',
    clientSecret : settings.client_secret,
    callbackURL : settings.callback_url,
    skipUserProfile: true,
    issuer: settings.issuer_id,
	addCACert: true,
    CACertPathList: [settings.cert, "/certificates/DigiCertGlobalRootCA.crt", "/certificates/DigiCertSHA2SecureServerCA.crt"]
    }, 

    function(iss, sub, profile, accessToken, refreshToken, params, done) {
        process.nextTick(function() {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            done(null, profile);
        })
    }
); 

passport.use('openidconnect', Strategy); 

passport.serializeUser(function(user, done) {
    //console.log("Serialize user token = ",token);
    console.log("User Blue groups:"+user['_json'].blueGroups);
    var userGroups;
    userGroups=user['_json'].blueGroups;
    var appGroups=settings.appAccess.split(",");
    console.log(" App groups:"+appGroups);
    user['_json'].blueGroups=intersect(userGroups,appGroups);
    console.log("Required User groups:"+user['_json'].blueGroups);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    //console.log("Deserialize user token = ",user);
    done(null, user);
});

// Get our API routes

app.get('/login', passport.authenticate('openidconnect', {})); 

function ensureAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.originalUrl = req.originalUrl;	
		res.redirect('/login');
	} else {
        console.log("req user.id = " + req.user.id)
        var bGroups=req.user._json.blueGroups;
        var arrGrps = settings.appAccess.split(",");
        if (arrGrps.some(function(element) {return (bGroups.indexOf(element) != -1)})) {
            return next();
        } else {
            res.send('<p style="margin-top:25px; margin-left:25px; font-size:25px">' + 
                    '<i>You are not authorized to access this page!!!</i></p>'
                    );
        }
	}
}

// handle callback, if authentication succeeds redirect to original requested url, otherwise go to /failure
app.get('/auth/sso/callback',function(req, res, next) {
    var redirect_url = req.session.originalUrl;
    console.log("redirect url = " + redirect_url );
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    //res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, Authorization');
	passport.authenticate('openidconnect', {
        successRedirect: redirect_url,    
		failureRedirect: '/failure',
	})(req,res,next);
});

app.get('/api/getuser', function(req, res) {
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    //res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, Authorization');
    //var user = req.user['_json'];
    //console.log(req);
    //res.send('Hello '+ claims.given_name + ' ' + claims.family_name + ', your email is ' + claims.email + '<br /> <a href=\'/\'>home</a>');
    res.json(req.user);  
}); 

app.get('/logout', function(req,res) {       
    req.logout();
    req.user=null
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        }
        req.session = null;     // destroy session data
        // redirect to homepage
        //res.header('Access-Control-Allow-Origin', '*');
        //res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
        //res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
        //res.redirect('/');
    });  
});

const api = require('./server/routes/api');

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist'), {
    index: false
}));

// Set our api routes
app.use('/api', ensureAuthenticated, api, function(req, res, next) {
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    //res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
    next();
});

app.get('*', ensureAuthenticated,(req, res) => {
    console.log("req.originalUrl = ",req.originalUrl);
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    //res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, Authorization');
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

//Get port from environment and store in Express
const port = process.env.PORT || '3000';
app.set('port', port);

//Create HTTP server
const server = http.createServer(app);

//Listen on provided port, on all network interfaces
server.listen(port, () => console.log(`API running on localhost:${port}`));
