import { GateWayDown, InternalServerError, NotFound, UnAuthorized, UnkonwnError } from '../data/errors';
import AppLogger from './AppLogger'
const uuid = require('node-uuid');
const httpContext = require('express-http-context')
export const UNAUTHORIZED_COMMON_MESSAGE = "You are not authorized for this action"
export const UNAUTHORIZED_MESSAGE = "You are not authorized for this action"
export const FORCE_LOGOUT_MESSAGE = "For security reasons, you have been forced to logout."

export default {
    getReqControlId() {
        const reqId = httpContext.get('reqId')
        return reqId ? reqId : uuid.v1()
    },
    getReqUserId() {
        const userId = httpContext.get('userId')
        return userId ? userId : 'NA'
    },
    getCorrelationId(req) {
        let crId = null;
        try {
            if (req.get("requestControlId") != null)
                crId = req.get("requestControlId") + ":" + (req.get("userId") || "");
            if (req.body.Header != null)
                crId = req.body.Header.requestControlId || req.body.Header.correlationId;
            if (req.body && req.body.variables && req.body.variables.input && req.body.variables.input.Header)
                crId = req.body.variables.input.Header.transactionId || req.body.variables.input.Header.correlationId || req.body.variables.input.Header.requestControlId;
        } catch (e) {
            console.error(e);
        }

        return crId || uuid.v1();
    },
     errorHandler(data, key) {
        if (data.indexOf('404') > -1) {
            return new NotFound({ data: { code: 404, message: "Not Found.", errorCode: "NOTFOUND" } });
        } else if (data.indexOf('502') > -1) {
            return new GateWayDown({ data: { code: 502, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "GATEWAYDOWN" } });
        } else if (data.indexOf('405') > -1) {
            return new UnAuthorized({ data: { code: 405, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "NOTALLOWED" } });
        } else if (data.indexOf('Error') > -1) {
            return new InternalServerError({ data: { code: 500, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "InternalServerError" } });
        } else {
            return new UnkonwnError();
        }
    },
    trace(tag, promise) {
        return Promise.resolve(Date.now()).then((start) => {
            return promise.then((v) => {
                AppLogger.getLogger().trace("Total time taken for  " + tag + " " + (Date.now() - start) + "ms");
                return v;
            });
        });
    },
    getUserId(req) {
        let userId = null;
        try {
            if (req && req.session && req.session.userdata && req.session.userdata.userid) {
                userId = req.session.userdata.userid
            } else if (req.get("userId") != null) {
                userId = req.get("userId");
            }
            else if (req.body.Header != null) {
                userId = req.body.Header.userId;
            } else if (req.body.data && req.body.data.Header) {
                userId = req.body.data.Header.userId;
            }
        } catch (e) {
            console.error(e);
        }

        return userId || "NA";
    },
    getValueByPath: function (node, path) {
        if (this.isEmpty(path)) {
            return null;
        }
        let s = path.split(".");
        if (s && s.length === 1) {
            return node[s[0]];
        } else if (s.length > 1 && node[s[0]] != null) {
            return this.getValueByPath(node[s[0]], s.slice(1).join("."));
        } else {
            return null;
        }
    },
    isEmpty: function (p) {
        return p == null || p === "";
    },
    isTokenExpired: function (result) {
        let isExpired = false;
        if (result && result["fault"]) {
            const code = result["fault"]["code"] ? result["fault"]["code"] : null
            const message = result["fault"]["message"] ? result["fault"]["message"] : null
            if ([900901, 900902].indexOf(code) > -1 || ["Invalid Credentials", "Missing Credentials"].indexOf(message) > -1) {
                isExpired = true;
            }
        }

        return isExpired
    },
    getUnauthorizedErrorObj: function (message) {
        const data = { code: 401, message }
        const errors = [{
            "message": UNAUTHORIZED_COMMON_MESSAGE,
            "name": "UnAuthorized",
            "time_thrown": new Date().toISOString(),
            "data": data
        }]

        return { data, errors }
    },
    getCookieValueByName(headers, name) {
        const rawCookies = headers.cookie.split('; ');

        const parsedCookies = {};
        rawCookies.forEach(rawCookie => {
            const parsedCookie = rawCookie.split('=');
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });
        return parsedCookies[name];
    },
    isObject: (obj) => {
        return Object.prototype.toString.call(obj) === '[object Object]'
    },
    formJWTToken(obj) {
        return {
            'jobId': obj.jobId ? obj.jobId : null,
            'orderNum': obj.orderNum ? obj.orderNum : null,
            '5GMDN': obj['5GMDN'] ? obj['5GMDN'] : null,
            'locationCode': obj.locationCode ? obj.locationCode : null,
        }
    },
    isEmptyObject(obj) {
        return (!obj || obj === null || (Object.keys(obj).length === 0 && obj.constructor === Object));
    },
    getAppBasepath(req) {
        const referer = (req.headers['referer'] && req.headers['referer'].length > 0) ? req.headers['referer'] : null
        let redirectionurl = referer ? referer.indexOf('vpmadmin') > -1 ? referer.match(/http.*vpm.*?\//gm) :
            referer.indexOf('network') > -1 ? referer.match(/http.*network.*?\/.*?\//gm) :
                referer.match(/http.*vpm.*?\/.*?\//gm) : null;
        redirectionurl = redirectionurl && redirectionurl.length > 0 ? redirectionurl[0] : referer;

        return redirectionurl;
    },
    isFixedwirelessTestorgin(req) {
        const origin = req.headers.origin;
        return (origin && origin.indexOf(`fixedwirelessaccess`) > -1) ? true : false
    },
    convertToSSOURL(refURL) {
        let convertedURL = null;
        try {
            const isVerizonUser = httpContext.get('isVerizonUser');
            convertedURL = `${isVerizonUser ? config.sso.IntranetURL : config.sso.InternetURL}/${refURL.split("/").splice(3).join("/")}`;
        } catch (ex) {
            console.log(ex, "convert To SSO URL ERROR")
        }
        return convertedURL;
    },
    getSSORole() {
        return httpContext.get('sso_role')
    },
    getVPMRole() {
        return httpContext.get('vpm_role')
    }
}