// Intialize global variables here

global.rootdir = __dirname;
global.config = require('config');
global.logger = require(rootdir + '/util/LogUtil');
global.restClient = require(rootdir + '/util/RestClient');

import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import methodOverride from 'method-override';
import { formatError } from './data/errors';
import NoIntrospection from 'graphql-disable-introspection';
import logger from './corelib/AppLogger';
import AppCore from './corelib/AppCore';
import ValidateSession from './corelib/SessionValidation';
import sso, { setAppPathCookie, redirection } from './corelib/sso';
import ssorouter from './routes';

const helmet = require('helmet');
const path = require('path');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const querystring = require('querystring');

let app = AppCore("vpgraphql");

// const extConsole = require('./util/ExtConsole');

// const Sentry = require('@sentry/node')

// Sentry Initialization
// Sentry.init({
//      dsn: 'https://1bd7952ad05e4bbfa89bdf62219a309d@sentry.ebiz.verizon.com/4854',
//      release: 'PI23Q4',
//      environment: process.env.NODE_ENV
//        });


app.use(helmet());
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(helmet.contentSecurityPolicy({
    directives: {
        "default-src": ["'self'", "blob:"],
        "script-src": ["'self'","https: *.newrelic.com", "bam.nr-data.net", "bam-cell.nr-data.net","js-agent.newrelic.com", "'unsafe-inline'", "'unsafe-eval'", "cdnjs.cloudflare.com", "maps.googleapis.com", "blob:"],
        "object-src": ["'none'"],
        "style-src": ["'self'", "'unsafe-inline'", "https: respframework.verizon.com", "https: fonts.googleapis.com", "use.fontawesome.com", "blob:"],
        "img-src": ["'self'", "khms0.googleapis.com","https: bam.nr-data.net", "khms1.googleapis.com", "maps.gstatic.com", "maps.googleapis.com", "data:", "blob:"],
        "font-src": ["'self'", "https: respframework.verizon.com", "https: fonts.googleapis.com", "use.fontawesome.com", "maps.googleapis.com", "https: fonts.gstatic.com"],
        "frame-src": ["'self'"],
        "connect-src": ["'self'", "file:", "data:", "blob:", "filesystem:","bam.nr-data.net", "bam-cell.nr-data.net"],
        // "style-src-elem": ["'self'","'unsafe-inline'", "respframework.verizon.com", "fonts.googleapis.com", "use.fontawesome.com", "blob:"]
    },
}));
// Add CORS support
app.set('trust proxy', 'loopback');// this is to trust request coming only from localhost nginx
app.use(function (req, res, next) {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).json({ message: "succeess" })
        return;
    }

    if (req.url.indexOf('?') >= 0) {
        let oQueryParams = querystring.parse(req.url.replace(/^.*\?/, ''));
        if (oQueryParams && oQueryParams.q === '1') {
            proxy.web(req, res);
            return;
        }
    }
    next();
});

app.use('/', sso)
app.use(config.sso.baseISSOpath, ssorouter)
process.on('uncaughtException', function (err) {
    console.log(err);
});

process.on('unhandledRejection', function (reason, p) {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// Sso redirect based on the input referer
app.get(`/sso/${config.app.graphQlPath}`, redirection)

// To handle invalid json request format exposing internal directory paths causing security issue
app.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        logger.getLogger().error("request SyntaxError : " + err);
        res.status(400).send({
            errors: [{
                message: "Invalid Request format"
            }]
        });
    } else next();
});

// app.use('/', sso)
app.use('/errorpage', express.static(path.join(__dirname, 'public/errorpage')))
app.use(`${config.app.graphQlPath}/errorpage`, express.static(path.join(__dirname, 'public/errorpage')))
app.use('/ssosession', express.static(path.join(__dirname, 'public')))

// route added for isso
// app.use('/sso', ssoroutes)

