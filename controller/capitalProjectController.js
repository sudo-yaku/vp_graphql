import { ConnectionRefuse, UnkonwnError, InputError } from '../data/errors'
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')

export const apis = {
	getProjectDetails(market, submarket, projectNumber, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getProjectDetails?market=${encodeURIComponent(market)}&submarket=${encodeURIComponent(submarket)}&project_number=${projectNumber}`
		}else{
			url = `${config.pmService.baseurl}/vppm/getProjectDetails?market=${encodeURIComponent(market)}&submarket=${encodeURIComponent(submarket)}&project_number=${projectNumber}`
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		}).then(json => {
			if (json) {
				return json;
			}
			else if (json.errors && json.errors.length > 0) {
				switch (json.errors[0].status) {
					case "400":
						return new InputError({ data: { code: 400, message: "Oops! You are not associated with Verizon at this point. Your company may have been moved or deleted." } });
					default:
						return new UnkonwnError({ data: json.errors[0] });
				}
			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
}
