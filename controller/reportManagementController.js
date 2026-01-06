import { ConnectionRefuse, UnkonwnError, InputError, CustomErr } from '../data/errors'
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')
import util from "../corelib/utils";

export const apis = {
    getMarketListEsso(clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getMarketRefData`
		}else{
			url = `${config.pmService.baseurl}/vppm/getMarketRefData`
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
					return util.errorHandler(json, "#getMarketListEsso");
				}
				if (json && json.marketRefData && json.marketRefData.length > 0) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					return json.errors
					// switch (json.errors[0].status) {
					// 	case "400":
					// 		return new InputError({ data: { code: 400, message: "data not found" } });
					// 	default:
					// 		return new UnkonwnError({ data: json.errors[0] });
					// }

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getMarketListEsso");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	generatorFuelReport(market, subMarket, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
		 url = `${config.pmService.baseScruburl}/genrun/getGenFuelData?subMarket=${subMarket}&market=${market}`
		}else{
		 url = `${config.pmService.baseurl}/genrun/getGenFuelData?subMarket=${subMarket}&market=${market}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getgenFuelResult");
				}
				if (json) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
							return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getgenFuelResult");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSwitchesforGenRunReport(market, submarket, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
		 url = `${config.pmService.baseScruburl}/genrun/getSwitches?market=${market}&&submarket=${submarket}`
		}else{
		 url = `${config.pmService.baseurl}/genrun/getSwitches?market=${market}&&submarket=${submarket}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getVendorSwitchesInfo");
				}
				if (json && json.data.length > 0) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
							return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorSwitchesInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getDevicesforGenRunReport(market, submarket, switchName, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
		 url = `${config.pmService.baseScruburl}/genrun/getDevices?market=${market}&submarket=${submarket}&switchName=${switchName}`
		}else{
		 url = `${config.pmService.baseurl}/genrun/getDevices?market=${market}&submarket=${submarket}&switchName=${switchName}`
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getVendorDevicesInfo");
				}
				if (json && json.data) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
							return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorDevicesInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getGenRunResult(deviceName, startDate, endDate, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/genrun/genRunResult?deviceName=${deviceName}&startDate=${startDate}&endDate=${endDate}`
		}else{
			url = `${config.pmService.baseurl}/genrun/genRunResult?deviceName=${deviceName}&startDate=${startDate}&endDate=${endDate}`
		}
		
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getgenRunResult");
				}
				if (json && json.data) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
							return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getgenRunResult");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getGroupsforOpenAlarmsReport(market, subMarket) {
	let url = `${config.GrrService.baseurl}/topo/groups?area=${market}&market=${subMarket}`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getGroupsforOpenAlarmsReport");
				}
				if (json.length && json.length >= 0) {
					return { groupsOpenAlarmData: json };
				} else if (json.error) {
					return new CustomErr({ data: json });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getGroupsforOpenAlarmsReport");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSwitchesForOpenAlarmReport(market, subMarket, group) {
	let url = `${config.GrrService.baseurl}/topo/switches?area=${market}&market=${subMarket}&group=${group}`           
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getSwitchesForOpenAlarmReport");
				}
				if (json.length && json.length >= 0) {
					return { "switchOpenAlarmData": json };
				} else if (json.error) {
					return new CustomErr({ data: json });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getSwitchesForOpenAlarmReport");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getOpenAlarmsDataReport(switchName, startDate, stopDate) {
    let switchString = switchName && switchName.length > 0 && switchName.map(name=> `switches[]=${name}`).join('&');
	let url = `${config.GrrService.baseurl}/openalarms?${switchString}&startDate=${startDate}&stopDate=${stopDate}`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return util.errorHandler(json, "#getOpenAlarmsDataReport");
				}
				if (json && json.data && json.data.length >= 0) {
					return json;
				} else if (json.error) {
					return new CustomErr({ data: json });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getOpenAlarmsDataReport");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	}
}
