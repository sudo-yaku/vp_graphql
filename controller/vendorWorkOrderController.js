import { ConnectionRefuse, UnkonwnError, InputError, NotFound, NoDataFoundError, UnAuthorized, GateWayDown, CustomErr } from '../data/errors'
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
import { vendorWOFilterWithStatus, vendorWOFilterWithWorkOrderId } from '../model/vendorWOFilterDetails';
import gsamUtil from '../corelib/GsamUtil';
let config = require('config');
const axios = require('axios');
const {getWorkUrgencyValue} = require('../util/WorkUrgencyHelper');

function getServiceURL() {
	if (process.env.NODE_ENV == "production") {
		return config.pmService.redisUrl;
	} else {
		return config.pmService.baseurl;
	}
}

function errorHandler(json, functionName) {
	logger.error(`${functionName} - Error: ${json}`);
	try {
		const errorData = typeof json === 'string' ? JSON.parse(json) : json;
		return new UnkonwnError({ data: errorData });
	} catch (e) {
		return new UnkonwnError({ data: json });
	}
}

export const apis = {
	getVendorWoByUnid(loginId, unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/${unid}/details`
			} else {
				url = `${config.IopService.baseScruburl}/workorder/vendor/${unid}/details`
			}
		} else {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/${unid}/details`
			} else {
				url = `${config.IopService.baseurl}/workorder/vendor/${unid}/details`
			}
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getVendorWoByUnid");
				}
				if (json && json["vendor_wo_details"] && typeof json["vendor_wo_details"] === "string") {
					let response = { code: "200", vendor_wo_details: [], message: json["vendor_wo_details"] };
					return response;
				} else if (json && json["vendor_wo_details"] && Object.keys(json["vendor_wo_details"]).length > 0) {
					let response = { code: "200", vendor_wo_details: json["vendor_wo_details"] };
					return response;
				} else if (json && json.Error && json.Error.length > 0) {
					switch (json.Error[0].status) {
						case 501:
							return new NotFound({ data: json.Error[0] });
						default:
							return new UnkonwnError({ data: json.Error[0] });
					}
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorWoByUnid");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	fetchBucketCraneSiteDetails(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/site/${siteunid}/bucketTruckInfo`
		} else {
			url = `${config.IopService.baseurl}/site/${siteunid}/bucketTruckInfo`
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
					return errorHandler(json, "#fetchBucketCraneSiteDetails");
				}
				logger.info(`#fetchBucketCraneSiteDetails Response-- ${JSON.stringify(json)}`)
				if (json) {
					return json;
				} else if (json.errors && json.errors.length>0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#fetchBucketCraneSiteDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	bulkUpdatePendingAckFromRedis(userId, vendorId, clientreq) {
		let url = `${getServiceURL()}/workorder/bulkUpdatePendingAckFromRedis?userId=${userId}&vendorId=${vendorId}`;
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				console.log("JSON---", json)
				if (typeof json === 'string') {
					return;
				}
				if (json) {
					return json;
				} else if (json.error && json.error.length > 0) {
					return new UnkonwnError(json);
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#bulkUpdatePendingAckFromRedis");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	bulkUpdatePendingAck(input, clientreq) {
		let url = `${getServiceURL()}/workorder/bulkUpdatePendingAck`;
		console.log("URL--", url, input)
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#bulkUpdatePendingAck");
				}
				console.log("JSON--", json)
				if (json) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors[0].detail });
							case 502:
								return new GateWayDown({ data: json.errors[0].detail });
							case 400:
								return new InputError({ data: json.errors[0].detail });
							case 500:
								return new CustomErr({ data: json.errors[0].detail });
							default:
								return new UnkonwnError({ data: json.errors[0].detail });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#bulkUpdatePendingAck");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	vwrsIDSerachQuery(vwrsID, clientreq) {
		//check the isoffshore val from config
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/vendorWOSearchByWorkOrderId/${vwrsID}`
			} else {
				url = `${config.IopService.baseScruburl}/workorder/vendor/vendorWOSearchByWorkOrderId/${vwrsID}`
			}
		} else {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/vendorWOSearchByWorkOrderId/${vwrsID}`
			} else {
				url = `${config.IopService.baseurl}/workorder/vendor/vendorWOSearchByWorkOrderId/${vwrsID}`
			}
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"IOPUSERID": config.wnoUserId // Using config variable for IOPUSERID
			},
		})
			.then(json => {
				//filtering gsam data
				let inputData = { output: json["vendor_wo_details"] }
				let filteredData = json["vendor_wo_details"];

				if (isOffShore) {
					filteredData = inputData && inputData.output && gsamUtil.restrictObjectInObjects(inputData, ['site_name'])
				}

				if (filteredData) {
					if (typeof json === 'string') {
						return errorHandler(json, "#vwrsIDSerachQuery");
					}
					if (json && json["vendor_wo_details"] && typeof json["vendor_wo_details"] === "string") {
						let response = { code: "200", vendor_wo_details: [], message: json["vendor_wo_details"] };
						return response;
					} else if (json && json["vendor_wo_details"] && Object.keys(json["vendor_wo_details"]).length > 0) {
						let response = { code: "200", vendor_wo_details: [] };
						response.cfd_lineitems = Object.entries(json.vendor_wo_details).map(([name, value]) => ({ name, value }));
						return response;
					} else if (json && json.Error && json.Error.length > 0) {
						switch (json.Error[0].status) {
							case 501:
								return new NotFound({ data: json.Error[0] });
							default:
								return new UnkonwnError({ data: json.Error[0] });
						}
					} else {
						return new NoDataFoundError();
					}
				}
				else {
					return new NoDataFoundError();
				}

			}).catch(err => {
				logger.debug("#vwrsIDSerachQuery");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getVendorWoByWorkOrderId: async function (loginId, workOrderId, vendorId, clientreq) {
        let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
        let url = '';
        if (isOffShore) {
            if (config.IopService.routeToVWRS == "Y") {
                url = `${config.IopService.baseurl}/vwrs/vendor/vendorWOSearchByWorkOrderId/${workOrderId}`
            } else {
                url = `${config.IopService.baseScruburl}/workorder/vendor/vendorWOSearchByWorkOrderId/${workOrderId}`
            }
        } else {
            if (config.IopService.routeToVWRS == "Y") {
                url = `${config.IopService.baseurl}/vwrs/vendor/vendorWOSearchByWorkOrderId/${workOrderId}`
            } else {
                url = `${config.IopService.baseurl}/workorder/vendor/vendorWOSearchByWorkOrderId/${workOrderId}`
            }
        }

        try {
            const json = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    "Authorization": clientreq.get("Authorization"),
                    "IOPUSERID": loginId
                },
            });

            // filtering gsam data
            let inputData = { output: json["vendor_wo_details"] }
            let filteredData = json["vendor_wo_details"];

            if (isOffShore) {
                filteredData = inputData && inputData.output && gsamUtil.restrictObjectInObjects(inputData, ['site_name'])
            }

            const workUrgencyResp = await this.getWorkUrgency();

            if (filteredData) {
                if (typeof json === 'string') {
                    return errorHandler(json, "#getVendorWoByWorkOrderId");
                }
                if (json && json["vendor_wo_details"] && typeof json["vendor_wo_details"] === "string") {
                    return { code: "200", vendor_wo_details: [], message: json["vendor_wo_details"] };
                } else if (json && json["vendor_wo_details"] && Object.keys(json["vendor_wo_details"]).length > 0) {
                    let response = { code: "200", vendor_wo_details: [] };
                    let quoteNum = 0;
                    let vendorKeyName = Object.keys(json["vendor_wo_details"]).find(key => {
                        if (key.includes('cfd_quote_vendorid_')) {
                            return vendorId.includes(json["vendor_wo_details"][key].toString())
                        }
                    })
                    if (vendorKeyName) {
                        quoteNum = vendorKeyName.split('cfd_quote_vendorid_')[1];
                        let woDetails = new vendorWOFilterWithWorkOrderId(json["vendor_wo_details"], quoteNum);
						const item = woDetails;
						const tickets = Array.isArray(item.trouble_ticket_details) ? item.trouble_ticket_details : [];
						const firstTicket = tickets.length > 0 ? tickets[0] : null;
						const ticketCreatedOn = firstTicket ? (firstTicket.ticket_created_on || null) : null;
						const ticketTroubleType = firstTicket ? (firstTicket.ticket_trouble_type ?? firstTicket.trouble_type ?? null) : null;
						let ruleType;
						if (item.is_vip_site == "true") ruleType = 'VIP_SITE';
						else if (!ticketTroubleType) ruleType = 'NO_TICKET';
						else if( ticketTroubleType?.toUpperCase()?.trim() == 'OTHER') ruleType = 'NO_TICKET';
						else if (tickets.length > 0) ruleType = 'TROUBLE_TICKET';
						else ruleType = 'NO_TICKET';
						let urgencyResp;
						try {
							urgencyResp = getWorkUrgencyValue(workUrgencyResp, ruleType, ticketTroubleType, ticketCreatedOn);
						} catch (e) {
							logger.info(`#getVendorWoByWorkOrderId - work_urgency evaluation failed: ${e.message}`);
							urgencyResp = null;
						}
						woDetails.work_urgency = urgencyResp || 'LOW';
						response.vendor_wo_details = woDetails;
                        return response;
                    } else {
                        return new UnAuthorized();
                    }
                } else if (json && json.Error && json.Error.length > 0) {
                    const err = json.Error[0];
                    if (err.status == 501) {
                        return new NotFound({ data: err });
                    }
                    return new UnkonwnError({ data: err });
                } else {
                    return new NoDataFoundError();
                }
            } else {
                return new NoDataFoundError();
            }
        } catch (err) {
            logger.debug("#getVendorWoByWorkOrderId");
            logger.error(err);
            if (err.code === 'ECONNREFUSED') {
                return new ConnectionRefuse();
            } else {
                return new UnkonwnError();
            }
        }
    },
	getVendorDataByStatusFilter(loginId, vendorId, startdt, enddt, statusList, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/${vendorId}/vendorWOSearchByStatus?startdt=${startdt}&enddt=${enddt}&wo_status=${statusList}`
			} else {
				url = `${config.IopService.baseScruburl}/workorder/vendor/${vendorId}/vendorWOSearchByStatus?startdt=${startdt}&enddt=${enddt}&wo_status=${statusList}`
			}
		} else {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/${vendorId}/vendorWOSearchByStatus?startdt=${startdt}&enddt=${enddt}&wo_status=${statusList}`
			} else {
				url = `${config.IopService.baseurl}/workorder/vendor/${vendorId}/vendorWOSearchByStatus?startdt=${startdt}&enddt=${enddt}&wo_status=${statusList}`
			}
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"IOPUSERID": loginId
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getVendorDataByStatusFilter");
			}
			if (json && json["listItems"] && json["listItems"].length > 0) {
				let response = { code: "200", listItems: json["listItems"] };
				response.listItems = response.listItems.map(item => new vendorWOFilterWithStatus(item));
				return response;
			} else if (json && json.Error && json.Error.length > 0) {
				const err = json.Error[0];
				if (err.status === 501) {
					return new NotFound({ data: err });
				}
				return new UnkonwnError({ data: err });
			} else {
				return new NoDataFoundError();
			}
		}).catch(err => {
			logger.debug("#getVendorDataByStatusFilter");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	recalculateDistance(workOrderId,loginId) {
		let url = `${config.IopService.baseurl}/vwrs/workorders/${workOrderId}/recalculateDistance`;
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#recalculateDistance");
				}
				if (json.distance) {
					return json;
				} else {
					return new NoDataFoundError();
				}
			}).catch(err => {
				logger.debug("#recalculateDistance");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getDashboardConfig() {

		let url = `${config.pmService.baseurl}/workorder/getDashboardConfig`;

		
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
		.then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getDashboardConfig");
			}
			logger.info(`#getDashboardConfig Response-- ${JSON.stringify(json)}`)
			if (json && json.dashboardConfig) {
				return json;
			} else if (json.errors && json.errors.length > 0) {
				return new UnkonwnError({ data: json.errors });
			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#getDashboardConfig");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},

	async getWorkUrgency(){
		let url = `${config.pmService.baseurl}/workorder/getWorkUrgency`;
		logger.info(`#getWorkUrgency - URL: ${url}`);
		let getWorkUrgencyResponse = await axios.get(url);
		logger.info(`#getWorkUrgency - Response: ${JSON.stringify(getWorkUrgencyResponse.data.workUrgency)}`);
		return getWorkUrgencyResponse.data.workUrgency;
	}
}

