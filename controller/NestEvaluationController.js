import { ConnectionRefuse, UnkonwnError, InputError } from '../data/errors'
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')

export const apis = {
    fetchSiteData(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/iop_avian_service/vendor-portal/site/${siteunid}`
		} else {
			url = `${config.IopService.baseurl}/iop_avian_service/vendor-portal/site/${siteunid}`
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization")
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#fetchSiteData");
				}
				if (json) {
					return {"sitedetails": json};
				} else if (json.errors && json.errors.length > 0) {
					if (json.errors[0].status === "400") {
						return new InputError({ data: { code: 400, message: "Oops! You are not associated with Verizon at this point. Your company may have been moved or deleted." } });
					} else {
						return new UnkonwnError({ data: json.errors[0] });
					}
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#fetchSiteData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	deleteAvianAttachment: (attachmentId, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/iop_avian_service/delete/${attachmentId}`
		} else {
			url = `${config.IopService.baseurl}/iop_avian_service/delete/${attachmentId}`
		}

		return fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#deleteAvianAttachment");
			}
			if (json) {
				return json
			}
		}).catch(err => {
			logger.debug("#deleteAvianAttachment");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	uploadAvianAttachment: (input, clientreq) => {
		let url = `${config.IopService.baseurl}/iop_avian_service/vp/attachment`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#uploadAvianAttachment");
			}
			if (json.success) {
				return json
			} else {
				return json
			}
		}).catch(err => {
			logger.debug("#uploadAvianAttachment");
			logger.error(err);
			return err;
		})
	},
	sendEmailNotificationForAvianUpdate: (meta_universalid, input, clientreq) => {
		let url = `${config.IopService.baseurl}/iop_avian_service/vp/createBiologistRequest/sendEmail?meta_universalid=${meta_universalid}`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#sendEmailNotificationForAvianUpdate");
			}
			if (json.success) {
				return json
			} else {
				return json
			}
		}).catch(err => {
			logger.debug("#sendEmailNotificationForAvianUpdate");
			logger.error(err);
			return err;
		})
	}

}