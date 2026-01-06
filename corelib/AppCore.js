import express from "express";
import * as bodyParser from "body-parser";
import * as config from "config"
import mwUtils from "./utils";
import coreutil from './utils';
import AppLogger from "./AppLogger"
import { SSO_EXPIRE_SESSION } from "../util/AppUtil";

const httpContext = require('express-http-context')
const express_interceptor = require('express-interceptor');

function getExpressApp(appName) {
    const app = express();
    const appLogger = AppLogger.initialize(appName);
    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const morgan = require('morgan')
    const secretKey = '636552a9-2020-4aab-ad5e-cea6c65366d9'
    app.use(morgan('combined', { "stream": new appLogger.AccessLoggerStream() }))
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
    app.use(httpContext.middleware);
    app.set('trust proxy', 'loopback');// this is to trust request coming only from localhost nginx
    app.use(
        session({
            secret: secretKey,
            name: "qid",
            resave: true,
            rolling: true,
            saveUninitialized: false,
            unset: 'destroy',
            cookie: {
                httpOnly: true,
                path: '/',
                //   domain:config.mdbOption.domain,
                secure: false,
                maxAge: 1000 * 60 * ((config.app.session.maxAge || 30)) // config param is in mins
            },
            store: new MongoStore(config.mdbOption)
        })
    );
    app.use(function (req, res, next) {
        httpContext.set('reqId', mwUtils.getCorrelationId(req));
        httpContext.set('userId', mwUtils.getUserId(req));
        next();
    });

    if (coreutil.getValueByPath(config, "appcore.log.inbound")) {
        app.use(coreutil.getValueByPath(config, "appcore.log.inboundpaths"), function (req, res, next) {
            logInboundRequest(appLogger, req);
            next()
        });
    }
    app.use(coreutil.getValueByPath(config, "app.graphQlPath"), express_interceptor(function (req, res) {
        return {
            // Only JSON responses will be intercepted
            isInterceptable: function () {
                return /application\/json/.test(res.get('Content-Type'));
            },
            // Appends a paragraph at the end of the response body
            intercept: function (body, send) {
                if (body.indexOf('NOTALLOWED-SSO') > -1) {
                    res.redirect(`${req.get('Origin')}/errorpage/403.html`);
                } else {
                    send(body);
                    logInboundResponse(appLogger, res, body);
                }
            }
        };
    }));
    app.use([`${config.sso.baseISSOpath}${coreutil.getValueByPath(config, "app.graphQlPath")}`, coreutil.getValueByPath(config, "app.graphQlPath")], express_interceptor(function (req, res) {
        return {
            // Only JSON responses will be intercepted
            isInterceptable: function () {
                return /application\/json/.test(res.get('Content-Type'));
            },
            // Appends a paragraph at the end of the response body
            intercept: function (body, send) {
                if (body.indexOf('NOTALLOWED-SSO') > -1) {

                    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp'

                    let url = '/errorpage/403.html'
                    if (xVPMOrigin == 'isso') {
                        url = `${config.sso.baseISSOpath}${url}`
                    }
                    res.redirect(`${req.get('Origin')}${url}`);
                }
                else if (body.indexOf('PROFILE_NOT_FOUND') > -1) {
                    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp'
                    let url = xVPMOrigin == 'isso' ? '/errorpage/403.html' : '/errorpage/404.html'
                    if (xVPMOrigin == 'isso') {
                        url = `${config.sso.baseISSOpath}${url}`
                    }
                    res.redirect(`${req.get('Origin')}${url}`);
                }
                else if (body.indexOf('OTHER_CHANNEL') > -1) {
                    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp'
                    let url = xVPMOrigin == 'isso' ? '/errorpage/400.html' : '/errorpage/404.html'
                    if (xVPMOrigin == 'isso') {
                        url = `${config.sso.baseISSOpath}${url}`
                    }
                    let channel = JSON.parse(body);
                    let message = channel.errors && channel.errors.length>0 && channel.errors[0] && channel.errors[0].data && channel.errors[0].data.message;
                    // let channelmessage = JSON.stringify(message);
                    // console.log("channelmessage",channelmessage);
                    res.redirect(`${req.get('Origin')}${url}?channel=${message}`);

                } else if (body.indexOf('PROFILE_AUTO_UPDATE') > -1) {
                    let obj = JSON.parse(body)
                    let email, fname, lname;
                    email = obj && obj['errors'] && obj['errors'] != null && obj['errors'][0]['data'] != null ? obj['errors'][0]['data']['email'][0] : '';
                    fname = obj && obj['errors'] && obj['errors'] != null && obj['errors'][0]['data'] != null ? obj['errors'][0]['data']['fname'] : '';
                    lname = obj && obj['errors'] && obj['errors'] != null && obj['errors'][0]['data'] != null ? obj['errors'][0]['data']['lname'] : '';
                    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp'
                    const redirectionurl = mwUtils.getAppBasepath(req);
                    let unauthorizedUrl = xVPMOrigin == 'isso' ? '/errorpage/403.html' : '/errorpage/404.html'
                    if (xVPMOrigin == 'isso') {
                        unauthorizedUrl = `${config.sso.baseISSOpath}${unauthorizedUrl}`
                    }
                    unauthorizedUrl = `${req.get('Origin')}${unauthorizedUrl}`;
                    let url = '/userOnBoarding'
                    if (xVPMOrigin == 'isso') {
                        url = `${config.sso.baseISSOpath}${url}`
                    }
                    res.redirect(`${coreutil.getValueByPath(config, "sso.InternetURL")}${url}?email=${encodeURIComponent(email)}&origin=${encodeURIComponent(redirectionurl)}&fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&cancelUrl=${encodeURIComponent(unauthorizedUrl)}`);
                } else if (body.indexOf(SSO_EXPIRE_SESSION) > -1) {
                    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp';
                    const redirectionurl = mwUtils.getAppBasepath(req);
                    let logoutURL = httpContext.get('logouturl') ? encodeURIComponent(httpContext.get('logouturl')) : null;
                    if (mwUtils.isFixedwirelessTestorgin(req)) {
                        logoutURL = encodeURIComponent('https://ilogin.verizon.com/sso_logout.jsp');
                    }
                    let url = `/ssosession/logout.html?app=${encodeURIComponent(redirectionurl)}&ssologouturi=${logoutURL}`
                    if (xVPMOrigin == 'isso' || xVPMOrigin == 'onesso') {
                        url = `${config.sso.baseISSOpath}${url}`
                    }
                    url = `${req.get('Origin')}${url}`
                    res.redirect(`${url}`);
                } else {
                    send(body);
                    if (coreutil.getValueByPath(config, "appcore.log.inbound")) {
                        logInboundResponse(appLogger, res, body);
                    }
                }
            }
        };
    }));
    return app;
}

export default function (appName) {
    return getExpressApp(appName)
}

function logInboundRequest(appLogger, req) {
    try {
        let str = "\n REQUEST \n";
        str += ("HOST: " + req.url + "\n")
        str += ("METHOD: " + req.method + "\n")
        if (req.headers) {
            for (let k in req.headers) {
                str += (k + ":" + req.headers[k])
                str += "\n"
            }
        }
        appLogger.inbound((str += (req.body ? JSON.stringify(req.body) : "")) + "\n ");
    } catch (e) {
        console.log('error logging  to transport  ' + e)
    }
}

function logInboundResponse(appLogger, res, body) {
    try {
        let str = "\n RESPONSE \n";
        str += ("STATUS: " + res.statusCode + "\n")
        str += ("MESSAGE: " + res.statusMessage + "\n")
        if (res.getHeaders()) {
            for (let k in res.getHeaders()) {
                str += (k + ":" + res.get(k))
                str += "\n"
            }
        }
        appLogger.inbound((str += (body ? (body) : "")) + "\n ");
    } catch (e) {
        console.log('error logging  to transport  ' + e)
    }
}



