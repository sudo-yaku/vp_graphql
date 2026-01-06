import AppLogger from './AppLogger';
import mwUtils from './utils'
import moment from 'moment'
const config = require('config');
const httpContext = require('express-http-context');
const NVP_URL_COOKIE_NAME = 'uidq'

export const setAppPathCookie = function (req, res, next) {
    if (req.body && req.body.query && req.body.query.indexOf('getConfigData') > -1) {
        const referer = (req.headers['referer'] && req.headers['referer'].length > 0) ? req.headers['referer'] : null
        res.cookie(NVP_URL_COOKIE_NAME, referer, { expire: 0, httpOnly: true, secure: true });
    }
    next();
}

export const redirection = function (req, res) {
    const url = mwUtils.getCookieValueByName(req.headers, NVP_URL_COOKIE_NAME); 
    if (url && url.startsWith('http')) {
        res.redirect(decodeURIComponent(url));
    } else {
        res.status(400).send('Invalid URL');
    }
}

export const unsetSSOCookies = function (req, res, next) {
    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp'
    if (xVPMOrigin == 'isso') {
        // res.cookie('SMSESSION', 'unset', {expire: Date.now(), domain:".verizonwireless.com", path:"/"});
        res.clearCookie('SMSESSION', { path: '/', domain: ".verizonwireless.com" })
    } else {
        // res.cookie('SMSESSION', 'unset', {expire: Date.now(), domain:".vzwnet.com", path:"/"});
        res.clearCookie('SMSESSION', { path: '/', domain: ".vzwnet.com" })
    }
    next();
}

export default function (req, res, next) {
    const ssoheader = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : null
    if (config.sso.enableSSO && ssoheader) {
        AppLogger.getLogger().info("Validating SSO Init");
        if (req.url.indexOf(".js") > -1 || req.url.indexOf(".css") > -1 || req.url.indexOf(".png") > -1) {
            next()
            return;
        }
        if (req.session && req.session.userdata && req.session.userdata.userid) {
            next()
            return;
        }
        if (isSSORequest(req)) {
            const { eid = null, email = null, firstname = null, lastname = null, phonenumber = null, vzid = null, issouserid = null, issoemailid = null } = req.headers;
            AppLogger.getLogger().info(`SSO Values : ${eid} email : ${email} firstname : ${firstname} lastname : ${lastname} phonenumber : ${phonenumber} vzid : ${vzid}`);
            console.log('in sso file')
            let userdata = {
                email: email,
                lname: lastname,
                fname: firstname,
                phone: phonenumber,
                userid: vzid,
                maxActiveTime: moment().add(config.app.maxUserActiveTime, 'minutes').toDate(),
                isssouser: true,
                isUserOffShore: false,
                userloginid: issouserid
            }

            if (issoemailid && issoemailid.length > 0) {
                userdata['email'] = issoemailid;
                console.log('in sso file', userdata['email'],  issoemailid, config.isOffShore.identifier)
                let isOffShoreidentifier = `${config.isOffShore.identifier}`;
                let isOffShoruser_id = `${config.isOffShore.user_id}`;
                if (isOffShoreidentifier.split(",").includes(issoemailid) || isOffShoruser_id.split(",").includes(userdata['userid'])) {
                    userdata['isUserOffShore'] = true
                }
            }
            req.session.userdata = userdata
            httpContext.set("ssoTokenInfo", userdata);
            AppLogger.getLogger().info("setting session from sso / CIM ");
            console.log("SSO-request-session-userdata--", req.session.userdata)
        }
    }
    next()
}

const isSSORequest = (req) => {
    const headers = req.headers;
    const xVPMOrigin = (req.headers['x-vpm-origin'] && req.headers['x-vpm-origin'].length > 0) ? req.headers['x-vpm-origin'] : 'otp'
    const mandatory = xVPMOrigin == 'isso' ? ["issouserid"] : ["email", "vzid"]
    let isValid = true
    for (let i = 0; i < mandatory.length; i++) {
        const val = headers[mandatory[i]];
        if (!val || val.length <= 0) {
            isValid = false;
            break
        }
    }
    if (headers['cookie'] && headers['cookie'].length > 0 && (headers['cookie'].indexOf('am-auth-jwt') > -1 || headers['cookie'].indexOf('SMSESSION') > -1 )) {
        isValid = true;
    } else {
        isValid = false;
    }
    return isValid;
}
