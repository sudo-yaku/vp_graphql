import { ConnectionRefuse, UnkonwnError, InputError } from '../data/errors'
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')

export const apis = {
    getRecentActivity(userId, clientreq) {

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/recentActivity/${userId}`
		}else{
			url = `${config.pmService.baseurl}/vppm/recentActivity/${userId}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getRecentActivity");
				}
				if (json && json.recent_activities) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Something went Wrong!" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getRecentActivity");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
}
