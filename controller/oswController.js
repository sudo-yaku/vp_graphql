import { ConnectionRefuse, UnkonwnError, GateWayDown, NotFound, CustomErr } from '../data/errors'
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
const config = require('config')

export const apis = {
    getSamsungRadioUpdateDetails: (osw_request_id, clientreq) => {

        let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
            && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
        let url = '';
        if (isOffShore) {
         url = `${config.IopService.baseScruburl}/neops/samsung/radioUpdateDetails/${osw_request_id}`
        }else{
         url = `${config.IopService.baseurl}/neops/samsung/radioUpdateDetails/${osw_request_id}`
    }

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Authorization": config.app.authHeader
            },
        })
            .then(json => {
                if (typeof json === 'string') {
                    return errorHandler(json, "#getSamsungRadioUpdateDetails");
                }
                if (json && json.data) {
                    return json;
                }
                if (json && json.code) {
                    if (json.code === 404) {
                        return new NotFound({ data: json });
                    }
                    if (json.code === 502) {
                        return new GateWayDown({ data: json });
                    }
                    if (json.code === 500) {
                        return new CustomErr({ data: json });
                    }
                    return new UnkonwnError({ data: json });
                }
                return new CustomErr({ data: { code: 500, message: "Oops! User list cannot be loaded. Please retry." } });
            }).catch(err => {
                logger.debug("#getSamsungRadioUpdateDetails");
                logger.error(err);
                if (err.code === 'ECONNREFUSED') {
                    return new ConnectionRefuse();
                } else {
                    return new UnkonwnError();
                }
            });
    },
    updateSamsungSN: (site_unid, input) => {
        let url = `${config.IopService.baseurl}/neops/samupdate/${site_unid}/create`
        logger.info(`#updateSamsungSN URL-- ${url}Input-${JSON.stringify(input)}`)
        setTimeout(() => {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(input),
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Authorization": config.app.authHeader
            },
        }).then(json => {
            logger.info(`#updateSamsungSNResponse-- ${JSON.stringify(json)}`)
            if (json) {
                return json
            } else if (json.errors && json.errors.length > 0) {
                let err = json.errors[0];

                switch (err.status) {
                    case "504":
                        return new GateWayDown({ data: { code: 504, message: "Backend connection timed out" } })
                    case "400":
                        return new CustomErr({ data: { code: 400, message: err.detail } });
                    default:
                        return new UnkonwnError({ data: { code: 400, message: err.detail } });
                }
            }
        }).catch(err => {
            logger.debug("#updateSamsungSN");
            logger.error(err);
            if (err.code === 'ECONNREFUSED') {
                return new ConnectionRefuse();
            } else {
                return new UnkonwnError();
            }
        });
        }, 120000);
    },
    checkSocketAndDisconnect: (login_id) => {
        let url = `${config.NotifyService.baseurl}/notify/checkSocketAndDisconnect/${login_id}`
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Authorization": config.app.authHeader
            },
        })
            .then(json => {
                if (typeof json === 'string') {
                    return errorHandler(json, "#checkSocketAndDisconnect");
                }
                if (json && json.message) {
                    return json;
                } else {
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
                    } else {
                        return new CustomErr({ data: { code: 500, message: "Oops! cannot be loaded. Please retry." } });
                    }
                }
            }).catch(err => {
                logger.debug("#checkSocketAndDisconnect");
                logger.error(err);
                if (err.code === 'ECONNREFUSED') {
                    return new ConnectionRefuse();
                } else {
                    return new UnkonwnError();
                }
            });
    },
    getLatestOswDate(work_order_id, clientreq) {
        let url = `${config.pmService.baseurl}/sectorlock/getOswDates?work_order_id=${work_order_id}`
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Authorization": clientreq.get("Authorization")
            },
        }).then(json => {
            if (typeof json === 'string') {
                return errorHandler(json, "#getOswDate");
            }
            if (json && json.hasOwnProperty('Osw_Date')) {
                return json;
            } else if (json.errors && json.errors.length > 0) {
                return new UnkonwnError({ data: json.errors[0] });  
            } else {
                return new InputError();
            }
        }).catch(err => {
            logger.debug("#getOswDate");
            logger.error(err);
            if (err.code === 'ECONNREFUSED') {
                return new ConnectionRefuse();
            } else {
                return new UnkonwnError();
            }
        });
    },
    updateVendorTrained: (input) => {
		let url = `${config.pmService.baseurl}/sectorlock/updateVendorTrained`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (json) {
				return json
			}
		}).catch(err => {
			logger.debug("#updateVendorTrained");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
    updateStayAutoFlag: (osw_request_id, clientreq) => {
        let url = `${config.IopService.baseurl}/fastdashboard/stayasauto/${osw_request_id}`
        logger.info(`#updateStayAutoFlag URL-- ${url}`)
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Authorization": config.app.authHeader
            },
        }).then(json => {
            logger.info(`#updateStayAutoResponse-- ${JSON.stringify(json)}`)
            if (json) {
                return json
            } else if (json.errors && json.errors.length > 0) {
                let err = json.errors[0];

                switch (err.status) {
                    case "504":
                        return new GateWayDown({ data: { code: 504, message: "Backend connection timed out" } })
                    case "400":
                        return new CustomErr({ data: { code: 400, message: err.detail } });
                    default:
                        return new UnkonwnError({ data: { code: 400, message: err.detail } });
                }
            }
        }).catch(err => {
            logger.debug("#updateStayAutoFlag");
            logger.error(err);
            if (err.code === 'ECONNREFUSED') {
                return new ConnectionRefuse();
            } else {
                return new UnkonwnError();
            }
        });
    },
    getOswIssueTypes:() => {
        let url = `${config.IopService.baseurl}/fastdashboard/lock/getOswIssueTypes`
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
        }).then(json => {
            if (typeof json === 'string') {
                return errorHandler(json, "#getOSWIssueTypes");
            }
            if (json) {
                const issueTypes = json?.map(item => item?.issue_type);
                return { issue_type: issueTypes };
            }
            if (json?.errors?.length > 0) {
                return { data: json.errors[0] };
            }
        })
        .catch(err => {
            logger.debug("#getOSWIssueTypes");
            logger.error(err);
            if (err.code === 'ECONNREFUSED') {
                return new ConnectionRefuse();
            } else {
                return new UnkonwnError();
            }
        });
    }
}