app.use(`${config.app.graphQlPath}/lv1`, bodyParser.json({ limit: '250mb' }), graphqlExpress(req => ({ formatError, schema: loginschema, validationRules: [NoIntrospection], context: { req } })));
// app.use(`${config.app.graphQlPath}/images`, ValidateSession, setAppPathCookie, imageroutes);
// app.use(config.app.graphQlPath, ValidateSession, bodyParser.json({limit: '250mb'}), setAppPathCookie, graphqlExpress(req => ({ formatError,schema,validationRules:[NoIntrospection],context:{req}})));
// For production
//app.use('/graphqlstaging/graphql4g', /*ValidateSession, */ bodyParser.json({ limit: '250mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
// COMMENT BELOW IF NOT NEEDED /graphql
app.use('/graphql', ValidateSession, bodyParser.json({ limit: '250mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));

const staticFileOptions = { maxAge: '15d' }

app.use(/\/vpmadmin\w{0,}/, express.static(config.resources.vpmadminPath, staticFileOptions));
app.use(/\/vendorportaltest\w{0,}/, express.static(config.resources.vpmadminPath, staticFileOptions));
app.use(/\/vpnetworktest\w{0,}/, express.static(config.resources.rapsPath, staticFileOptions));
app.use('/vpnetworktest/download/', express.static(config.resources.apkPath, staticFileOptions));
app.use(/\/vpm\w{0,}\/download/, express.static(config.resources.apkPath, staticFileOptions));
app.use('/network/download/', express.static(config.resources.apkPath, staticFileOptions));
app.use('/networktest/download/', express.static(config.resources.apkPath, staticFileOptions));
app.use(/\/network\w{0,}/, express.static(config.resources.rapsPath, staticFileOptions));
app.use(/\/network\w{0,}\/*/, express.static(config.resources.rapsPath, staticFileOptions));

app.get(/\/vpmadmin\w{0,}/, (req, res) => {
    // console.log("REQUEST PATH -", req.url);
    res.sendFile(path.resolve(config.resources.vpmadminPath, "index.html"));
});

app.get(/\/vendorportaltest\w{0,}/, (req, res) => {
    res.sendFile(path.resolve(config.resources.vpmadminPath, "index.html"));
});

app.get(/\/vpmadmin\w{0,}/, express.static(config.resources.vpmadminPath, staticFileOptions))
// added this line for sso '/' empty path map to admin
app.use("/", express.static(config.resources.vpmadminPath));


app.use('/graphql', bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
app.use(`${config.sso.baseISSOpath}/graphql`, bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));

// graphQl staging 
app.use('/graphqlstaging/graphql4g', bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
app.use(`${config.sso.baseISSOpath}/graphqlstaging/graphql4g`, ValidateSession, bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

//graphQl PLE

// app.use('/graphqlstaging2/graphql4g', bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
// app.use(`${config.sso.baseISSOpath}/graphqlstaging2/graphql4g`, bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));

// app.use('/graphqlstaging4/graphql4g', bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
// app.use(`${config.sso.baseISSOpath}/graphqlstaging4/graphql4g`, bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));

app.use('/graphqlstaging5/graphql4g', bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));
app.use(`${config.sso.baseISSOpath}/graphqlstaging5/graphql4g`, bodyParser.json({ limit: '50mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));

app.use('/healthcheck4g', function (req, res) {
    res.sendStatus(200);
});

app.use(`${config.sso.baseISSOpath}/healthcheck4g`, function (req, res) {
    res.sendStatus(200);
});

app.use('/expiry-notice', express.static(path.join(__dirname, 'public')))

app.get(/\/sso\w{0,}/, (req, res) => {
    res.sendFile(path.resolve(config.resources.sso_vpmadminPath, "index.html"));
});

let serve = http.createServer(app);
let proxy = httpProxy.createServer(config.redirect)

serve.listen(config.app.graphQlPort, 'localhost', function () {
    console.log("GraphQL Service started on port : " + config.app.graphQlPort);
});



