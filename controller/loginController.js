import moment from 'moment';
import { ConnectionRefuse, UnkonwnError, InputError, GateWayDown, NotFound, CustomErr, UnAuthorized } from '../data/errors'
import { userActivity } from '../model/userActivityDetails';
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')

export const apis = {
	async getUserAuth(input, clientreq) {
		const session = clientreq.session || {};
		const userdata = session.userdata || {};
		const headers = clientreq.headers || {};
		const userEmailID = userdata.email || (input.Body && input.Body.email) || "";
		const userSSOID = userdata.userloginid || "";
		const isSSOuser = userdata.isssouser || false;
		const isUserOffShore = userdata.isUserOffShore || false;
		const userID = userdata.userid || "";
		const xVPMOrigin = (headers['x-vpm-origin'] && headers['x-vpm-origin'].length > 0) ? headers['x-vpm-origin'] : '';
		const isOnessoUser = xVPMOrigin.toLowerCase() === 'onesso';
		let restriction_error_obj = {
			message: "Access Restricted",
			data: { code: 403, message: "Access Restricted", errorCode: isSSOuser ? "NOTALLOWED-SSO" : "NOTALLOWED" }
		};
		let url = "";
		if (config.userServiceVP === "Y") {
			if (isOnessoUser) {
				url = `${config.Vpuserservice.baseurl}/vendorusernew/getUser/?issouserid=${userSSOID}&userid=${userID}=&email=${userEmailID}`;
			} else {
				url = `${config.Vpuserservice.baseurl}/vendorusernew/getUser/?issouserid=${userSSOID}&userid=&email=${userEmailID}`;
			}
		} else {
			url = `${config.Vpuserservice.baseurl}/vendoruser/getUser/?issouserid=${userSSOID}&userid=&email=${userEmailID}`;
		}
		let fetchHeaders = {
			'Content-Type': 'application/json',
			"Accept": "application/json"
		};
		if (isSSOuser && xVPMOrigin !== 'isso') {
			if (!userdata.email || userdata.email.length === 0) {
				if (session) session.destroy && session.destroy();
				return new UnAuthorized(restriction_error_obj);
			}
			fetchHeaders['email'] = userdata.email;
		}

		if (!userEmailID && !userSSOID) {
			return {};
		}
		console.log("getUserAuth --", url);
		logger.debug(`User Email ID: ${userEmailID}, User SSO ID: ${userSSOID}`);
		try {
			const json = await fetch(url, {
				method: 'GET',
				headers: fetchHeaders,
			});

			if (typeof json === 'string') {
				return errorHandler(json, "#getUserAuth");
			}

			if (json.user && json.user.userid) {
				let { user } = json;
				user.login_id = user.userid;
				user.sessionTimeout = config.app.session.maxAge;
				user.isssouser = isSSOuser;
				user.isUserOffShore = isUserOffShore;
				user.ssoLogoutURL = isOnessoUser ? config.sso.IntranetSSOLogout : config.sso.InternetSSOLogout;
				session.userdata = { ...user };
				session.maxActiveTime = moment().add(config.app.maxUserActiveTime, 'minutes').toDate();
				if (xVPMOrigin !== "") {
					await this.saveUserActivity(input, clientreq);
				}
				return json;
			}

			if (json.code === 404) {
				session && session.destroy && session.destroy();
				restriction_error_obj = {
					message: "Access Restricted",
					data: { code: 404, message: json.message, errorCode: "PROFILE_NOT_FOUND" }
				};
				return new UnAuthorized(restriction_error_obj);
			}

			if (json.code === 403) {
				session && session.destroy && session.destroy();
				restriction_error_obj = {
					data: { code: 403, message: json.message, errorCode: "OTHER_CHANNEL" }
				};
				return new UnAuthorized(restriction_error_obj);
			}

			if (json.code === 401) {
				session && session.destroy && session.destroy();
				return new UnAuthorized(restriction_error_obj);
			}

			session && session.destroy && session.destroy();
			return new UnkonwnError(restriction_error_obj);

		} catch (err) {
			logger.info('getUserAuth catch', err);
			logger.debug("#getUserAuth");
			logger.debug(err);
			session && session.destroy && session.destroy();
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse(restriction_error_obj);
			}
			return new UnkonwnError(restriction_error_obj);
		}
	},
	async getVendorList(vendor_id, clientreq) {
		const isOffShore = _.get(clientreq, 'session.userdata.isUserOffShore', false);
		let url = '';
		const userServiceVP = config.userServiceVP === "Y";
		const baseUrl = isOffShore
			? config.Vpuserservice.baseScruburl
			: config.Vpuserservice.baseurl;

		if (userServiceVP) {
			url = `${baseUrl}/vendorusernew/getlist?vendorid=${vendor_id}`;
		} else {
			url = `${baseUrl}/vendoruser/getlist?vendorid=${vendor_id}`;
		}

		try {
			const json = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': config.app.authHeader
				},
			});

			if (typeof json === 'string') {
				return errorHandler(json, "#getVendorList");
			}
			if (json.data && json.data.listitems) {
				return json.data.listitems;
			}
			if (json && json.code) {
				switch (json.code) {
					case 404:
						return new NotFound({ data: json });
					case 502:
						return new GateWayDown({ data: json });
					case 500:
						return new CustomErr({ data: json });
					default:
						return new UnkonwnError({ data: json });
				}
			}
			return new CustomErr({ data: { code: 500, message: "Oops! User list cannot be loaded. Please retry." } });
		} catch (err) {
			logger.debug("#getVendorList");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			}
			return new UnkonwnError();
		}
	},
	async getConfigData(vendorId, clientreq) {
		const url = `${config.pmService.baseurl}/vppm/getConfigData?vendorId=${vendorId}`;
		try {
			const json = await fetch(url, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
					"Accept": "application/json"
				}
			});

			if (typeof json === 'string') {
				return errorHandler(json, "#getConfigData");
			}
			if (json.configData && json.submarketData) {
				return json;
			}
			if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
				const errObj = json.errors[0];
				if (errObj.status === "400") {
					return new InputError({ data: { code: 400, message: `${errObj.detail}` } });
				}
				return new UnkonwnError({ data: errObj });
			}
			return new InputError();
		} catch (err) {
			logger.debug("#getConfigData");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			}
			return new UnkonwnError();
		}
	},
	async saveUserActivity(req, clientreq) {
		try {
			const input = userActivity(req, clientreq);
			const url = `${config.pmService.baseurl}/vppm/saveUserActivity`;
			await fetch(url, {
				method: 'POST',
				body: JSON.stringify(input),
				headers: {
					'Content-Type': 'application/json'
				},
			});
		} catch (err) {
			logger.info("#saveUserActivity", err);
			logger.error(err);
		}
	},
}
