import moment from 'moment';
import { ConnectionRefuse, UnkonwnError, InputError, GateWayDown, NotFound, CustomErr, InternalServerError, UnAuthorized, NoDataFoundError } from '../data/errors'
import worequest from '../model/worequest'
import schedulerequest from '../model/schedulerequest';
import { userActivity } from '../model/userActivityDetails';
const RETRY_SECTORINFO = 3
import {
	getVendorStatus,
	getStatus,
	STATUS_QUOTEPENDING,
	STATUS_QUOTERECEIVED,
	STATUS_QUOTEAPPROVED,
	STATUS_POREQUESTED,
	STATUS_WORKPENDING,
	STATUS_WORKCOMPLETED,
	STATUS_WORKACCEPTED,
	STATUS_COMPLETED,
	STATUS_AWAITING_PO,
	extractResponseError,
	resolveerror,
	exceptionError,
	constructSessionExpireResponse,
	getRequestControlId
} from '../util/AppUtil'
import _, { uniqBy } from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')
import coreutil from '../corelib/utils'
import gsamUtil from '../corelib/GsamUtil';

const httpContext = require('express-http-context');
import { apis as vendorWorkOrderApis } from './vendorWorkOrderController';
const {getWorkUrgencyValue} = require('../util/WorkUrgencyHelper');

function getSiteDetailsCall(siteunid, clientreq) {

	let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
		&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

	let url = '';
	if (isOffShore) {
		url = `${config.IopService.baseScruburl}/site/vendor/${siteunid}`
	} else {
		url = `${config.IopService.baseurl}/site/vendor/${siteunid}`
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
				return errorHandler(json, "#getSiteDetails");
			}
			if (json && json.sitedetails && json.sitedetails.site_unid) {
				return json;
			} else if (json.errors && json.errors.length > 0) {
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
			logger.debug("#getSiteDetails");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
}
function getNodeDetails(siteunid, clientreq) {
	let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
		&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

	let url = '';

	if (isOffShore) {
		url = `${config.IopService.baseScruburl}/neops/${siteunid}/node/details`
	} else {
		url = `${config.IopService.baseurl}/neops/${siteunid}/node/details`
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
				return errorHandler(json, "#getNodeDetails");
			}
			if (json) {
				return json;
			} else if (json.errors && json.errors.length > 0) {
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
			logger.debug("#getNodeDetails");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
}
function getRootDetails(siteunid, clientreq) {
	logger.info("#getRootDetails - Root drive fetched from redis: "+ config.rootDriveRedis);
	return new Promise((resolve) => {
		const url = `${config.redisServiceiop}get/${siteunid}`;
		if (config.rootDriveRedis === 'Y') {
			logger.info("#getRootDetails - URL: "+ url);
			fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					"Accept": "application/json",
					"Authorization": clientreq.get("Authorization")
				},
			})
			.then(data => resolve(data))
			.catch(err => {
				logger.error("#getRootDetails - "+ err);
				resolve(null); // Resolve with null or any default value in case of error
			});
		} else {
			resolve(null);
		}
	});
}

const apis = {
	getRoofTopInfo(metaId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/siteDetailsInfo/${metaId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/siteDetailsInfo/${metaId}`
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
					return errorHandler(json, "#getVendorsListEsso");
				}
				if (json && json.fields) {
					return json.fields;
				}
				if (json.error) {

					switch (json.error.code) {
						case "400":
							return new InputError({ data: { code: 400, message: "data not found" } });
						case "404":
							return new InputError({ data: { code: error.code, message: error.message } });
						default:
							return new UnkonwnError({ data: json.error });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getRoofTopInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	createDispatchAddress: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.Vpuserservice.baseScruburl}/vendoruser/createDispatchLocation`
		} else {
			url = `${config.Vpuserservice.baseurl}/vendoruser/createDispatchLocation`
		}
		if(config.IopService.vendorManagementAPITOIOP == 'Y') {
			url = `${config.IopService.baseurl}/vendor-management/vendor-locations`
			input = {
				"address": input.address,
				"latitude": input.latitude,
				"longitude": input.longitude,
				"mdgId": input.mdg_id,
				"vendorName": input.vendor_name,
				"metaUniversalId": input.metaUniversalId,
				"createdBy": input.createdBy,
				"psLoc": input.psLoc,
				"modifiedBy": input.modifiedBy,
				"modifiedOn": input.modifiedOn,
				"createdOn": input.createdOn
			  }
		}

		return fetch(url, {
			method: 'POST',
			body: config.IopService.vendorManagementAPITOIOP == 'Y' ? input : JSON.stringify({ "data": input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#createDispatchAddress");
			}
			if(config.IopService.vendorManagementAPITOIOP == 'Y') {
				if(json && json.message) {
					json.resultmessage = json.message
					return json
				} else {
					return new UnkonwnError({ data: json })
				}
			} else {
				if (json && json.fields) {
					return json
				} else {
					if (json && json.resultcode) {
						switch (json.resultcode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}
		}).catch(err => {
			logger.debug("#createDispatchAddress");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	validateAddress: (location, clientreq) => {

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/validateDispatchAddress?address=${location}`
		} else {
			url = `${config.pmService.baseurl}/vppm/validateDispatchAddress?address=${location}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#validateAddress");
			}
			if (json && json.results) {
				return json
			} else {
				if (json && json.errors) {
					if (json.errors && json.errors.length > 0) {
						return new UnkonwnError({ data: json.errors[0] });
					}
				} else {
					return new UnkonwnError({ data: json });
				}
			}
		}).catch(err => {
			logger.debug("#validateAddress");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	updateDispatchAddress: (input, locationUnid, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.Vpuserservice.baseScruburl}/vendoruser/updateDispatchLocation/${locationUnid}`
		} else {
			url = `${config.Vpuserservice.baseurl}/vendoruser/updateDispatchLocation/${locationUnid}`
		}
		if(config.IopService.vendorManagementAPITOIOP == 'Y') {
			url = `${config.IopService.baseurl}/vendor-management/vendor-locations`
			input = {
				"address": input.address,
				"latitude": input.latitude,
				"longitude": input.longitude,
				"mdgId": input.mdg_id,
				"vendorName": input.vendor_name,
				"metaUniversalId": input.metaUniversalId,
				"createdBy": input.createdBy,
				"psLoc": input.psLoc,
				"modifiedBy": input.modifiedBy,
				"modifiedOn": input.modifiedOn,
				"createdOn": input.createdOn
			  }
		}

		return fetch(url, {
			method: 'PUT',
			body: config.IopService.vendorManagementAPITOIOP == 'Y' ? input : JSON.stringify({ "data": input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#updateDispatchAddress");
			}
			if(config.IopService.vendorManagementAPITOIOP == 'Y') {
				if(json && json.message) {
					json.resultmessage = json.message
					return json
				} else {
					if(json && json.errors) {
						json.errors[0].message = json.errors[0].detail
						return new UnkonwnError({ data: json })
					}
				}
			} else {
				if (json && json.fields) {
					return json
				} else {
					if (json && json.resultcode) {
						switch (json.resultcode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}
		}).catch(err => {
			logger.debug("#updateDispatchAddress");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	deleteDispatchAddress: (locationUnid, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.Vpuserservice.baseScruburl}/vendoruser/deleteDispatchLocation/${locationUnid}`
		} else {
			url = `${config.Vpuserservice.baseurl}/vendoruser/deleteDispatchLocation/${locationUnid}`
		}
		if(config.IopService.vendorManagementAPITOIOP == 'Y') {
			url = `${config.IopService.baseurl}/vendor-management/vendor-locations/${locationUnid}`
		}

		return fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#deleteDispatchAddress");
			}
			if(config.IopService.vendorManagementAPITOIOP == 'Y') {
				if(json && json.message) {
					json.resultmessage = json.message
					return json
				} else {
					if(json && json.errors) {
						json.errors[0].message = json.errors[0].detail
						return new UnkonwnError({ data: json })
					}
				}
			} else {
				if (json && json.resultmessage) {
	
					return json
				} else {
					if (json && json.error.code) {
						switch (json.error.code) {
							case 404:
								return new NotFound({ code: json.error.code, message: json.error.message, details: json.error.details });
							case 502:
								return new GateWayDown({ code: json.error.code, message: json.error.message, details: json.error.details });
							case 400:
								return new InputError({ code: json.error.code, message: json.error.message, details: json.error.details });
							case 500:
								return new CustomErr({ code: json.error.code, message: json.error.message, details: json.error.details });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}
		}).catch(err => {
			logger.debug("#deleteDispatchAddress");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getDispatchLocations: (unid, mdgId, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.Vpuserservice.baseScruburl}/vendoruser/getDispatchLocations/${unid}`
		} else {
			url = `${config.Vpuserservice.baseurl}/vendoruser/getDispatchLocations/${unid}`
		}
		if(config.IopService.vendorManagementAPITOIOP == 'Y') {
			url = `${config.IopService.baseurl}/vendor-management/vendor-locations/mdg/${mdgId}`
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
					return errorHandler(json, "#getDispatchLocations");
				}
				if(config.IopService.vendorManagementAPITOIOP == 'Y') {
					if (json && json.data) {
						let data = json.data.map(list => {
							return {
								meta_universalid : list.metaUniversalId,
								meta_createddate: list.createdOn,
								meta_createdby: list.createdBy,
								meta_lastupdatedate: list.modifiedOn,
								meta_lastupdateby: list.modifiedBy,
								vendor_name: list.vendorName,
								ps_loc: list.psLoc,
								mdg_id: list.mdgId,
								address: list.address,
								latitude: list.latitude,
								longitude:list.longitude
							}
						})
						json.vendorlocations = data
						return json;
					} else {
						json.vendorlocations = []
						return json;
					}
				} else {
					if (json && json.vendorlocations) {
						return json;
					} else {
						if (json && json.resultcode) {
							switch (json.resultcode) {
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
							return new CustomErr({ data: { code: 500, message: "Oops! Address list cannot be loaded. Please retry." } });
						}
	
					}
				}
			}).catch(err => {
				logger.debug("#getDispatchLocations");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getVduStepStatus: (projectId, vduId, siteunid, siteName, vendorId, vendorName, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/deviceTest/getvduStepStatus?projectId=${projectId}&vduId=${vduId}&siteunid=${siteunid}&siteName=${siteName}&vendorId=${vendorId}&vendorName=${vendorName}`
		} else {
			url = `${config.pmService.baseurl}/deviceTest/getvduStepStatus?projectId=${projectId}&vduId=${vduId}&siteunid=${siteunid}&siteName=${siteName}&vendorId=${vendorId}&vendorName=${vendorName}`
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
					return errorHandler(json, "#getVduStepStatus");
				}
				if (json && json.stepStatus) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							case 400:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! Step Status cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getVduStepStatus");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	vduReplacement: (input, siteunid, siteName, vendorId, vendorName, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/deviceTest/vduValidationReplacement?siteunid=${siteunid}&siteName=${siteName}&vendorId=${vendorId}&vendorName=${vendorName}`
		} else {
			url = `${config.pmService.baseurl}/deviceTest/vduValidationReplacement?siteunid=${siteunid}&siteName=${siteName}&vendorId=${vendorId}&vendorName=${vendorName}`
		}
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify({ "vduReqBody": input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (json.stepStatus) {
				return json;
			} else {
				if (json && json.code) {
					switch (json.code) {
						case 404:
							return new NotFound({ data: json });
						case 502:
							return new GateWayDown({ data: json });
						case 400:
							return new InputError({ data: json });
						case 500:
							return new CustomErr({ data: json });
						default:
							return new UnkonwnError({ data: json });
					}
				} else {
					return new UnkonwnError({ data: json });
				}
			}
		}).catch(err => {
			logger.debug("#vduReplacement");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getLoadCqData:(input) => {
		let url =`${config.IopService.baseurl}/ericssonvrancfgservice/vdu/server-test/loadcq`
		
		return fetch(url, {
			method: 'POST',
			body: input,
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getLoadCqData");
				}
				if (json && json.cfg_request) {
					return json;
				}
				else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				}
			}).catch(err => {
				logger.debug("#getLoadCqData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	ericssionServerTest:(input) => {
		let url = `${config.IopService.baseurl}/ericssonvrancfgservice/generate/vdu/server-test`

		return fetch(url, {
			method: 'POST',
			body: input,
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#ericssionServerTest");
				}
				if (json) {
					return json;
				}
				else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				}
			}).catch(err => {
				logger.debug("#ericssionServerTest");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	getvduHistoryForProject: (vdu_id, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/ericssonvrancfgservice/requests/skinnyos/history?id=${vdu_id}`
		} else {
			url = `${config.IopService.baseurl}/ericssonvrancfgservice/requests/skinnyos/history?id=${vdu_id}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json =>{
			if (typeof json === 'string') {
				return errorHandler(json, "#getvduHistoryForProject");
			}
			if (json && json.req_details) {
				return json;
			}
			else if (json.errors && json.errors.length > 0) {
				return new UnkonwnError({ data: json.errors });
			}
		}).catch (err => {
			logger.debug("#getvduHistoryForProject");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}

		})

	},
	getUserInfoForCompanies: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getUserInfoCompanyLinked`
		} else {
			url = `${config.pmService.baseurl}/vppm/getUserInfoCompanyLinked`
		}

		return fetch(url, {
			method: 'GET',
			body: input,
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getUserInfoCompanyLinked");
				}
				if (json && json.result && json.result.length>0) {
					return json;
				}
				else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				}
			}).catch(err => {
				logger.debug("#getUserInfoCompanyLinked");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	getHolidayEvents: (clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getHolidayEvents`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getHolidayEvents`
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
					return errorHandler(json, "#getHolidayEvents");
				}
				if (json && json.holidayEvents) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json.errors });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! Holidays list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getHolidayEvents");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getOffHours: (id, submarket, clientreq) => {
		let url = ''
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;


		if (id) {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/sectorlock/getOffHours/?id=${id}`
			} else {
				url = `${config.pmService.baseurl}/sectorlock/getOffHours/?id=${id}`
			}
		}
		else if (submarket) {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/sectorlock/getOffHours/?submarket=${submarket}`
			} else {
				url = `${config.pmService.baseurl}/sectorlock/getOffHours/?submarket=${submarket}`
			}

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
					return errorHandler(json, "#getOffHours");
				}
				if (json && json.offhours) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json.errors });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! OffHours list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getOffHours");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	generatePDFData: (clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/generateData`
		} else {
			url = `${config.pmService.baseurl}/vppm/generateData`
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
					return errorHandler(json, "#generatePDFData");
				}
				if (json) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json.errors });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! PDF Data cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#generatePDFData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getRelatedVendors: (keyword, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if(config.userServiceVP == "Y"){
				url = `${config.pmService.baseScruburl}/vppm/getRelatedVendorsVP?keyword=${keyword}`
			}else{
				url = `${config.pmService.baseScruburl}/vppm/getRelatedVendors?keyword=${keyword}`
			}
		} else {
			if(config.userServiceVP == "Y"){
				url = `${config.pmService.baseurl}/vppm/getRelatedVendorsVP?keyword=${keyword}`
			}else{
				url = `${config.pmService.baseurl}/vppm/getRelatedVendors?keyword=${keyword}`
			}
		}
		if (config.IopService.vendorManagementAPITOIOP == "Y"){
			url = `${config.IopService.baseurl}/vendor-management/vendors/${encodeURIComponent(keyword)}`;
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
				return errorHandler(json, "#getRelatedVendors");
			}
			if (json && json.data) {
				if (config.IopService.vendorManagementAPITOIOP == "Y"){
					let { data } = json;
					let output = {
						data: []
					};
					let resultObject = {}
					for(const vendorInfo of data){
						let vendorName = vendorInfo.vendorName ? vendorInfo.vendorName : "";
						let vendorCategory = vendorInfo.vendorCategory ? ` - (${vendorInfo.vendorCategory})` : "";
						let vendorId = vendorInfo.vendorId ? vendorInfo.vendorId : "";
						let serviceEmail = vendorInfo.serviceEmail ? vendorInfo.serviceEmail : "";
						let metaUniversalId = vendorInfo.metaUniversalId ? vendorInfo.metaUniversalId : "";
						let mdgId = vendorInfo.mdgId ? vendorInfo.mdgId : "";

						resultObject = {
							display: `${vendorName}` + vendorCategory,
							value: `${vendorId}¤${serviceEmail}¤${metaUniversalId}¤${mdgId}`
						}

						output.data.push(resultObject); 
					}

					json = output;
				}
				return json;
			} else {
				if (json && json.errors) {
					let code = json.errors[0].code ? json.errors[0].code : json.errors[0].status;
					if (typeof code === 'string') {
						code = parseInt(code)
					}
					switch (code) {
						case 404:
							return new NotFound({ data: json.errors });
						case 502:
							return new GateWayDown({ data: json.errors });
						case 500:
							return new CustomErr({ data: json.errors });
						default:
							return new UnkonwnError({ data: json.errors });
					}
				} else {
					return new CustomErr({ data: { code: 500, message: "Oops! Data cannot be loaded. Please retry." } });
				}

			}
		}).catch(err => {
			logger.debug("#getRelatedVendors");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getRelatedUsers: (keyword, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if(config.userServiceVP == "Y"){
				url = `${config.pmService.baseScruburl}/vppm/getRelatedUsersVP?keyword=${keyword}`
			}else{
            url = `${config.pmService.baseScruburl}/vppm/getRelatedUsers?keyword=${keyword}`
			}
		} else {
			if(config.userServiceVP == "Y"){
				url = `${config.pmService.baseurl}/vppm/getRelatedUsersVP?keyword=${keyword}`
			}else{
            url = `${config.pmService.baseurl}/vppm/getRelatedUsers?keyword=${keyword}`
			}
		}
		if (config.IopService.vendorManagementAPITOIOP == "Y"){
			url = `${config.IopService.baseurl}/vendor-management/vendor-contact/contact-detail/info?searchText=${keyword}`
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
				return errorHandler(json, "#getRelatedUsers");
			}
			if (json && json.data) {
				if (config.IopService.vendorManagementAPITOIOP == "Y"){
					logger.info("#getRelatedUsers--", JSON.stringify(json));
					let { data } = json;
					let output = {
						data: []
					};
					let resultObject = {};
					for (const user of data) {
						let contactName = user.contactName ? user.contactName : "";
						let contactId = user.contactId ? ` (${user.contactId})` : "";
						let vendorNameFormatted = user.vendorName ? ` - ${user.vendorName}` : "";
						let userMetaUniversalid = user.metaUniversalid ? user.metaUniversalid : "";
						let userVendorId = user.vendorId ? user.vendorId : "";
						let vendorName = user.vendorName ? user.vendorName : "";
						let metaUniversalId = user.metaUniversalId ? user.metaUniversalId : "";
						resultObject = {
							display: `${contactName}` + contactId + vendorNameFormatted,
							value: `${userMetaUniversalid}¤USER¤${userVendorId}¤${vendorName}¤${metaUniversalId}`
						}
						output.data.push(resultObject);
					}
					json = output;
				}
				return json;
			} else {
				if (json && json.errors) {
					let code = json.errors[0].code ? json.errors[0].code : json.errors[0].status;
					if (typeof code === 'string') {
						code = parseInt(code)
					}
					switch (code) {
						case 404:
							return new NotFound({ data: json.errors });
						case 502:
							return new GateWayDown({ data: json.errors });
						case 500:
							return new CustomErr({ data: json.errors });
						default:
							return new UnkonwnError({ data: json.errors });
					}
				} else {
					return new CustomErr({ data: { code: 500, message: "Oops! Data cannot be loaded. Please retry." } });
				}

			}
		}).catch(err => {
			logger.debug("#getRelatedUsers");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getVendorProfile: (vendorId, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if(config.userServiceVP == "Y"){
				url = `${config.pmService.baseScruburl}/vppm/getVendorProfileVP?vendorId=${vendorId}`
			}else{
            url = `${config.pmService.baseScruburl}/vppm/getVendorProfile?vendorId=${vendorId}`
			}
		} else {
			if(config.userServiceVP == "Y"){
				url = `${config.pmService.baseurl}/vppm/getVendorProfileVP?vendorId=${vendorId}`
			}else{
            url = `${config.pmService.baseurl}/vppm/getVendorProfile?vendorId=${vendorId}`
			}
		}
		if (config.IopService.vendorManagementAPITOIOP == "Y"){
			url = `${config.IopService.baseurl}/vendor-management/vendors/vendor-info/${vendorId}`;
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
				return errorHandler(json, "#getVendorProfile");
			}
			if (json && json.data) {
				if (config.IopService.vendorManagementAPITOIOP == "Y"){
					let { data } = json;
					let output = {
						address: data.address,
						area: data.area,
						can_see_group: data.canSeeGroup,
						city: data.city,
						is_disabled: data.isDisabled,
						ivr_domain: data.ivrDomain,
						mdg_id: data.mdgId,
						meta_createdby: data.createdBy,
						meta_createddate: data.createdOn,
						meta_lastupdateby: data.modifiedBy,
						meta_lastupdatedate: data.modifiedOn,
						meta_universalid: data.metaUniversalId,
						peoplesoft_id: data.peoplesoftId,
						phone: data.phone,
						pricing_macro_ant_tow: data.pricingMacroAntTow,
						pricing_small_cell: data.pricingSmallCell,
						region: data.region,
						service_email: data.serviceEmail,
						state: data.state,
						vendor_category: data.vendorCategory,
						vendor_id: data.vendorId,
						vendor_name: data.vendorName,
						vendor_portal: data.vendorPortal,
						vendor_sponsor_id: data.vendorSponsorId,
						zip: data.zip
					};
					
					let result = {
						data: [output]
					}

					logger.info("Returning response : " + JSON.stringify(result));
					return result;
				} else {
					return json;
				} 
			} else {
				if (json && json.errors) {
					switch (json.errors[0].status) {
						case 404:
							return new NotFound({ data: json.errors });
						case 502:
							return new GateWayDown({ data: json.errors });
						case 500:
							return new CustomErr({ data: json.errors });
						default:
							return new UnkonwnError({ data: json.errors });
					}
				} else {
					return new CustomErr({ data: { code: 500, message: "Oops! Data cannot be loaded. Please retry." } });
				}

			}
		}).catch(err => {
			logger.debug("#getVendorProfile");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getProjectInfoSlr(projectNumber, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getProjectInfoSlr?project_number=${projectNumber}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getProjectInfoSlr?project_number=${projectNumber}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getProjectInfoSlr");
			}
			if (json && json.data) {
				return json.data;
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
	getDangerousSite(siteUnid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getDangerousSites/${siteUnid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getDangerousSites/${siteUnid}`
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
					return errorHandler(json, "#getDangerousSite");
				}
				if (json) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getDangerousSite");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getReceivedSitesVendor: (vendorId, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getReceivedSitesVendor?vendorid=${vendorId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getReceivedSitesVendor?vendorid=${vendorId}`
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
				if (json) {
					if (json.count === 0) {
						return { count: 0, receivedSitesData: [] }
					}
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
						return new CustomErr({ data: { code: 500, message: "Oops! Sites list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#POBanner");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	createDeviceTestRequest: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/deviceTest/createDeviceTestRequest`
		} else {
			url = `${config.pmService.baseurl}/deviceTest/createDeviceTestRequest`
		}
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify({ "deviceReqBody": input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (json) {
				return json
			} else {
				if (json && json.code) {
					switch (json.code) {
						case 404:
							return new NotFound({ data: json });
						case 502:
							return new GateWayDown({ data: json });
						case 400:
							return new InputError({ data: json });
						case 500:
							return new CustomErr({ data: json });
						default:
							return new UnkonwnError({ data: json });
					}
				} else {
					return new UnkonwnError({ data: json });
				}
			}
		}).catch(err => {
			logger.debug("#createContact");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	deviceTestDetails: (project_num, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/deviceTest/deviceTestDetails/${project_num}`
		} else {
			url = `${config.pmService.baseurl}/deviceTest/deviceTestDetails/${project_num}`
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
				if (json) {
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
						return new CustomErr({ data: { code: 500, message: "Oops! User list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getVendorList");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getDeviceTestHistory: (project_num, test_type, vdu_type, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/deviceTest/deviceTestHistory?project_num=${project_num}&test_type=${test_type}&vdu_type=${vdu_type}`;
		} else {
			url = `${config.pmService.baseurl}/deviceTest/deviceTestHistory?project_num=${project_num}&test_type=${test_type}&vdu_type=${vdu_type}`;
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
				if (json) {
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
						return new CustomErr({ data: { code: 500, message: "Oops! User list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getDeviceTestHistory");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	deviceConfigView: (request_id, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/deviceTest/deviceConfigView/${request_id}`
		} else {
			url = `${config.pmService.baseurl}/deviceTest/deviceConfigView/${request_id}`
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
				if (json) {
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
						return new CustomErr({ data: { code: 500, message: "Oops! User list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#deviceConfigView");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getVendorContactRecord: (contact_unid, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.Vpuserservice.baseScruburl}/vendoruser/contact/get?meta_universalid=${contact_unid}`
		} else {
			url = `${config.Vpuserservice.baseurl}/vendoruser/contact/get?meta_universalid=${contact_unid}`
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
					return errorHandler(json, "#getVendorContactRecord");
				}
				if (json.fields && json.fields.name) {
					return json.fields;
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
						return new CustomErr({ data: { code: 500, message: "Oops! User details cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getVendorContactRecord");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	createContact: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if (config.userServiceVP == "Y") {
				url = `${config.Vpuserservice.baseScruburl}/vendorusernew/contact/create`
			} else {
				url = `${config.Vpuserservice.baseScruburl}/vendoruser/contact/create`
			}
		} else {
			if (config.userServiceVP == "Y") {
				url = `${config.Vpuserservice.baseurl}/vendorusernew/contact/create`

			} else {
				url = `${config.Vpuserservice.baseurl}/vendoruser/contact/create`
			}
		}
		let payload = {};
		if (config.IopService.vendorManagementAPITOIOP == "Y") {
			url = `${config.IopService.baseurl}/vendor-management/vendor-contact/${input.vendor_id}`
			payload = {
				"contactName": `${input.fname}, ${input.lname}`,
				"contactPhone": input.phone,
				"contactEmail": input.email,
				"metaUniversalid": input.contact_unid,
				"contactFname": input.fname,
				"contactLname": input.lname,
				"contactTitle": input.title,
				"isDisabled": 0,
				"vendorRole": input.vendor_role,
				"createdBy": input.created_by,
				"modifiedBy": input.created_by
			}
		}
		return fetch(url, {
			method: 'POST',
			body: config.IopService.vendorManagementAPITOIOP == "Y" ? [payload] : JSON.stringify({ data: input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#createContact");
				}
				logger.info("createContact URL : " + url);
				logger.info("createContact payload : " + JSON.stringify(payload));
				logger.info("createContact Response : " + JSON.stringify(json));
				if (config.IopService.vendorManagementAPITOIOP == "Y") {
					if (json && json[0].contactId) {
						let response = {
							vendor_id: json[0].vendorId,
							name: json[0].contactName,
							fname: json[0].contactFname,
							lname: json[0].contactLname,
							email: json[0].contactEmail,
							phone: json[0].contactPhone,
							userid: json[0].contactId,
							title: json[0].contactTitle,
							vendor_role: json[0].vendorRole,
							metaUniversalId: json[0].metaUniversalid,
							login_id: json[0].contactId,
						}
						let finalResponse = {
							message: "Contact created successfully",
							data: response
						}
						return finalResponse;
					} else {
						return { code: 500, message: "Something went wrong. Please try after sometime." };
					}
				}
				if (json.fields && json.fields.fname) {
					return {
						code: 200,
						message: json.resultmessage,
						data: json.fields
					};
				} else {
					if (json && json.code) {
						switch (json.code) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#createContact");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	updateContact: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
		if(config.userServiceVP == "Y"){
			url = `${config.Vpuserservice.baseScruburl}/vendorusernew/contact/update?meta_universalid=${input.contact_unid}`
		}else{
			url = `${config.Vpuserservice.baseScruburl}/vendoruser/contact/update?meta_universalid=${input.contact_unid}`
		}
		} else {
		if(config.userServiceVP == "Y"){
			url = `${config.Vpuserservice.baseurl}/vendorusernew/contact/update?meta_universalid=${input.contact_unid}`
		}else{
			url = `${config.Vpuserservice.baseurl}/vendoruser/contact/update?meta_universalid=${input.contact_unid}`

		}
		}
		let payload = {}
		if (config.IopService.vendorManagementAPITOIOP == "Y") {
			url = `${config.IopService.baseurl}/vendor-management/vendor-contact/${input.vendor_id}`
			payload = {
				"contactName": `${input.fname}, ${input.lname}`,
				"contactPhone": input.phone,
				"contactEmail": input.email,
				"metaUniversalid": input.contact_unid,
				"contactFname": input.fname,
				"contactLname": input.lname,
				"contactTitle": input.title,
				"isDisabled": 0,
				"vendorRole": input.vendor_role,
				"createdBy": input.created_by,
				"modifiedBy": input.created_by
			}
		}
		return fetch(url, {
			method: config.IopService.vendorManagementAPITOIOP == "Y" ? 'POST' : 'PUT',
			body: config.IopService.vendorManagementAPITOIOP == "Y" ? [payload] : JSON.stringify({ data: input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateContact");
				}
				logger.info("updateContact URL : " + url, payload, json);
				logger.info("updateContact payload : " + JSON.stringify(payload));
				logger.info("updateContact Response : " + JSON.stringify(json));
				if (config.IopService.vendorManagementAPITOIOP == "Y") {
					if (json && json[0].contactId) {
						let response = {
							vendor_id: json[0].vendorId,
							name: json[0].contactName,
							fname: json[0].contactFname,
							lname: json[0].contactLname,
							email: json[0].contactEmail,
							phone: json[0].contactPhone,
							userid: json[0].contactId,
							title: json[0].contactTitle,
							vendor_role: json[0].vendorRole,
							metaUniversalId: json[0].metaUniversalid,
							login_id: json[0].contactId,
						}
						let finalResponse = {
							message: "Contact updated successfully",
							data: response
						}
						return finalResponse;
					} else {
						return { code: 500, message: "Something went wrong. Please try after sometime." };
					}
				}
				if (json.fields && json.fields.fname) {
					return {
						code: 200,
						message: json.resultmessage,
						data: json.fields
					};
				} else {
					if (json && json.code) {
						switch (json.code) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#updateContact");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	deleteContactRecord: (contact_unid, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if(config.userServiceVP == "Y"){
				url = `${config.Vpuserservice.baseScruburl}/vendorusernew/contact/delete?meta_universalid=${contact_unid}`
			}else{
				url = `${config.Vpuserservice.baseScruburl}/vendoruser/contact/delete?meta_universalid=${contact_unid}`
			}
		} else {
			if(config.userServiceVP == "Y"){
				url = `${config.Vpuserservice.baseurl}/vendorusernew/contact/delete?meta_universalid=${contact_unid}`
			}else{
				url = `${config.Vpuserservice.baseurl}/vendoruser/contact/delete?meta_universalid=${contact_unid}`
			}
		}
		return fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#deleteContactRecord");
				}
				if (json && json.resultmessage) {
					return {
						code: 200,
						message: json.resultmessage
					}
				} else {
					if (json && json.code) {
						switch (json.code) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#deleteContactRecord");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	deleteUsers: (input) => {
		
		let url = `${config.Vpuserservice.baseurl}/vendoruser/deleteUsers`;
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),

			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#deleteUsers");
				}
				if (json && json.message) {
					return json
				} else {
					if (json && json.code) {
						switch (json.code) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#deleteUsers");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	
	logout(clientreq) {
		const responseData = constructSessionExpireResponse(clientreq.session);
		return new Promise((resolve, reject) => clientreq.session.destroy((err) => {
			resolve(responseData)
		}));
	},
	session(clientreq) {
		return new Promise((resolve, reject) => {
			resolve({ code: '200', message: "Success" })
		});
	},
	checkForValidSession(clientreq) {
		let Authorization = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.userid) ? clientreq.session.userdata.userid : null;
		return new Promise((resolve, reject) => {
			if (Authorization) {
				resolve({
					code: 200,
					message: "Session is Valid",
				});
			} else {
				resolve(new UnAuthorized({ data: { code: 401, message: "You are not authorized for this action" } }));
			}
		});
	},
	saveUserActivity(req, clientreq) {
		let input = userActivity(req, clientreq);
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/saveUserActivity`
		} else {
			url = `${config.pmService.baseurl}/vppm/saveUserActivity`
		}
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.catch(err => {
				logger.info("#saveUserActivity", err);
				logger.error(err);
			});
	},
	getVendorWorkOrder(loginId, startdate, enddate, mdgId, clientreq) {
		let vendorId = clientreq.get("Authorization")

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/workorder/vendor/${vendorId}/vendorDetails?startdt=${startdate}&enddt=${enddate}&includeAllPending=1&includePendingApproval=1&mdgId=${mdgId}`
		} else {
			url = `${config.pmService.baseurl}/workorder/vendor/${vendorId}/vendorDetails?startdt=${startdate}&enddt=${enddate}&includeAllPending=1&includePendingApproval=1&mdgId=${mdgId}`
		}

		let sdate = moment().subtract(1, 'M').startOf('month').format('YYYY-MM-DD');
		let etdate = moment().add(1, 'M').endOf('month').format('YYYY-MM-DD');
		let calUrl = `${config.IopService.baseurl}/opscalendar/event/get?startDate=${sdate}&endDate=${etdate}&vendorId=${vendorId}`;
		let siteResultSearch = []
		let switchResultSearch = []
		let promise1 = fetch(url + "&recordType=SITE", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"recordType": "SITE",
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getVendorWorkOrder");
				}
				if (json.vendor_wo_details) {
					return json.vendor_wo_details
				} if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "500":
							return json.errors;
						case "400":
							return new InputError({ data: { code: 400, message: "Vendor Id not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorWorkOrder");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		let promise2 = fetch(url + "&recordType=SWITCH", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"recordType": "SWITCH",
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getVendorWorkOrder");
				}
				if (json.vendor_wo_details) {
					switchResultSearch = json.vendor_wo_details
					return json.vendor_wo_details
				} if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Vendor Id not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorWorkOrder");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		let promise3 = fetch(calUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getSchedulesOfVendor");
				}
				if (json.data) {
					return json.data;
				}
				else if (json.length > 0 && json[0].title && json[0].title == "Bad Request") {
					console.log(json[0].detail);
					return [];
				}
				else {
					logger.info("Error while fetching Events Data");
					return [];
				}
			}).catch(err => {
				logger.debug("#getSchedulesOfVendor");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		return Promise.all([promise1, promise2, promise3]).then(async (values) => {
			if (!values[0].data || !values[1].data) {
				let result1 = values[0]
				if (result1[0] && result1[0].status && result1[0].status == "500") {
					return { errors: result1 };
				}
				else {
					let result2 = values[1]
					let result3 = result1.concat(result2)
					let result4 = values[2];

					let previousYear = moment().subtract(1, 'y').format('YYYY-MM-DD')

					result3 = result3.filter(v => v.requested_date && moment(v.requested_date.split(' ')[0]).isSameOrAfter(previousYear))

					let dashboardData = processDataForAdmin(result3);
					let user_dashboard = await processDataForUser(result3, result4);
					let workUrgencyResp = await vendorWorkOrderApis.getWorkUrgency();
					logger.info(`workUrgencyResp in getVendorWorkOrder : ${JSON.stringify(workUrgencyResp)}`);
					user_dashboard.filteredList = await Promise.all(
                        user_dashboard.filteredList.map(async item => {
                            const tickets = Array.isArray(item.trouble_ticket_details) ? item.trouble_ticket_details : [];
                            const firstTicket = tickets.length > 0 ? tickets[0] : null;

                            const ticketCreatedOn = firstTicket ? firstTicket.ticket_created_on : null;
                            const ticketTroubleType = firstTicket ? (firstTicket.ticket_trouble_type ?? firstTicket.trouble_type ?? null) : null;

                            let ruleType;
                            if (item.is_vip_site == "true") {
                                ruleType = 'VIP_SITE';
                            } else if (!ticketTroubleType) {
                                ruleType = 'NO_TICKET';
                            } else if( ticketTroubleType?.toUpperCase()?.trim() == 'OTHER') {
								ruleType = 'NO_TICKET';
							} else if (tickets.length > 0) {
                                ruleType = 'TROUBLE_TICKET';
                            } else {
                                ruleType = 'NO_TICKET';
                            }
							
                            let urgencyResp;
                            try {
                                urgencyResp = getWorkUrgencyValue(workUrgencyResp, ruleType, ticketTroubleType, ticketCreatedOn);
                            } catch (e) {
                                logger.info(`#getVendorWorkOrder - work_urgency fetch failed: ${e.message}`);
                                urgencyResp = null;
                            }

                            return {
                                ...item,
                                work_urgency: urgencyResp || 'LOW'
                            };
                        })
                    );

					return { vendor_wo_details: user_dashboard.filteredList, dashboard: dashboardData, user_dashboard: user_dashboard.panData, WorkType: user_dashboard.WorkType, rma_data: user_dashboard.rma_data };
				}
			}
		})
	},
	getSwitchDetails(switch_unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/switch/${switch_unid}`
		} else {
			url = `${config.IopService.baseurl}/switch/${switch_unid}`
		}
		let promise1 = fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization")
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getSwitchDetails");
				}
				if (json.switchdetails && json.switchdetails.switch_unid) {
					let contactsList = []
					if (json.switchdetails.tech_info && json.switchdetails.mgr_info) {
						let tech_info = json.switchdetails.tech_info.map(item => {
							return {
								role: "Switch Technician",
								name: `${item.lname}, ${item.fname}`,
								mgr_id: item.manager_id,
								altphone: item.alt_phone,
								...item
							}
						})
						let mgr_info = json.switchdetails.mgr_info.map(item => {
							return {
								role: "Switch Manager",
								name: `${item.lname}, ${item.fname}`,
								mgr_id: item.manager_id,
								altphone: item.alt_phone,
								...item
							}
						})
						contactsList = [...tech_info, ...mgr_info]
					}
					json.contacts = contactsList
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getSwitchDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		let promise3 = fetch(`${config.IopService.baseurl}/switch/${switch_unid}/czones`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization")
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getSwitchDetails");
				}
				if (json.callout_zones) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getSwitchDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		return Promise.all([promise1, promise3]).then((values) => {
			let switchInfo = values[0].switchdetails
			switchInfo["contacts"] = values[0].contacts
			switchInfo["callout_zones"] = values[1].callout_zones
			return {
				switchdetails: switchInfo
			}
		})
	},
	requestHealthCheck: (input, siteunid, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/healthCheckOfEnode/${siteunid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/healthCheckOfEnode/${siteunid}`
		}
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
			logger.debug("#requestHealthCheck");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},


	loadCqData: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/loadCqData`
		} else {
			url = `${config.pmService.baseurl}/vppm/loadCqData`
		}
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
			logger.debug("#loadCqData");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},

	generateValidationMMU: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/generateVduValidation`
		} else {
			url = `${config.pmService.baseurl}/vppm/generateVduValidation`
		}
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
			logger.debug("#generateValidationMMU");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},

	requestRETScan: (payload) => {

		let url = `${config.IopService.baseurl}/neops/ret/executeRETScan`;

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		}).then(json => {
			if (json && json.message) {

				return json;
			} else if (json.error) {
				let err = json.error;

				switch (err.status) {
					case "400":
						return new CustomErr({ data: { code: 400, message: err.detail } });
					case "500":
						return new CustomErr({ data: { code: 500, message: err.detail } });
					default:
						return new UnkonwnError({ data: { code: 400, message: err.detail } });
				}
			}
		}).catch(err => {
			logger.debug("#requestRETScan");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getRETScanDetails(oswId) {

		let url = `${config.IopService.baseurl}/neops/ret/request/${oswId}`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getRETScanDetails");
				}
				if (json && json.result.length >= 0) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getRETScanDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getHealthCheckDetails(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/siteRangeDetails/${siteunid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/siteRangeDetails/${siteunid}`
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
					return errorHandler(json, "#getHealthCheckDetails");
				}
				if (json) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getHealthCheckDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	viewMMUDownload(request_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/viewDownloadMMUResult?request_id=${request_id}`
		} else {
			url = `${config.pmService.baseurl}/vppm/viewDownloadMMUResult?request_id=${request_id}`
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
					return errorHandler(json, "#viewMMUDownload");
				}
				if (json) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#viewMMUDownload");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getMMURequests(project_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getAllMMULinkRequests?project_num=${project_id}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getAllMMULinkRequests?project_num=${project_id}`
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
					return errorHandler(json, "#getAllMMULinkRequests");
				}
				if (json) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getAllMMULinkRequests");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getConflictEventDetails(startDate, endDate,siteUnid, clientreq) {
		let url = `${config.IopService.baseurl}/opscalendar/event/get?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.000Z&siteUnid=${siteUnid}&includeConflicts=true`
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
					return errorHandler(json, "#getConflictEventDetails");
				}
				if (json.data) {
					return json;
				}
				else if (json.length > 0 && json[0].title && (json[0].title == "Error" || json[0].title == "Bad Request")) {
					return new NoDataFoundError({ data: json });
				} else {
					return new UnkonwnError({ data: json });
				}
			}).catch(err => {
				logger.debug("#getConflictEventDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCalenderEventsForSite(startDate, endDate,siteUnid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getScheduledEventsForSite?startDate=${startDate}&endDate=${endDate}&siteUnid=${siteUnid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getScheduledEventsForSite?startDate=${startDate}&endDate=${endDate}&siteUnid=${siteUnid}`
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
				   return errorHandler(json, "#getCalenderEventsForSite");
			   }
			   if (json && json.status==200 && json["data"]) {
				   return json;
			   } else if (json.errors && json.errors.length > 0) {	
				   switch (json.errors[0].status) {							
					   case "400":
						   return new InputError({ data: { code: 400, message: json.errors[0].detail } });
					   case "500":
						   return new CustomErr({ data: { code: 500, message: json.errors[0].detail } });
					   
					   case "502":
						   return new GateWayDown({ data: json });
					   
					   default:
						   return new UnkonwnError({ data: json });
				   }					
				   }
				else {
				   return new InputError();
			   }
		   }).catch(err => {
			   logger.debug("#getCalenderEventsForSite");
			   logger.error(err);
			   if (err.code === 'ECONNREFUSED') {
				   return new ConnectionRefuse();
			   } else {
				   return new UnkonwnError();
			   }
		   });
		},
	getHealthRequestDetails(requestid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/healthRequestDetails/${requestid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/healthRequestDetails/${requestid}`
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
					return errorHandler(json, "#getHealthRequestDetails");
				}
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getHealthRequestDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getFastHistory(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getFastHistory/${siteunid}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getFastHistory/${siteunid}`
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
					return errorHandler(json, "#getFastHistory");
				}
				if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "500":
							return new CustomErr({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else if (json) {
					return json;
				}

				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getFastHistory");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	async getSiteDetails(siteunid, clientreq) {
		let [sitedetails, nodedetails, rootDetails] = await Promise.all([getSiteDetailsCall(siteunid, clientreq), getNodeDetails(siteunid, clientreq),getRootDetails(siteunid, clientreq)]);
		if (sitedetails && sitedetails.sitedetails && nodedetails) {
			return {
				"sitedetails": {
					...sitedetails.sitedetails,
					"node_details": nodedetails.nodes,
					"root_drive" : rootDetails && rootDetails.root_drive  ? rootDetails.root_drive : sitedetails.sitedetails.root_drive
				}
			};
		}
		else {
			return new UnkonwnError();
		}
	},
	getProjectDetails(market, submarket, projectNumber, clientreq) {
		//check the isoffshore val from config
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getProjectDetails?market=${encodeURIComponent(market)}&submarket=${encodeURIComponent(submarket)}&project_number=${projectNumber}`
		}
		else {
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
				//filtering  gsam data
				let filteredData = json
				if (isOffShore) {
					filteredData = json && gsamUtil.restrictObjectInObjects(json, ['sitename'])
				}
				return filteredData;
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

	getProjectsList(mdg_id,startDate, endDate, submarket,clientreq) {
		let url = `${config.IopService.baseurl}/siteintegration/vp/project/vendor/${mdg_id}?startDate=${startDate}&endDate=${endDate}`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		}).then(json => {
			if (json && json.projects) {
				let allProjects = json.projects.filter(project => project.submarket == submarket)
				let schedule_projects =[]
				let unschedule_projects =[]
				
				allProjects.forEach(project =>{
					if(project.ops_events && project.ops_events.length >0){
					const isevent = project.ops_events.some(event =>  moment(event.end).isAfter(moment()) &&  (event.status.toUpperCase() === 'SCHEDULED' || event.status.toUpperCase() === 'RESCHEDULED'))
						if(isevent){
							schedule_projects.push(project)
						}else{
							unschedule_projects.push(project)
						}
					}else{
						unschedule_projects.push(project)
					}
				})
				let finalfilteredData ={
					schedule_projects,
					unschedule_projects,
					totalprojects: allProjects.length,
				}
			
				return finalfilteredData;
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

	getDownloadHealthcheck(requestid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/downloadHealthCheck/${requestid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/downloadHealthCheck/${requestid}`
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
			},
		})
			.then(json => {
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
				logger.debug("#getDownloadHealthcheck");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getEventsBySiteUnid(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getDisasterEvents?unid=${siteunid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getDisasterEvents?unid=${siteunid}`
		}
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (json) {
					return json;
				}
				else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "No data found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getEventsBySiteUnid");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getOpenOswForUser(user_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getOpenOswForUser?user_id=${user_id}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getOpenOswForUser?user_id=${user_id}`
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
					return errorHandler(json, "#getOpenOswForUser");
				}
				if (json && json.hasOwnProperty('openOsw')) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
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
				logger.debug("#getOpenOswForUser");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCompanyInfoForVendor(vendor_mdg_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getCompanyInfoforVendor?vendor_mdg_id=${vendor_mdg_id}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getCompanyInfoforVendor?vendor_mdg_id=${vendor_mdg_id}`
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
					return errorHandler(json, "#getVendorCompanyInfo");
				}
				if (json && json.companyinfoforvendor.length > 0) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorCompanyInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCountforVPAutomation(vendor_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getCountVPAutomation/${vendor_id}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getCountVPAutomation/${vendor_id}`
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
					return errorHandler(json, "#VPAutomation Count");
				}
				if (json && json.hasOwnProperty('VPAutomationCount')) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#VPAutomation Count");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	updateAutoVpPermission: (input, clientreq) => {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/updateAutoVpPermission`;
		} else {
			url = `${config.pmService.baseurl}/vppm/updateAutoVpPermission`;
		}
		return fetch(url, {
			method: 'PUT',
			body: input,
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateAutoVpPermission");
				}
				if (json && json.hasOwnProperty('updateAutoVpPermission')) {
					return json;
				}
				else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				}
			}).catch(err => {
				logger.debug("#updateAutoVpPermission");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	getCompaniesInfoForAllVendors(clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getVendorInfoVendorUserDashboard`
		} else {
			url = `${config.pmService.baseurl}/vppm/getVendorInfoVendorUserDashboard`
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
					return errorHandler(json, "#getCompaniesInfoForAllVendors");
				}
				if (json && json.companyinfoforvendorDetails.length > 0) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getCompaniesInfoForAllVendors");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getMarketsforGenRunReport(clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/genrun/getMarkets`
		} else {
			url = `${config.pmService.baseurl}/genrun/getMarkets`
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
					return errorHandler(json, "#getVendorMarketInfo");
				}
				if (json && json.data.length > 0) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorMarketInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSubMarketsforGenRunReport(market, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/genrun/getSubMarkets?market=${market}`
		} else {
			url = `${config.pmService.baseurl}/genrun/getSubMarkets?market=${market}`
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
					return errorHandler(json, "#getVendorSubMarketInfo");
				}
				if (json && json.data.length > 0) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getVendorSubMarketInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	
	getAnteenaInformation(siteUnid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getAnteenaInformation/${siteUnid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getAnteenaInformation/${siteUnid}`
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
					return errorHandler(json, "#getAnteenaInformation");
				}
				if (json && json.hasOwnProperty('towerdetails')) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
							return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getAnteenaInformation");
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
			} else {
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
					return errorHandler(json, "#getVendorSwitchesInfo");
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
		} else {
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
					return errorHandler(json, "#getVendorDevicesInfo");
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
		} else {
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
					return errorHandler(json, "#getgenRunResult");
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
	getFileDataForPmlist(pmListId, pmListItemId, updateType, name, isCommonFile, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;


		let url
		if (updateType === 'VP')
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getAttachments?pmListId=${pmListId}&category=${updateType}&pmListItemId=${pmListItemId}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getAttachments?pmListId=${pmListId}&category=${updateType}&pmListItemId=${pmListItemId}`
			}
		else if (updateType === 'IOP')
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getAttachments?pmListId=${pmListId}&category=${updateType}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getAttachments?pmListId=${pmListId}&category=${updateType}`
			}
		else if (updateType === 'VP_PM')
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getAttachments?pmListId=${pmListId}&category=${updateType}&name=${name}&isCommonFile=${isCommonFile}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getAttachments?pmListId=${pmListId}&category=${updateType}&name=${name}&isCommonFile=${isCommonFile}`
			}
		else if (updateType === 'VP_COMMON') {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getAttachments?name=${name}&category=${updateType}&isCommonFile=${isCommonFile}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getAttachments?name=${name}&category=${updateType}&isCommonFile=${isCommonFile}`
			}
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
					return errorHandler(json, "#getFileDataForPmlist");
				}

				if (json.result) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Oops! You are not associated with Verizon at this point. Your company may have been moved or deleted." } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getFileDataForPmlist");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getTrainingMaterial(clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getTrainingMaterial`
		} else {
			url = `${config.pmService.baseurl}/vppm/getTrainingMaterial`
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
					return errorHandler(json, "#getTrainingMaterial");
				}
				if (json && json.trainingList) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "No file data found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getTrainingMaterial");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getNotifications(category, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';
		if (category) {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getNotifications?category=${category}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getNotifications?category=${category}`
			}
		} else {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getNotifications`
			} else {
				url = `${config.pmService.baseurl}/vppm/getNotifications`
			}
		}

		//let url = category ? `${config.pmService.baseurl}/vppm/getNotifications?category=${category}`: `${config.pmService.baseurl}/vppm/getNotifications`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getNotifications");
				}
				if (json && json.notifications) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "No notifications found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getNotifications");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getSectorLockData(unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getLockRefData?unid=${unid}`
		}else{
			url = `${config.pmService.baseurl}/sectorlock/getLockRefData?unid=${unid}`
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
					return errorHandler(json, "#getSectorLockData");
				}
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getSectorLockData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getEnodebData(unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getSiteEnodeBData?site_unid=${unid}`
		}else{
			url = `${config.pmService.baseurl}/sectorlock/getSiteEnodeBData?site_unid=${unid}`
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
					return errorHandler(json, "#getEnodebData");
				}
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getEnodebData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getPendingWorkOrderDetails(vendorId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMListItemsForPendingWorkOrderSites?vendorId=${vendorId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMListItemsForPendingWorkOrderSites?vendorId=${vendorId}`
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
					return errorHandler(json, "#getPendingWorkOrderDetails");
				}

				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Oops! You are not associated with Verizon at this point. Your company may have been moved or deleted." } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {

				logger.debug("#getPendingWorkOrderDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCompletedAttDetails(pmListId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getCompletedItemsAttributesData?pmListItem=${pmListId}`;
		} else {
			url = `${config.pmService.baseurl}/vppm/getCompletedItemsAttributesData?pmListItem=${pmListId}`;
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
					return errorHandler(json, "#getCompletedAttDetails");
				}

				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Oops! You are not associated with Verizon at this point. Your company may have been moved or deleted." } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {

				logger.debug("#getCompletedAttDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getPendingItemsForUpdate(pmListIds, pmType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMlistItemsToUpdateVP?pmListIds=${pmListIds}&pmType=${pmType}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMlistItemsToUpdateVP?pmListIds=${pmListIds}&pmType=${pmType}`
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
					return errorHandler(json, "#getPendingItemsForUpdate");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json.listItems) {

					return { listItems: json.listItems };
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getPendingItemsForUpdate");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	
	getCbandProjDetails(projectNum, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getProjectInfoByProjNum?project_num=${projectNum}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getProjectInfoByProjNum?project_num=${projectNum}`
		}

		return fetch(url, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			}
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getCbandProjDetails");
				}
				if (json.output && json.output.iop_data) {
					return json.output.iop_data;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#getCbandProjDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	serialNumberUpdate(input, clientreq) {
		// let url = "http://txsliopda8v.nss.vzwnet.com:8033/vppm/site5gProject";
		let url = `${config.pmService.baseurl}/vppm/site5gProject`
		return fetch(url, {
			method: "POST",
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			}
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateSerialNumber");
				}
				if (json && json.updatedAtollInfo) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#updateSerialNumber");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	get5gRepeaterProjectDetails(projectNum, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/get5gProjects/${projectNum}`
		} else {
			url = `${config.pmService.baseurl}/vppm/get5gProjects/${projectNum}`
		}

		return fetch(url, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			}
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#get5gRepeaterProjectDetails");
				}
				if (json && json.atoll_info) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#get5gRepeaterProjectDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSnapProjects(market, submarket) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getSnapProjects?market=${market}&submarket=${submarket}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getSnapProjects?market=${market}&submarket=${submarket}`
		}

		return fetch(url, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			}
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getSnapProjects");
				}

				if (json.output && json.output.projects) {
					return { output: json.output.projects };
				}

				else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#getSnapProjects");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},


	getCbandSnapProjects(market, submarket, clientreq) {

		//check the isoffshore val from config
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		let formatRes = this.formatResponse;
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getProjectsInfo?market=${market}&submarket=${submarket}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getProjectsInfo?market=${market}&submarket=${submarket}`
		}

		return fetch(url, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			}
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getCbandSnapProjects");
				}

				if (json.output && json.output.c_band && json.output && json.output.snap) {
					let snapArr = json.output.snap.map(i => ({
						...i,
						project_initiative: 'SNAP',
						model: ''
					}))
					let cbandArr = json.output.c_band.map(i => ({
						...i,
						project_initiative: 'C-BAND',
						model: ''
					}))
					let fiveGRepeterArr = json.output["5gr"].map(i => ({
						...i,
						project_initiative: '5G-Repeater',
						model: ''
					}))
					let cacheArr = json.output.cache.map(i => ({
						...i,
						project_initiative: i.project_initiative.indexOf('CBAND') >= 0 ? 'C-BAND' : ["5GR", "5gr"].includes(i.project_initiative) ? "5G-Repeater" : i.project_initiative,
					}))

					let snapData = [...snapArr, ...cbandArr, ...fiveGRepeterArr, ...cacheArr]

					//filtering gsam data
					let filteredData = snapData
					if (isOffShore) {
						filteredData = snapData && snapData.length > 0 && gsamUtil.restrictData(snapData, ['sitename'])
					}
					//return { output: [...snapArr, ...cbandArr, ...fiveGRepeterArr, ...cacheArr] }
					return { output: filteredData }
				}

				else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						case "500":
							return new InternalServerError({ data: { code: 500, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#getCbandSnapProjects");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getPmListDetails(vendorId, pmType, year, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMListsForVP?vendorId=${vendorId}&year=${year}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMListsForVP?vendorId=${vendorId}&year=${year}`
		}


		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				const completedStatus = ['COMPLETED', 'ACCEPTED', 'RECEIVED', 'CLOSED', 'CANCELLED', 'DECLINED', 'RESUBMITTED', 'DECLINED_DRAFT', 'INVOICED']
				const pendingStatus = ['PENDING', 'PENDING_DRAFT']
				if (typeof json === 'string') {
					return errorHandler(json, "#getPmListDetails");
				}

				if (json && !json.errors && Object.keys(json).length > 0 && json.pmLists.length > 0 && json.pmListItemsStatusCount.length > 0) {

					const formattedPMList = json.pmLists.map(pmVal => {
						let listIdDetails = json.pmListItemsStatusCount.filter(pmStatusVal => !!pmStatusVal.PM_ITEM_STATUS && pmVal.PM_LIST_ID === pmStatusVal.PM_LIST_ID)



						const totalCount = listIdDetails.reduce(getSum, 0);
						function getSum(total, cur) {
							return total + cur.STATUS_COUNT;
						}

						const compltdCount = listIdDetails
							.filter(cid => !pendingStatus.includes(cid.PM_ITEM_STATUS))
							.reduce(getcompletedSum, 0);
						function getcompletedSum(total, cur) {
							return total + cur.STATUS_COUNT;
						}
						let percentage = 0
						if (pmVal.IS_VENDOR_REQUESTED === "Y" && pmVal.IS_COMPLETED === 'Y')
							percentage = 100
						else
							percentage = totalCount === 0 ? 0 : (compltdCount / totalCount) * 100;
						return Object.assign({}, pmVal, {

							PERCENTAGE: percentage.toFixed(2)
						});



					})
					const newJson = {
						pmLists: formattedPMList.filter(nj => !!nj),
						pmListItemsStatusCount: json.pmListItemsStatusCount,
						pmRefList: json.pmRefList,
						vzReviewPMlists: json.vzReviewPMlists,
						pmListYears: json.pmListYears,
						erpFlag: json.erpFlag
					}

					return newJson;
				}
				else if (json.pmRefList.length > 0 && (json.pmLists.length === 0 || json.pmListItemsStatusCount.length === 0)) {

					return {
						pmLists: [],
						pmListItemsStatusCount: [],
						pmRefList: json.pmRefList,
						vzReviewPmlists: [],
						pmListYears: json.pmListYears,
						erpFlag: json.erpFlag
					}
				}
				else if (Object.keys(json).length === 0 || json.pmLists.length === 0 || json.pmListItemsStatusCount.length === 0) {

					return {
						pmLists: [],
						pmListItemsStatusCount: [],
						pmRefList: [],
						vzReviewPmlists: [],
						pmListYears: [],
						erpFlag: 'N'
					}
				}
				else if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Oops! You are not associated with Verizon at this point. Your company may have been moved or deleted." } });
						case "500":
							return new InternalServerError({ data: { code: 500, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "InternalServerError" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {

					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getPmListDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getPmModelAttDetails(pmType, po_item_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		

		if (pmType && pmType != null) {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getPMTypeTemplateAttributes?pmType=${pmType}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getPMTypeTemplateAttributes?pmType=${pmType}`
			}
		}
		else if (po_item_id && po_item_id != null) {
			if (isOffShore) {
				url = `${config.pmService.baseScruburl}/vppm/getPMTypeTemplateAttributes?poItemId=${po_item_id}`
			} else {
				url = `${config.pmService.baseurl}/vppm/getPMTypeTemplateAttributes?poItemId=${po_item_id}`;
			}

		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		}).then(json => {

			if (typeof json === 'string') {
				return errorHandler(json, "#getPmListDetails");
			}
			//if (json.data && json.sitedetails.site_unid) {
			if (json) {


				return json;
			} else if (json.errors && json.errors.length > 0) {
				switch (json.errors[0].status) {
					case "400":
						return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
					case "500":
						return new InputError({ data: { code: 500, message: `${json.errors[0].detail}` } });
					default:
						return new UnkonwnError({ data: json.errors[0] });
				}
			}
			else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#getPmModelAttDetails");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	getHVACPmModelAttDetails(pmType, unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMInspectionAttributes?pmType=${pmType}&tmpltName=PM_DYNMHVACTEMPALTE&siteUnid=${unid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMInspectionAttributes?pmType=${pmType}&tmpltName=PM_DYNMHVACTEMPALTE&siteUnid=${unid}`
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
					return errorHandler(json, "#getPmListDetails");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {


					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						case "500":
							return new InputError({ data: { code: 500, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getHVACPmModelAttDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCurrentSystemRecordsGen(unids, pmType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getSiteOrSwitchList?pmType=${pmType}&location=SITE&siteUnid=${unids}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getSiteOrSwitchList?pmType=${pmType}&location=SITE&siteUnid=${unids}`
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
					return errorHandler(json, "#getCurrentSystemRecords");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getCurrentSystemRecords");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCurrentSystemRecords(unids, pmType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getSiteOrSwitchList?pmType=${pmType}&location=SITE&siteUnid=${unids}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getSiteOrSwitchList?pmType=${pmType}&location=SITE&siteUnid=${unids}`
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
					return errorHandler(json, "#getCurrentSystemRecords");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getCurrentSystemRecords");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getGO95PoleInfoInsp(pmlistid, listItems) {
		let url = `${config.pmService.baseurl}/vppm/getGO95PoleInspectionData?pmListId=${pmlistid}`


		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getCurrentSystemRecords");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json && json.pmListItems.length > 0) {

					return {
						listItems: listItems.map(val => {
							let matchedObj = json.pmListItems.find(inval => inval.PM_LIST_ITEM_ID == val.PM_LIST_ITEM_ID && inval.PM_LOCATION_UNID == val.PM_LOCATION_UNID)
							let INSP_STATUS = !!matchedObj && matchedObj.INSP_STATUS ? matchedObj.INSP_STATUS : ''

							return Object.assign({}, val, { INSP_STATUS })
						})
					};
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getGO95PoleInfoInsp");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getDraftGridDetails(pmListIds, isGo95, isTower, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMListItems?pmListIds=${pmListIds}&getDataFromPS=${isTower}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMListItems?pmListIds=${pmListIds}&getDataFromPS=${isTower}`
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
					return errorHandler(json, "#getDraftGridDetails");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json.listItems) {
					if (!isGo95) {
						return { listItems: json.listItems };
					}
					else {



						return this.getGO95PoleInfoInsp(pmListIds, json.listItems).then(data => {
							return data;
						})
							.catch(err => {
								logger.debug("#getGO95PoleInfoInsp");
								logger.error(err);
								if (err.code === 'ECONNREFUSED') {
									return new ConnectionRefuse();
								} else {
									return new UnkonwnError();
								}
							});

					}


				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getDraftGridDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getTowerInspItems(pmTypeId, submarket, pmListItemId, unid, pmListId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getAttributesDataForTowerInspection?pmListItemId=${pmListItemId}&submarket=${submarket}&unid=${unid}&pmListId=${pmListId}&pmTypeId=${pmTypeId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getAttributesDataForTowerInspection?pmListItemId=${pmListItemId}&submarket=${submarket}&unid=${unid}&pmListId=${pmListId}&pmTypeId=${pmTypeId}`
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
					return errorHandler(json, "#getTowerInspItems");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getTowerInspItems");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getPmListDetailsByVendorId(vendorId, year, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPmListDetailsForVendorId?vendorId=${vendorId}&year=${year}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPmListDetailsForVendorId?vendorId=${vendorId}&year=${year}`
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
					return errorHandler(json, "#getPmListDetailsByVendorId");
				}
				//if (json.data && json.sitedetails.site_unid) {

				if (json.listItems) {

					return { pmListItemsByMdgId: json.listItems };
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getPmListDetailsByVendorId");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getPmGridDetails(pmListIds, clientreq) {
		//check the isoffshore val from config
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMListItemsForVP?pmListIds=${pmListIds}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMListItemsForVP?pmListIds=${pmListIds}`
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
					return errorHandler(json, "#getPmGridDetails");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json.listItems) {
					let filteredData = { pmlistitems: json.listItems }
					if (isOffShore) {
						let filter = json && json.listItems.length > 0 && gsamUtil.restrictData(json.listItems, ['PM_LOCATION_NAME'])
						filteredData = { pmlistitems: filter }
					}
					return filteredData;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getPmGridDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getGO95PoleInfo(subMarket, poleUnid, pmListItemId, pmListId, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/getAttributesDataForGO95Pole?pmListItemId=${pmListItemId}&submarket=${subMarket}&unid=${poleUnid}&pmListId=${pmListId}`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getGO95PoleInfo");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json && json.output) {
					if (json.output.poleAttributeData.length > 0) {
						json.output.poleAttributeData = json.output.poleAttributeData.map(item => {
							return {
								...item,
								OPSTRCK_INSP_UNID: item.OPSTRACKER_UNID || null
							}
						})
					}
					return json.output;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getGO95PoleInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getAuditDetails(pmListItemId, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/getGO95AuditData?id=${pmListItemId}`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getAuditDetails");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getAuditDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getFileDataForGO95(loginId, unid, name, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/downloadAttachmentFromOpstracker?unid=${unid}&name=${name}`

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
					return errorHandler(json, "#getFileDataForGO95");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getFileDataForGO95");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getBuyerList(loginId, market, submarket, source, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMListDropDownData?market=${market}&submarket=${submarket}&source=${source}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMListDropDownData?market=${market}&submarket=${submarket}&source=${source}`
		}


		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader,
				"IOPUSERID": loginId
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getBuyerList");
				}
				if (json) {

					return { fieldsList: json.fieldsList };
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getBuyerList");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},


	getSyncedSitesInfo(submarket, managerId, pmType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getSyncedSitesInfo?submarket=${submarket}&mgrId=${managerId}&pmType=${pmType}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getSyncedSitesInfo?submarket=${submarket}&mgrId=${managerId}&pmType=${pmType}`
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
					return errorHandler(json, "#getSyncedSitesInfo");
				}
				if (json.siteinfo) {
					return { siteinfo: json.siteinfo };
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getSyncedSitesInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSiteListDetails(market, submarket, managerId, pmType, location, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getSiteOrSwitchList?market=${market}&submarket=${submarket}&mgrId=${managerId}&pmType=${pmType}&location=${location}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getSiteOrSwitchList?market=${market}&submarket=${submarket}&mgrId=${managerId}&pmType=${pmType}&location=${location}`
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
					return errorHandler(json, "#getSiteListDetails");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return { filteredList: json.filteredList };
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getSiteListDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getActiveSites(vendorId, submarket, managerId, poItemIds, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getActiveSites?vendorId=${vendorId}&mgrId=${managerId}&submarket=${submarket}&poItemIds=${poItemIds}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getActiveSites?vendorId=${vendorId}&mgrId=${managerId}&submarket=${submarket}&poItemIds=${poItemIds}`
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
					return errorHandler(json, "#getActiveSites");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json) {

					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getActiveSites");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getExpenseProjIdData(loginId, submarket, managerId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getExpenseProjIdData?submarket=${submarket}&mgrid=${managerId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getExpenseProjIdData?submarket=${submarket}&mgrid=${managerId}`
		}

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
					return errorHandler(json, "#getExpenseProjIdData");
				}
				//if (json.data && json.sitedetails.site_unid) {
				if (json && json.expenseProjIdData) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getExpenseProjIdData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getEventDetails(vendorId, loginId, type, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/opscalendar/event/get?vendorId=${vendorId}&loginId=${loginId}`
			if (type) {
				url = `${config.IopService.baseScruburl}/opscalendar/event/get?vendorId=${vendorId}&loginId=${loginId}&type=${type}`
			}
		} else {
			url = `${config.IopService.baseurl}/opscalendar/event/get?vendorId=${vendorId}&loginId=${loginId}`
			if (type) {
				url = `${config.IopService.baseurl}/opscalendar/event/get?vendorId=${vendorId}&loginId=${loginId}&type=${type}`
			}
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
					return errorHandler(json, "#getEventDetails");
				}
				if (json.data) {
					return json.data;
				}
				else if (json.length > 0 && json[0].title && json[0].title == "Error") {
					return new NoDataFoundError({ data: json });
				} else {
					return new UnkonwnError({ data: json });
				}
			}).catch(err => {
				logger.debug("#getEventDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getElogCommentForInfoId(userId, eloginfoid, fromsystem, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/elog/getElogComment?userid=${userId}&eloginfoid=${eloginfoid}&fromsystem=${fromsystem}`
		} else {
			url = `${config.IopService.baseurl}/elog/getElogComment?userid=${userId}&eloginfoid=${eloginfoid}&fromsystem=${fromsystem}`
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
					return errorHandler(json, "#getElogCommentForInfoId");
				}
				if (json && json.listItems && typeof json.listItems === "string") {
					return { code: "200", listItems: [], message: json.listItems };
				} else if (json && json["listItems"] && json["listItems"].length > 0) {
					return { code: "200", listItems: json["listItems"] };
				} else if (json && json.Error && json.Error.length > 0) {
					const err = json.Error[0];
					if (err.status === 501) {
						return new NotFound({ data: err });
					}
					return new UnkonwnError({ data: err });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getElogCommentForInfoId");
				logger.error(err);

				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getElogForWorkorder(workOrderID, vendor, clientreq) {
		let vendor_name = encodeURIComponent(vendor)
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/elog/getBysubtype?vendor=${vendor_name}&subtype=WORKORDER&subtypeid=${workOrderID}&subtypename=WORKORDER`
		} else {
			url = `${config.IopService.baseurl}/elog/getBysubtype?vendor=${vendor_name}&subtype=WORKORDER&subtypeid=${workOrderID}&subtypename=WORKORDER`
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
					return errorHandler(json, "#getElogForWorkorder");
				}
				if (json && json.listItems && typeof json.listItems === "string") {
					return { code: "200", listItems: [], message: json.listItems };
				} else if (json && json.length > 0 && json[0].listItems) {
					return { code: "200", listItems: json[0].listItems };
				} else if (json && json.Error && json.Error.length > 0) {
					const err = json.Error[0];
					if (err.status === 501) {
						return new NotFound({ data: err });
					}
					return new UnkonwnError({ data: err });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getElogForWorkorder");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getTemplateDataGen(input, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/vppm/pmTemplateDownload`
		} else {
			url = `${config.pmService.baseurl}/vppm/pmTemplateDownload`
		}

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getTemplateData");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					let err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#getTemplateData");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getTemplateData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	issoResetAccount(issoUserId, opstrackerUserId, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/issoResetAccount/${issoUserId}/${opstrackerUserId}`
		return fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#issoResetAccount");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					let err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#issoResetAccount");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#issoResetAccount");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getTemplateData(input, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/pmTemplateDownload`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getTemplateData");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors[0] });
				}
				logger.debug("#getTemplateData");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getTemplateData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	uploadFiles(input, clientreq) {


		let url = `${config.pmService.baseurl}/vppm/uploadAttachment`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#uploadFiles");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors[0] });
				}
				logger.debug("#uploadFiles");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#uploadFiles");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	uploadFilesGO95(input, unid, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/attachFilesForGO95Inspection?unid=${unid}`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#uploadFilesGO95");
				}
				if (Array.isArray(json) && json.length > 0) {
					return { "fileResp": json };
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#uploadFilesGO95");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#uploadFilesGO95");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},

	uploadFilesWO(input, unid, category, clientreq) {


		let url = `${config.pmService.baseurl}/vppm/attachFilesForGO95Inspection?unid=${unid}&category=${category}`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#uploadFilesWO");
				}
				if (Array.isArray(json) && json.length > 0) {
					return { "fileResp": json };
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#uploadFilesWO");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#uploadFilesWO");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},

	submitAttachment(input, lockReqId, clientreq) {
		let url = `${config.pmService.baseurl}/sectorlock/addAttachmentsToLockRequest?id=${lockReqId}`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitAttachment");
				}
				if (json && json.errors === undefined) {
					return json;
				} 
				if (json && json.errors && json.errors.length > 0) {
					let err = json.errors[0];
					return new UnkonwnError({ data: err });
				} 
				logger.debug("#submitAttachment");
				logger.debug(json);
				return new UnkonwnError();
				
			}).catch(err => {
				logger.debug("#submitAttachment");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitNotes(input, lockReqId, clientreq) {

		let url = `${config.pmService.baseurl}/sectorlock/addNotesToLockRequest?id=${lockReqId}`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitNotes");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#submitNotes");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#submitNotes");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitTowerInsp(input, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/insertorUpdateTowerAttributesValues`;
		if (input.updatedData.inspectionSummary[0].EQUIPMENT_TYPE === "POLE") {
			let remDueDateString = input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "GO95_REMEDIATION_DUE_DATE").ATTRIBUTE_VALUE
			let remDueDateCompletedString = input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "GO95_REMEDIATION_COMPLETED_DATE").ATTRIBUTE_VALUE
			let opsTrackerObj = {
				"recordtype": "c2poleinspection",
				"retrieve": "*",
				"retrieveformat": "simple",
				"data": {
					"pole_unid": input.updatedData.inspectionSummary[0].EQUIPMENT_UNID,
					"status": input.updatedData.inspectionSummary[0].INSP_STATUS === "PENDING_DRAFT" ? "saveAsDraft" : "Completed",
					"inspection_type": input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "INSPECTION_TYPE").ATTRIBUTE_VALUE,
					"inspection_date": moment(input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "INSPECTION_DATE").ATTRIBUTE_VALUE, 'MM/DD/YYYY').format('MM/DD/YYYY'),
					"inspector_name": input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "INSPECTOR_NAME").ATTRIBUTE_VALUE,
					"vendor_id": input.updatedData.inspectionSummary[0].VENDOR_ID || "",
					"go95_remediation_required": input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "REMEDIATION_REQUIRED").ATTRIBUTE_VALUE === "Yes" ? 1 : 0,
					"go95_deviation_due_date": remDueDateString ? moment(remDueDateString, 'MM/DD/YYYY').format('MM/DD/YYYY') : "",
					"go95_deviation_resolved_date": remDueDateCompletedString ? moment(remDueDateCompletedString, 'MM/DD/YYYY').format('MM/DD/YYYY') : "",
					"notes": input.updatedData.inspectionDetails.find(item => item.ATTRIBUTE_NAME === "INSPECTION_COMMENTS").ATTRIBUTE_VALUE,
				}
			}
			if (input.updatedData.inspectionSummary[0].OPSTRACKER_UNID === null) {
				input.opsTrackerCreateReqBody = opsTrackerObj;
			} else {
				let updateObj = {
					"meta_universalid": input.updatedData.inspectionSummary[0].OPSTRACKER_UNID,
					...opsTrackerObj
				}
				input.opsTrackerUpdateReqBody = updateObj;
			}
		}

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitInspectionInfo");
				}
				if (json && !json.errors) {
					return json;
				}
				return json && json.errors && json.errors.length > 0 ? new UnkonwnError({ data: json.errors[0] }) : new UnkonwnError();
			}).catch(err => {
				logger.debug("#submitInspectionInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	generateInspPDF(input, type, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/generateInspectionPDF?type=${type}`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#generateInspPDF");
				}
				if (json && !json.errors) {
					return json;
				} 
				return json && json.errors && json.errors.length > 0 ? new UnkonwnError({ data: json.errors[0] }) : new UnkonwnError();
			}).catch(err => {
				logger.debug("#generateInspPDF");
				logger.debug(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitInspectionInfo(input, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/insertGO95AttributesValues`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitInspectionInfo");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#submitInspectionInfo");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#submitInspectionInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	submitPMDetails(input, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/inserPMTypeAttributesValues`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitPMDetails");
				}
				if (json && !json.errors) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#submitPMDetails");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#submitPMDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitFPQuoteInvoice(loginId, input, quoteUnid, quoteAction, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/updateWorkorderQuote?quote_unid=${quoteUnid}&quote_action=${quoteAction}&callingSystem=iopvendorportal`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				logger.info(`#submitFPQuoteInvoiceResponse-- ${JSON.stringify(json)}`)
				if (typeof json === 'string') {
					return errorHandler(json, "#submitFPQuoteInvoice");
				}
				if (json?.woInfo) {
					return json;
				} else if (json?.output?.errors?.length > 0) {
					return new UnkonwnError({ data: json.output.errors });
				} else {
					logger.debug("#submitFPQuoteInvoice");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {

				logger.debug("#submitFPQuoteInvoice");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitLockRequest(input, clientreq) {
		let url = `${config.pmService.baseurl}/sectorlock/createLockRequest`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#submitLockRequest");
				}
				if (json && json.errors.length == 0) {
					return json;
				} else if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				} else {
					logger.debug("#submitLockRequest");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#submitLockRequest");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	updateScheduleDate(input, refName, clientreq) {
		let url = refName === 'updatePM' ? `${config.pmService.baseurl}/vppm/createPMList/${refName}?requestType=saveAsDraft&newPMList=false&poAssigned=false&isFEGroupedPM=false` : `${config.pmService.baseurl}/vppm/createPMList/${refName}?requestType=saveAsDraft&newPMList=true&poAssigned=false&isFEGroupedPM=false`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#createPMList");
				}
				if (json && json.hasOwnProperty('RESULT_MSG')) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					return new UnkonwnError({ data: err });
				}
				logger.debug("#createPMList");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#createPMList");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	createPMList(input, refName, feGrouped, clientreq) {

		let refName1 = refName.split('').map(val => val === ' ' ? val.replace(' ', '_') : val).join('')
		let url = refName1 === 'updatePM' ? `${config.pmService.baseurl}/vppm/createPMList/${refName1}?requestType=saveAsDraft&newPMList=false&poAssigned=false&isFEGroupedPM=${feGrouped}` : `${config.pmService.baseurl}/vppm/createPMList/${refName}?requestType=saveAsDraft&newPMList=true&poAssigned=false&isFEGroupedPM=${feGrouped}`


		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#createPMList");
				}
				if (json && Object.prototype.hasOwnProperty.call(json, 'RESULT_MSG')) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					const err = json.errors[0];
					if (err.status === 400) {
						return new UnkonwnError({ data: err });
					}
					return new UnkonwnError({ data: err });
				}
				logger.debug("#createPMList");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#createPMList");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},


	submitFilesvwrs(loginId, input, clientreq) {
		let url = "";
		if(config.IopService.routeToVWRS == "Y"){
		 url = `${config.IopService.baseurl}/vwrs/${input.quote_unid}/fileupload`
		}else{
			url = `${config.IopService.baseurl}/workorder/${input.quote_unid}/fileupload`
		}
		if (config.IopService.routeToVWRSNative == 'Y') {
			url = `${config.IopService.baseurl}/vwrs/attachments/quote/${input.quote_unid}/upload`
			let filesData = input.files.files.map(file => {
				return {
					name: file.filename,
					size: file.file_size,
					data: file.content.split(',')[1],
					filetype: file.filetype,
					category: file.category,
					last_modified: file.last_modified,
					vendorWorkorderLineItemId: file.vendorWorkorderLineItemId
				}
			});
			input = {"files":{ "files": filesData }}
		}
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input.files),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitFilesvwrs");
				}
				if (json) {
					return json;
				} else {
					return {};
				}
			}).catch(err => {
				logger.debug("#submitFilesvwrs");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},

	checkFastUser(vzid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/user/${vzid}`
		} else {
			url = `${config.IopService.baseurl}/user/${vzid}`
		}


		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			}
		}).then(json => {

			if (json && json.user) {
				return json
			}
			else {
				if (json && json.errors && json.errors.length > 0) {
					return new NotFound({ data: json.errors[0] });
				} else {
					return new UnkonwnError({ data: json });
				}
			}
		})
			.catch(err => {
				logger.debug("#checkFastUser");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getUserIVRDetails(userid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/ivr/user/${userid}/profile`
		} else {
			url = `${config.IopService.baseurl}/ivr/user/${userid}/profile`
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
					return errorHandler(json, "#getUserIVRDetails");
				}
				if (json && json.ivr_profile) {
					return json;
				}
				else if (json.error) {
					return new NotFound({ data: json.error });
				}
				else {
					return new InputError();
				}

			}).catch(err => {
				logger.debug("#getUserIVRDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	siteLogin(input, clientreq) {
		// let userId = clientreq && clientreq && clientreq.session.userdata && clientreq.session.userdata.login_id ? clientreq.session.userdata.login_id : null
		let url = `${config.IopService.baseurl}/ivr/vendor/site/${input.ivr_login.loginId}/login`
		console.log("site login -", url)

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.session.userdata.userid
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#siteLogin");
				}

				if (json && json.ivr_login && json.ivr_login.message) {
					return json;
				} else if (json && json.errors && json.errors.length > 0) {
					let err = json.errors[0];
					if (err && err.status === "504") {
						return new GateWayDown({ data: { code: 504, message: "Backend connection timed out" } });
					}
					if (err && err.status === "400") {
						if (err.detail && err.detail.indexOf("Account Pin Expired") !== -1) {
							return new CustomErr({ data: { code: 400, message: "Your IVR pin is expired. Please call 888-611-0029 with your current IVR PIN to update it" } });
						}
						return new CustomErr({ data: { code: 400, message: err.detail } });
					}
					return new UnkonwnError({ data: { code: 400, message: err && err.detail } });
				} else {
					logger.debug("#siteLogin");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#siteLogin");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	siteLogout(input, clientreq) {
		// let userId = clientreq && clientreq && clientreq.session.userdata && clientreq.session.userdata.login_id ? clientreq.session.userdata.login_id : null
		let url = `${config.IopService.baseurl}/ivr/vendor/site/${input.ivr_logout.loginId}/logout`
		console.log("site logout -", url)

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.session.userdata.userid
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#siteLogout");
				}
				if (json && json.ivr_logout && json.ivr_logout.message) {
					return json;
				} else if (json && json.errors && json.errors.length > 0) {
					let err = json.errors[0];
					if (err && err.status === "400") {
						return new CustomErr({ data: { code: 400, message: err.detail } });
					} else {
						return new UnkonwnError({ data: { code: 400, message: err && err.detail } });
					}
				} else {
					logger.debug("#siteLogout");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#siteLogout");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getIVRLoginReason(clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/ivr/reasons/prepops`
		} else {
			url = `${config.IopService.baseurl}/ivr/reasons/prepops`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.session.userdata.userid
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getIVRLoginReason");
				}
				if (json && json.login_reasons) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors[0] });
				}
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getIVRLoginReason");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitElog(input, clientreq) {
		let url = `${config.IopService.baseurl}/elog/`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization")
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitElog");
				}
				if (json.Data) {
					return {
						code: 200,
						message: input.oprtnType === 'I' ? "Work Request Comment submitted successfully" : "ELog updated successfully",
						eLogInfoId: json.eLogInfoId
					};
				} if (json.Error) {
					if (json.Error.length > 0) {

						let err = json.Error[0];
						switch (err.status) {
							case "400":
								return new CustomErr({ data: { code: 400, message: err.detail } });
							default:
								return new UnkonwnError({ data: { code: 400, message: err.detail } });
						}
					} else {
						logger.debug("#SUBMITELOG");
						logger.debug(json);
						return new UnkonwnError();
					}
				} else {
					return {};
				}
			}).catch(err => {
				logger.debug("#submitElog");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	submitElogComment(input, clientreq) {
		let url = `${config.IopService.baseurl}/elog/comments/`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization")
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitElogComment");
				}
				if (json.Data) {
					return {
						code: 200,
						message: "Work Request Comment submitted successfully",
					};
				} if (json.Error) {
					if (json.Error.length > 0) {

						let err = json.Error[0];
						switch (err.status) {
							case "400":
								return new CustomErr({ data: { code: 400, message: err.detail } });
							case "500":
								return new CustomErr({ data: { code: 500, message: err.detail } });
							default:
								return new UnkonwnError({ data: { code: 400, message: err.detail } });
						}
					} else {
						logger.debug("#SUBMITELOGCOMMENT");
						logger.debug(json);
						return new UnkonwnError();
					}
				} else {
					return {};
				}
			}).catch(err => {
				logger.debug("#submitElogComment");
				logger.error(err);

				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getAlarm(site_unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/alarm/2.0/site/${site_unid}/dashboard/alerts`
		} else {
			url = `${config.IopService.baseurl}/alarm/2.0/site/${site_unid}/dashboard/alerts`
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
					return errorHandler(json, "#getAlarm");
				}
				if (json && json.alarms) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					let status = json.errors[0] && json.errors[0].status;
					if (status === 501 || status === 400) {
						return new NotFound({ data: json.errors[0] });
					} else {
						return new UnkonwnError({ data: json.errors[0] });
					}
				}
				return new InputError();
			}).catch(err => {
				logger.debug("#getAlarm");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	updateWOStatus(loginId, input, clientreq) {

		let url = "";
		if(config.IopService.routeToVWRS == "Y"){
			url = `${config.IopService.baseurl}/vwrs/vendor/updatewo`
		}else{
			url = `${config.IopService.baseurl}/workorder/vendor/updatewo`
		}
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify({ "vendor_wo": input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"IOPUSERID": loginId

			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateWOStatus");
				}
				if (json && json.vendor_wo) {
					return {
						code: 200,
						message: "Vendor Workorder status updated successfully.",
						vendor_wo: json.vendor_wo
					};
				}
				if (json && json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
					let err = json.errors[0];
					switch (err.status) {
						case 400: {
							let name = '';
							if (err.detail && err.detail.indexOf('vendor_status') > -1 && err.detail.indexOf('Required') > -1) {
								name = 'Vendor status';
							} else if (err.detail && err.detail.indexOf('userid') > -1 && err.detail.indexOf('Required') > -1) {
								name = 'User ID';
							} else if (err.detail && err.detail.indexOf('vendor_wo_unid') > -1 && err.detail.indexOf('Required') > -1) {
								name = 'Workorder ID';
							} else if (err.detail && err.detail.indexOf('site_unid') > -1 && err.detail.indexOf('Required') > -1) {
								name = 'Site ID';
							}
							if (name && name.length > 0) {
								return new InputError({ data: { code: 400, message: name + " not found" } });
							} else {
								return new UnkonwnError({ data: err });
							}
						}
						default:
							return new UnkonwnError({ data: err });
					}
				}
				logger.debug("#updateWOStatus");
				logger.debug(json);
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#updateWOStatus");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getWorkTypes(loginId, workType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/workorder/getWoTypes?name=${workType}`
		} else {
			url = `${config.pmService.baseurl}/workorder/getWoTypes?name=${workType}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(data => {

				if (data.data && data.data.WORKORDER_WORKTYPE && data.data.WORKORDER_WORKTYPE.choices) {
					return {
						types: data.data.WORKORDER_WORKTYPE.choices
					}
				} else if (data && data.errors && data.errors.length > 0) {
					let err = data.errors[0];
					return new UnkonwnError({ data: err });
				} else {
					return new UnkonwnError();
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
	getWorkScope(serviceType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/workorder/getWoScope?stype=${serviceType}`
		} else {
			url = `${config.pmService.baseurl}/workorder/getWoScope?stype=${serviceType}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.session.userdata.userid
			},
		})
			.then(data => {
				if (data.data && data.data.scope_of_work) {
					return {
						workScope: data.data.scope_of_work
					}
				} else if (data.data && data.data.scope_of_work === '') {
					return {
						workScope: ''
					}
				}
				else if (data && data.errors && data.errors.length > 0) {
					let err = data.errors[0];
					return new UnkonwnError({ data: err });
				} else {
					return new UnkonwnError();
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

	resendUserActivationInvite(userId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/vppm/resendUserActivationInvite?userId=${userId}`
		} else {
			url = `${config.IopService.baseurl}/vppm/resendUserActivationInvite?userId=${userId}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.session.userdata.userid
			},
		})
			.then(data => {
				if (data && data.emailsSent) {
					return {
						message: 'success: email sent'
					}
				}
				else if (data && data.error && data.error.length > 0) {
					let err = data.error[0];
					return new UnkonwnError({ data: err });
				} else {
					return new UnkonwnError();
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

	updateScheduleRequest(input, clientreq) {
		let url = `${config.IopService.baseurl}/opscalendar/vendor/updateScheduleEvent`
		let newInput={
			"update_schedule_request_input": {
			"newData": {
				"end": input.newData.end,
				"eventId":input.newData.eventId,
				"loginId": input.newData.loginId,
				"workId":input.newData.workId,
				"start": input.newData.start,
				"newcomment":input.newData.newcomment,
				"scheduleExtend":input.newData.scheduleExtend,
				"kirkeId":input.newData.kirkeId,
				"loginName":input.newData.loginName,
				"engineerLogin":input.newData.engineerLogin,
				"status":input.newData.status
			}
		}
		};
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input.newData.kirkeId ? newInput : input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateScheduleRequest");
				}
				if (json && json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
					let err = json.errors[0];
					switch (err.status) {
						case 400: {
							let name = '';
							if (err.detail && err.detail.indexOf('start') > -1 && err.detail.indexOf('mandatory') > -1) {
								name = 'Start field';
							} else if (err.detail && err.detail.indexOf('end') > -1 && err.detail.indexOf('mandatory') > -1) {
								name = 'End field';
							} else if (err.detail && err.detail.indexOf('eventId') > -1 && err.detail.indexOf('mandatory') > -1) {
								name = 'eventId';
							}
							if (name && name.length > 0) {
								return new InputError({ data: { code: 400, message: name + " not found" } });
							} else {
								return new UnkonwnError({ data: err });
							}
						}
						default:
							return new UnkonwnError({ data: err });
					}
				} else if (json && (!json.errors || !Array.isArray(json.errors) || json.errors.length === 0)) {
					return {
						code: 200,
						message: "Schedule info updated successfully!"
					};
				} else {
					logger.debug("#updateScheduleRequest");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#updateScheduleRequest");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getAttachmentsList(loginId, unid, attachment_type, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/workorder/vendor/${unid}/attachments`
		} else {
			if(config.IopService.routeToVWRS == "Y"){
				if (config.IopService.routeToVWRSNative == 'Y') { 
					if(attachment_type == 'workorder') {
						url = `${config.IopService.baseurl}/vwrs/attachments/workorder/${unid}/list`
					} else {
						url = `${config.IopService.baseurl}/vwrs/attachments/quote/${unid}/list`
					}
				} else {
					url = `${config.IopService.baseurl}/vwrs/vendor/${unid}/attachments`
				}
			}else{
				url = `${config.IopService.baseurl}/workorder/vendor/${unid}/attachments`
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
					return errorHandler(json, "#getAttachmentsList");
				}
				if (json) {
					if (config.IopService.routeToVWRSNative == 'Y') {
						return { 'attachments': attachment_type == 'workorder' ? json.attachments : json.data };
					} else {
						return json;
					}
				} if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Attachments not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getAttachmentsList");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	downloadFile(loginId, unid, file_name, attachment_id, category, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		let attachemnt_type = category == 'workorder' ? 'workorder' : 'quote';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/downloadAttachmentFromOpstracker?unid=${unid}&name=${file_name}&attachment_id=${attachment_id}&routeToVWRSNative=${config.IopService.routeToVWRSNative}&attachemnt_type=${attachemnt_type}`
		} else {
			url = `${config.pmService.baseurl}/vppm/downloadAttachmentFromOpstracker?unid=${unid}&name=${file_name}&attachment_id=${attachment_id}&routeToVWRSNative=${config.IopService.routeToVWRSNative}&attachemnt_type=${attachemnt_type}`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": clientreq.get("Authorization"),
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (json.data) {
					return { file_data: json.data, file_name };
				} if (json.message && json.message.length > 0) {
					return new NotFound({ data: { code: 404, message: json.message, errCode: "NOTFOUND" } })
				} else {
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#getAttachmentsList");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	downloadVSFile(file_Id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/opscalendar/getAttachment?eventFileID=${file_Id}&src=vp`
		} else {
			url = `${config.IopService.baseurl}/opscalendar/getAttachment?eventFileID=${file_Id}&src=vp`
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
					return errorHandler(json, "#downloadVSAttachment");
				}
				if (json.file_data) {
					return json;
				} if (json.Error && json.Error.length > 0) {
					return new NotFound({ data: { code: 404, message: json.Error, errCode: "NOTFOUND" } })
				} else {
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#downloadVSAttachment");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	submitWORequest: async function (loginId,input, clientreq) {
		let url = ""
		if(config.IopService.routeToVWRS == "Y"){
			url = `${config.IopService.baseurl}/vwrs/vendor/submit/worequest`
		}else{
			url = `${config.IopService.baseurl}/workorder/vendor/submit/worequest`
		}			 
		let data = new worequest(input);
		let meta_universalid = null;
		let saveWo = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ data }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader,
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitWORequest");
				}
				if (json?.fields?.workorder_id) {
					meta_universalid = json.fields.meta_universalid;
					return {
						code: 200,
						message: `Vendor Work Request Submited Successfully VWRS #${json.fields.workorder_id}`,
						workorder_id: json.fields.workorder_id,
						quote_unid: json.fields.approved_quoteid || json.fields.cfd_workorder_quote_id_1
					};
				}
				const code = json?.code || json?.resultcode;
				const message = json?.resultmessage;
				if (code) {
					switch (code) {
						case 404:
							return new NotFound({ data: { code: 400, message } });
						case 502:
							return new GateWayDown({ data: { code: 400, message } });
						case 400:
							return new InputError({ data: { code: 400, message } });
						case 500:
							return new CustomErr({ data: { code: 400, message } });
						case 4901:
							return new UnkonwnError({ data: { code: 400, message } });
						default:
							return new UnkonwnError({ data: { code: 400, message } });
					}
				}
				return new UnkonwnError({ data: json });
			}).catch(err => {
				logger.debug("#submitWORequest");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		if (input.files && input.files.length > 0 && meta_universalid) {
			let fileApiInputs = {
				files: input.files,
				quote_unid: meta_universalid
			}
			return this.submitFilesvwrs(loginId, fileApiInputs, clientreq).then(data => {
				if (data) {
					return saveWo;
				} else {
					return data;
				}
			})
		} else {
			return saveWo;
		}
	},
	downloadLockUnlockAttachment(file_Id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/downloadAttachment?id=${file_Id}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/downloadAttachment?id=${file_Id}`
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
					return errorHandler(json, "#downloadLockUnlockAttachment");
				}
				if (json.attachmentData) {
					return json;
				} if (json.Error && json.Error.length > 0) {
					return new NotFound({ data: { code: 404, message: json.Error, errCode: "NOTFOUND" } })
				} else {
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#downloadLockUnlockAttachment");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	downloadElogFile(file_Id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/elog/getAttachment?elogAttachID=${file_Id}&src=vp`
		} else {
			url = `${config.IopService.baseurl}/elog/getAttachment?elogAttachID=${file_Id}&src=vp`
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
					return errorHandler(json, "#downloadElogAttachment");
				}
				if (json.file_data) {
					return json;
				} if (json.Error && json.Error.length > 0) {
					return new NotFound({ data: { code: 404, message: json.Error, errCode: "NOTFOUND" } })
				} else {
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#downloadElogAttachment");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	submitScheduleRequest: async function (input, clientreq) {
		let url = `${config.IopService.baseurl}/opscalendar/event/create`
		let data = new schedulerequest(input);
		let submitSchedule = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#submitScheduleRequest");
				}
				//if (json.fields && json.fields.workorder_id) {
				if (json && json.status && json.status == "200") {
					return {
						code: 200,
						message: "Schedule created successfully!",
						autoCreatedKirkeRequestID : json && json.autoCreatedKirkeRequestID
					};

				} else {
					if (json && json.length>0) {
						switch (json[0].status) {
							case 400:
								return new UnkonwnError({ data: { code: 400, message: json[0].detail } });
							case 502:
								return new GateWayDown({ data: { code: 400, message: json[0].detail } });
							case 404:
								return new InputError({ data: { code: 400, message: json[0].detail} });
							case 500:
								return new CustomErr({ data: { code: 400, message: json[0].detail } });
							default:
								return new UnkonwnError({ data: { code: 400, message: json[0].detail} });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#submitScheduleRequest");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		return submitSchedule;
	},
	getTechBySubmarket(site_region, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/contact/users/${site_region}/submarket`
		} else {
			url = `${config.IopService.baseurl}/contact/users/${site_region}/submarket`
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization")
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getSitesBySubmarket");
			}
			if (json.users) {
				json.users = json.users.filter((tech) => {return tech.role && ['TECHNICIAN', 'TECH', 'SWITCH_TECHNICIAN', 'MANAGER', 'SWITCH_MANAGER', 'CELL_SWITCH_MANAGER'].includes(tech.role.toUpperCase())})
				return json;
			} else if (json.code && json.code === 500) {
				return new UnkonwnError({ data: json });
			} else if (json.errors && json.errors.length > 0) {
				switch (json.errors[0].status) {
					case "400":
						return new InputError({ data: { code: 400, message: "Tech not found" } });
					default:
						return new UnkonwnError({ data: json.errors[0] });
				}

			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#getSitesBySubmarket");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});


	},
	getGeneratorInfoForUnid(unid, type, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			if (type && type == 'SITE')
				url = `${config.IopService.baseScruburl}/emis/site/${unid}/generator`
			else if (type && type == 'SWITCH')
				url = `${config.IopService.baseScruburl}/emis/switch/${unid}/generator`
		} else {
			if (type && type == 'SITE')
				url = `${config.IopService.baseurl}/emis/site/${unid}/generator`
			else if (type && type == 'SWITCH')
				url = `${config.IopService.baseurl}/emis/switch/${unid}/generator`
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
					return errorHandler(json, "#getGeneratorInfoForUnid");
				}
				if (json?.generators && typeof json.generators === "string") {
					return { code: "200", generators: [], message: json.generators };
				} else if (json?.generators && json.generators.length >= 0) {
					return { code: "200", generators: json.generators };
				} else if (json?.Error?.length > 0) {
					const err = json.Error[0];
					if (err.status === 501) {
						return new NotFound({ data: err });
					}
					return new UnkonwnError({ data: err });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getGeneratorInfoForUnid");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getHvacInfoForUnid(unid, type, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			if (type && type == 'SITE')
				url = `${config.IopService.baseScruburl}/emis/site/${unid}/hvac`
			else if (type && type == 'SWITCH')
				url = `${config.IopService.baseScruburl}/emis/switch/${unid}/hvac`
		} else {
			if (type && type == 'SITE')
				url = `${config.IopService.baseurl}/emis/site/${unid}/hvac`
			else if (type && type == 'SWITCH')
				url = `${config.IopService.baseurl}/emis/switch/${unid}/hvac`
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
					return errorHandler(json, "#getHvacInfoForUnid");
				}
				if (json && json["hvacs"] && typeof json["hvacs"] === "string") {
					let response = { code: "200", hvacs: [], message: json["hvacs"] };
					return response;
				} else if (json && json["hvacs"] && json["hvacs"].length >= 0) {
					let response = { code: "200", hvacs: json["hvacs"] };
					return response;
				} else if (json && json["errors"] && json["errors"].length > 0) {
					switch (json["errors"][0].status) {
						case 501:
							return new NotFound({ data: json.Error[0] });
						default:
							return new UnkonwnError({ data: json.Error[0] });
					}
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getHvacInfoForUnid");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getManagersForSubmarket(submarket, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/contact/submarket/${submarket}/managers`
		} else {
			url = `${config.IopService.baseurl}/contact/submarket/${submarket}/managers`
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
					return errorHandler(json, "#getManagersForSubmarket");
				}
				if (json && json["users"] && typeof json["users"] === "string") {
					let response = { code: "200", users: [], message: json["users"] };
					return response;
				} else if (json && json["users"] && json["users"].length >= 0) {
					let response = { code: "200", users: json["users"] };
					return response;
				} else if (json && json["errors"] && json["errors"].length > 0) {
					switch (json["errors"][0].status) {
						case 404:
							return new NotFound({ data: json["errors"][0].detail });
						default:
							return new UnkonwnError({ data: json["errors"][0].detail });
					}
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getManagersForSubmarket");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getVendorDomains(userId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getVendorDomains?user_id=${userId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getVendorDomains?user_id=${userId}`
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
					return errorHandler(json, "#getVendorDomains");
				}
				if (json && json.userId) {
					return json;
				} else {
					if (json && json.errors && json.errors[0].status) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors[0] });
							case 502:
								return new GateWayDown({ data: json.errors[0] });
							case 500:
								return new CustomErr({ data: json.errors[0] });
							default:
								return new UnkonwnError({ data: json.errors[0] });
						}
					} else {
						return new CustomErr({ data: { status: 500, detail: "Oops! Vendor domains cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getVendorDomains");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	logAction(user_id, email, vendor_id, workorder_id, market, sub_market, action, action_name, action_option, osw_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/logAction?user_id=${user_id}&email=${email}&vendor_id=${vendor_id}&workorder_id=${workorder_id}&market=${market}&sub_market=${sub_market}&action=${action}&action_name=${action_name}&action_option=${action_option}&osw_id=${osw_id}`
		} else {
			url = `${config.pmService.baseurl}/vppm/logAction?user_id=${user_id}&email=${email}&vendor_id=${vendor_id}&workorder_id=${workorder_id}&market=${market}&sub_market=${sub_market}&action=${action}&action_name=${action_name}&action_option=${action_option}&osw_id=${osw_id}`
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
					return errorHandler(json, "#logAction");
				}
				// If logAction exists, return it, else return an error
				if (json && json.logAction) {
					return json;
				} else if (json && json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors[0] });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#logAction");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getVendorTechForVendorId(login, vendorId, clientreq) {
		let url = `${config.IvrService.baseurl}/tech/getTechsByVendorId`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"login": login,
				"vendorId": vendorId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getVendorTechForVendorId");
				}
				if (json.resultcode == 0) {
					let ivrData = [];
					for (let i = 0; i < json.data.length; i++) {
						ivrData.push(json.data[i])
					}
					let response = { code: "200", data: ivrData, message: json.resultmessage };
					return response;
				} else if (json.resultcode == 2 || json.resultcode == 1) {
					let response = { code: "404", data: [], message: json.resultmessage };
					return response;
				} else if (json.error) {
					return new NotFound({ data: json.error });
				}
				else {
					return new InputError();
				}

			}).catch(err => {
				logger.debug("#getVendorTechForVendorId");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCurrentPinByUserId(login, userId, clientreq) {
		let url = `${config.IvrService.baseurl}/tech/getCurrentIVRPinByUserId`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"login": login,
				"userId": userId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getCurrentPinByUserId");
				}
				if (json.resultcode == 0) {
					let response = { code: "200", message: json.resultmessage };
					return response;
				} else if (json.error) {
					return new NotFound({ message: json.error });
				}
				else {
					return new InputError();
				}

			}).catch(err => {
				logger.debug("#getCurrentPinByUserId");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	createUpdIvrUser(input, clientreq) {
		let url = `${config.IvrService.baseurl}/tech/createUpdateIVRUser`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"login": input.login
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#createUpdIvrUser");
			}
			if (json.ReturnCode == 0 || json.ReturnCode == 202 || json.ReturnCode == 201) {
				let response = { code: "200", techId: json.TechId, message: json.ReturnMsg };
				return response;
			} else if (typeof json.error === "string") {
				let response = { code: "500", techId: null, message: json.error };
				return response;
			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#createUpdIvrUser");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	createUpdVendorCompany(input, clientreq) {
		let url = `${config.IvrService.baseurl}/companies/createUpdateVendorCompany`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"login": input.login
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#createUpdVendorCompany");
			}
			if (json && json.error && typeof json.error === "string") {
				let response = {}
				if (json.error.includes("ORA-12899"))
					response = { code: "500", message: "Company name too long" };
				else response = { code: "500", message: json.error };
				return response;
			} else if (json.returnCode == 201 || json.returnCode == 200) {
				let response = { code: "200", message: json.returnMsg };
				return response;
			} else if (json.returnCode != 201 || json.returnCode != 200) {
				let response = { code: "500", message: json.returnMsg };
				return response;
			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#createUpdVendorCompany");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	delIvrTechUser(login, userId, clientreq) {
		let url = `${config.IvrService.baseurl}/tech/deleteIVRUser`

		return fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": clientreq.get("Authorization"),
				"login": login,
				"userId": userId
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#delIvrTechUser");
			}
			if (json && json.text && typeof json.text === "string") {
				let response = { code: "200", message: json.text };
				return response;
			} else if (json && json.error && typeof json.error === "string") {
				let response = { code: "500", message: json.error };
				return response;
			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#delIvrTechUser");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	ivrEmailNotification(input, clientreq) {
		logger.info('Email Subject - ', (input.subject ? input.subject : null), ' Email Recipients', (input.recipients && input.recipients.length > 0 ? input.recipients : null))

		let url = `${config.OnpService.baseurl}/emailNotification/send`
		if (input && input.recipients && config.devRecipients && config.devRecipients.emails) {
			input.recipients = config.devRecipients.emails
		}
		let emails = [];
		input.recipients.forEach((email) => {
			emails.push(...email.split(/[,;]/).filter(em => em.length > 0));
		});
		input.recipients = emails;
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.OnpService.token
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#ivrEmailNotification");
			}
			let frstrecipient1 = input.recipients[0]
			if (input.recipients && input.recipients.length > 0) {
				if (Object.keys(json).length == input.recipients.length) {
					let response = { code: "200", message: "Email Delivered" };
					return response;
				} else {
					let response = { code: "500", message: "Email Not Delivered" };
					return response;
				}

			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#ivrEmailNotification");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	updateMultipleMarketIvr(input, clientreq) {

		let url = `${config.IvrService.baseurl}/ivr/vendor/assignVendorTech`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader,
				"login": input.login
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateMultipleMarketIvr");
				}
				if (json.returnCode == 201) {
					let response = { code: "200", message: json.returnMsg };
					return response;
				} else if (typeof json.error === "string") {
					let response = { code: "500", message: json.error };
					return response;
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#updateMultipleMarketIvr");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getGenTanknfoForUnid(unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/site/${unid}/genInfo`
		} else {
			url = `${config.IopService.baseurl}/site/${unid}/genInfo`
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
					return errorHandler(json, "#getGenTanknfoForUnid");
				}
				if (json && json["generators"] && typeof json["generators"] === "string") {
					return { code: "200", genTank: [], message: json["generators"] };
				} else if (json && json["generators"] && json["generators"].length >= 0) {
					return { code: "200", genTank: json["generators"] };
				} else if (json && json.Error && json.Error.length > 0) {
					const err = json.Error[0];
					if (err.status === 501) {
						return new NotFound({ data: err });
					}
					return new UnkonwnError({ data: err });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getGenTanknfoForUnid");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	submitGenReadings(input, clientreq) {
		let url = `${config.IopService.baseurl}/site/genUpdate/genReadings`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#submitGenReadings");
				}
				if (json["error"] != undefined) {
					let response = { code: "500", message: json["error"] };
					return response;
				} else if (json["error"] == undefined) {
					let response = { code: "200", message: "Generator Readings updated successfully" };
					return response;
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#submitGenReadings");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSpectrumResult(request_id, clientreq){
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getspectrumresult/${request_id}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getspectrumresult/${request_id}`
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
					return errorHandler(json, "#getSpectrumResult");
				}
				console.log("getSpectrumResult", json);
				if (json && json.spectrum_result) {
					return json;
				}
				if (json && json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case 501:
							return new NotFound({ data: json.errors[0] });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getSpectrumResult");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSpectrumDownload(request_id, clientreq){
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/downloadSpectrumResult/${request_id}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/downloadSpectrumResult/${request_id}`
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
					return errorHandler(json, "#getSpectrumDownload");
				}
				if (json) {
					return { download: json };
				}
				if (json && json.errors && json.errors.length > 0) {
					let status = json.errors[0] && json.errors[0].status;
					if (status === 501) {
						return new NotFound({ data: json.errors[0] });
					} else {
						return new UnkonwnError({ data: json.errors[0] });
					}
				}
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getSpectrumDownload");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSpectrumHistory(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getSpectrumReportAnalysis/${siteunid}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getSpectrumReportAnalysis/${siteunid}`
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
					return errorHandler(json, "#getSpectrumHistory");
				}
				if (json && json.spectrum_requests) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case 501:
							return new NotFound({ data: json.errors[0] });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				}
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getSpectrumHistory");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSiteSectorCarriers(siteunid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getSiteSectorCarriers/${siteunid}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getSiteSectorCarriers/${siteunid}`
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
					return errorHandler(json, "#getSiteSectorCarriers");
				}
				if (json && json.nodes) {
					return json;
				}
				if (json && json.errors && json.errors.length > 0) {
					let status = json.errors[0] && json.errors[0].status;
					if (status === 501) {
						return new NotFound({ data: json.errors[0] });
					} else {
						return new UnkonwnError({ data: json.errors[0] });
					}
				}
				return new UnkonwnError();
			}).catch(err => {
				logger.debug("#getSiteSectorCarriers");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	createSpectrumAnalyzer(input, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/createSpectrumAnalyser`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/createSpectrumAnalyser`
		}

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#createSpectrumAnalyzer");
				}
				if(json){
					return json;
				}  else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#createSpectrumAnalyzer");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	formatSectorInfoResponse(responses) {
		let combinedSectors = []
		responses.forEach(item1 => {
			if (item1 && item1.enodeb_sector_info && item1.enodeb_sector_info.sectors && item1.enodeb_sector_info.sectors.length > 0) {
				item1.enodeb_sector_info.sectors.forEach(item2 => {
					if (typeof item2 == "object" && Object.keys(item2).length > 0) {
						combinedSectors.push({
							...item2,
							enodeb_id: item1.enodeb_sector_info.enodeb_id,
							vendor: item1.enodeb_sector_info.vendor,
							radio_units: item1.enodeb_sector_info.radio_units,
							cell_status: item1.enodeb_sector_info.cell_status,
							cell_list: item1.enodeb_sector_info.cell_list
						})
					} else {
						combinedSectors.push({
							sector: "NA",
							lock_status: "",
							enodeb_id: item1.enodeb_sector_info.enodeb_id,
							vendor: item1.enodeb_sector_info.vendor,
							radio_units: item1.enodeb_sector_info.radio_units,
							cell_status: item1.enodeb_sector_info.cell_status,
							cell_list: item1.enodeb_sector_info.cell_list
						})
					}
				})
			} else {
				combinedSectors.push({
					sector: "NA",
					lock_status: "",
					enodeb_id: item1 && item1.enodeb_sector_info ? item1.enodeb_sector_info.enodeb_id : "",
					vendor: item1 && item1.enodeb_sector_info ? item1.enodeb_sector_info.vendor : "",
					radio_units: item1 && item1.enodeb_sector_info ? item1.enodeb_sector_info.radio_units : "",
					cell_status: item1 && item1.enodeb_sector_info ? item1.enodeb_sector_info.cell_status : "",
					cell_list: item1 && item1.enodeb_sector_info ? item1.enodeb_sector_info.cell_list : ""
				})
			}
		})
		return combinedSectors;
	},
	async getSectorInfo(enodeb_id, site_unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getSectorInfo?enodeb=${enodeb_id}&site_unid=${site_unid}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getSectorInfo?enodeb=${enodeb_id}&site_unid=${site_unid}`
		}

		console.log("URL--", url)
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getSectorInfo");
			}
			if (json) {	
				logger.info("#getSectorInfo Response--", json);
				return { "enodeb_sector_info": json };
			} else if (json?.Error?.length > 0) {
				const err = json.Error[0];
				if (err?.status === 501) {
					return new NotFound({ data: err });
				}
				return new UnkonwnError({ data: err });
			} else {
				return new NoDataFoundError();
			}
		}).catch(err => {
			logger.debug("#getSectorInfo");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},

	getSwitchesBySubmarket(switch_region, clientreq) {
		if (switch_region) {
			switch_region = encodeURIComponent(switch_region)
			let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
				&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
			let url = '';
			if (isOffShore) {
				url = `${config.IopService.baseScruburl}/switch/submarket/${switch_region}`
			} else {
				url = `${config.IopService.baseurl}/switch/submarket/${switch_region}`
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
						return errorHandler(json, "#getSwitchesBySubmarket");
					}
					if (json.switches) {
						return { switches: json.switches };
					} if (json.errors && json.errors.length > 0) {
						switch (json.errors[0].status) {
							case "400":
								return new InputError({ data: { code: 400, message: "switches not found" } });
							default:
								return new UnkonwnError({ data: json.errors[0] });
						}

					} else {
						return new InputError();
					}
				}).catch(err => {
					logger.debug("#getSwitchesBySubmarket");
					logger.error(err);
					if (err.code === 'ECONNREFUSED') {
						return new ConnectionRefuse();
					} else {
						return new UnkonwnError();
					}
				});

		} else {
			return new InputError({ data: { code: 400, message: "Switches not found" } });
		}

	},
	getSitesBySubmarket(site_region, clientreq) {
		//check the isoffshore val from config
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		if (site_region) {
			site_region = encodeURIComponent(site_region)
			let url = '';
			if (isOffShore) {
				url = `${config.IopService.baseScruburl}/site/submarket/${site_region}/planner`
			} else {
				url = `${config.IopService.baseurl}/site/submarket/${site_region}/planner`
			}
			let promise1 = fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					"Accept": "application/json",
					"Authorization": clientreq.get("Authorization")
				},
			}).then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getSitesBySubmarket");
				}
				if (json.sites) {
					//filtering gsam data
					let filteredData = json;

					if (isOffShore) {
						let obj = json.sites && json.sites.length > 0 && gsamUtil.restrictData(json.sites, ['site_name'])
						let output = { sites: [...obj], techs: json.techs }
						filteredData = output;
					}

					return filteredData;
				} if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "sites not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getSitesBySubmarket");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
			//let input = { market: data.sitedetails.area, submarket: data.sitedetails.region };
			let promise2 = this.getTechBySubmarket(site_region, clientreq)
			return Promise.all([promise1, promise2]).then((values) => {
				if (values[0] && !values[0].sites) {
					return values[0];
				} else if (values[1] && !values[1].users) {
					return values[1];
				} else {
					return {
						sites: values[0].sites,
						techs: values[1].users
					}
				}
			})
		} else {
			return new InputError({ data: { code: 400, message: "sites not found" } });
		}

	},

	getLockData(lockReqId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/sectorlock/getLockData?id=${lockReqId}`
		} else {
			url = `${config.pmService.baseurl}/sectorlock/getLockData?id=${lockReqId}`
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
					return errorHandler(json, "#getLockData");
				}
				if (json) {



					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Please give valid input" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getLockData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getRecentActivity(userId, clientreq) {
		//check the isoffshore val from config
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/recentActivity/${userId}`
		} else {
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
					//filtering gsam data
					let filteredData = json;

					if (isOffShore) {
						let filter = json && json.recent_activities && json.recent_activities.length > 0 && gsamUtil.restrictData(json.recent_activities, ['SITE_NAME'])
						filteredData = { recent_activities: [...filter] }
					}

					return filteredData;
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
	getCreateListSites(vendorId, year, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getExistingPMlistItemsToCreatePMlist?vendorId=${vendorId}&year=${year}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getExistingPMlistItemsToCreatePMlist?vendorId=${vendorId}&year=${year}`
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
					return errorHandler(json, "#getCreateListSites");
				}
				else if (json && json.listItems) {



					return json;
				}
				else if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "sites not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getSearchedSites");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getFixedPricingExistServ(loginId, unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
		let url1 = '';
		if (isOffShore) {
			url1 = `${config.pmService.baseScruburl}/vppm/getExistingWorkOrder?unid=${unid}`
		} else {
			url1 = `${config.pmService.baseurl}/vppm/getExistingWorkOrder?unid=${unid}`
		}

		let url2 = '';
		if (isOffShore) {
			url2 = `${config.pmService.baseScruburl}/workorder/getWoTypes?name=WORKORDER_WORKTYPE`
		} else {
			url2 = `${config.pmService.baseurl}/workorder/getWoTypes?name=WORKORDER_WORKTYPE`
		}

		let promise1 = fetch(url1, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getSitesBySubmarket");
				}
				if (json) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "sites not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getFixedPricingExistServ");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		let promise2 = fetch(url2, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getSitesBySubmarket");
				}
				if (json && json.data) {
					return json.data;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "sites not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getFixedPricingExistServ");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
		return Promise.all([promise1, promise2]).then((values) => {
			if (values[0] && values[1] && values[1].WORKORDER_WORKTYPE && values[1].WORKORDER_WORKTYPE.choices) {
				let result1 = values[0]
				let result2 = values[1].WORKORDER_WORKTYPE

				return { ...result1, ...result2 }
			}
		})
	},
	getIssues(unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		// Both branches use the same URL, so we can simplify:
		url = `${config.IopService.baseurl}/site/${unid}/qissues/details`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getIssues");
				}
				if (json) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json.errors });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! Issue list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getIssues");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getProblemData(problemType, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/restype?problemType=${problemType}`
		} else {
			url = `${config.pmService.baseurl}/vppm/restype?problemType=${problemType}`
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
					return errorHandler(json, "#getProblemData");
				}
				if (json && json.resolution_type) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json.errors });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! Issue list cannot be loaded. Please retry." } });
					}

				}
			}).catch(err => {
				logger.debug("#getProblemData");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	saveFavoriteSubMarket: (input) => {
		let url = `${config.pmService.baseurl}/vppm/saveFavoriteSubMarket`
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
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
			logger.debug("#saveFavoriteSubMarket");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	updateUserStatus: (input) => {
		let url = `${config.pmService.baseurl}/vppm/updateUserStatus`
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json => {
			if (json.message) {
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
			logger.debug("#updateUserStatus");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	updateLockStatus: (input, lockReqId) => {
		let url = `${config.pmService.baseurl}/sectorlock/updateLockStatus?lockReqId=${lockReqId}`
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (json && json.iopUpdate) {
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
			logger.debug("#updateLockStatus");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},

	updateManualOswReason: (input, lockReqId) => {
		console.log('input for manual osw', input, lockReqId)
		let url = `${config.IopService.baseurl}/fastdashboard/manualoswreason/${lockReqId}`
		let payload={
			'manualoswrsn': input.manualoswrsn,
			'manualoswrsn_comments': input.manualoswrsn_comments,
			'user_id': null
		}
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify(payload),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			console.log('json of manual osw', json)
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
			logger.debug("#updateManualOswReason");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},

	createLockUnlock : (input, siteUnid) => {
		// unique by enodeb id and sector name
		let enodebs = uniqBy(input.ENODEB_ID)
		let sectorNames = uniqBy(input.SECTOR)
		input.ENODEB_ID = enodebs;
		input.SECTOR = sectorNames;
		let url = `${config.pmService.baseurl}/sectorlock/createLock/?siteUnid=${siteUnid}`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (json && json.iopResponse) {
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
			logger.debug("#createLockUnlock");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	unlockSector: (input, siteUnid) => {
		let url = `${config.pmService.baseurl}/sectorlock/sectorUnlock/?siteUnid=${siteUnid}`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (json && json.iopResponse) {
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
			logger.debug("#unlockSector");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	updateResolution(unid, input, clientreq) {
		let url = `${config.IopService.baseurl}/sitequality/updatevwrs/${unid}/qissue`;
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateResolution");
				}
				if (json) {
					return json;
				}
			}).catch(err => {
				logger.debug("#updateResolution");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	updateAccessRestrictions(loginId, fuzeSiteId, unid, input, clientreq) {
		let userid = loginId
		let url = `${config.pmService.baseurl}/vppm/accessRestriction?unid=${unid}&userid=${userid}`
		if(config.IopService.replaceOPSAPITOIOP == 'Y'){
			url = `${config.IopService.baseurl}/sitenest/iop/api/fuze/${fuzeSiteId}/access`
		}
		return fetch(url, {
			method: config.IopService.replaceOPSAPITOIOP == 'Y' ? 'POST' : 'PUT',
			body: config.IopService.replaceOPSAPITOIOP == 'Y' ? JSON.stringify({"restriction": input.data.RESTRICTION}) : JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateAccessRestrictions");
				}
				if(config.IopService.replaceOPSAPITOIOP == 'Y') {
					let output = {}
        			let resArray = new Array();
					resArray.push({ result_message: json.fuze_response.message, result: json })
                    output.updated_access_restriction = resArray
					return output
				}
				if (json && json.updated_access_restriction) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].code) {
							case 404:
								return new NotFound({ data: json.errors[0].result_message });
							case 502:
								return new GateWayDown({ data: json.errors[0].result_message });
							case 400:
								return new InputError({ data: json.errors[0].result_message });
							case 500:
								return new CustomErr({ data: json.errors[0].result_message });
							default:
								return new UnkonwnError({ data: json.errors[0].result_message });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#updateAccessRestrictions");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	updateVendorStatus(loginId, input, quoteId, status, clientreq) {
		let userid = loginId;
		let url = `${config.pmService.baseurl}/workorder/updateQuoteStatus?quoteId=${quoteId}&userid=${userid}&status=${status}`;
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
					return errorHandler(json, "#updateVendorStatus");
				}
				if (json && json.woInfo) {
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
				logger.debug("#updateVendorStatus");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	updateVendorStatusComments(input, clientreq) {
		let url = `${config.pmService.baseurl}/workorder/updateVendorWorkOrder`;
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify({ "vendor_wo": input }),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateVendorStatusComments");
				}
				if (json && json.vendor_wo) {
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
				logger.debug("#updateVendorStatusComments");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	resetIvrPin(input, clientreq) {
		let url = `${config.IopService.baseurl}/ivr/resetpin`;
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
					return errorHandler(json, "#resetIvrPin");
				}
				if (json) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].code) {
							case 404:
								return new NotFound({ data: json.errors[0].result_message });
							case 502:
								return new GateWayDown({ data: json.errors[0].result_message });
							case 400:
								return new InputError({ data: json.errors[0].result_message });
							case 500:
								return new CustomErr({ data: json.errors[0].result_message });
							default:
								return new UnkonwnError({ data: json.errors[0].result_message });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#resetIvrPin");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	hvacInfoToOpstracker(unid, input, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/passHvacInfoToOpstracker?unid=${unid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/passHvacInfoToOpstracker?unid=${unid}`
		}

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
					return errorHandler(json, "#passHvacInfoToOpstracker");
				}
				if (json && json.updatedData) {
					return json;
				} else {
					if (json && json.errors) {
						switch (json.errors[0].code) {
							case 404:
								return new NotFound({ data: json.errors[0].result_message });
							case 502:
								return new GateWayDown({ data: json.errors[0].result_message });
							case 400:
								return new InputError({ data: json.errors[0].result_message });
							case 500:
								return new CustomErr({ data: json.errors[0].result_message });
							default:
								return new UnkonwnError({ data: json.errors[0].result_message });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#passHvacInfoToOpstracker");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},


	getFixedPricingServ(loginId, market, submarket, national, listname, worktype, costtype, sitetype, fixed, nonfixed, zipcode, matrix, nonmatrix, matrixeligible, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getFixedPriceMatrixList?market=${market}&submarket=${submarket}&national=${national}&worktype=${worktype}&costtype=${costtype}&sitetype=${sitetype}&fixed=${fixed}&nonfixed=${nonfixed}&zipcode=${zipcode}&matrixeligible=${matrixeligible}&nonmatrix=${nonmatrix}&matrix=${matrix}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getFixedPriceMatrixList?market=${market}&submarket=${submarket}&national=${national}&worktype=${worktype}&costtype=${costtype}&sitetype=${sitetype}&fixed=${fixed}&nonfixed=${nonfixed}&zipcode=${zipcode}&matrixeligible=${matrixeligible}&nonmatrix=${nonmatrix}&matrix=${matrix}`
		}

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
					return errorHandler(json, "#getSitesBySubmarket");
				}
				if (json) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "sites not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getFixedPricingServ");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getSearchedSites(vendorId, search, year, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getPMListItemsForVPSearch?vendorId=${vendorId}&search=${search}&year=${year}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getPMListItemsForVPSearch?vendorId=${vendorId}&search=${search}&year=${year}`
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
					return errorHandler(json, "#getSitesBySubmarket");
				}
				if (json) {
					const newJsonList = json.listItems.map(li => {
						return Object.assign({}, li, {
							PM_ITEM_DUE_DATE: !!li.PM_ITEM_DUE_DATE ? moment(li.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : '',
							PM_ITEM_COMPLETED_DATE: !!li.PM_ITEM_COMPLETED_DATE ? moment(li.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : '',
							LAST_UPDATED_DATE: !!li.LAST_UPDATED_DATE ? moment(li.LAST_UPDATED_DATE).format('MM/DD/YYYY') : '',
							PO_NUM: !!li.PO_NUM ? li.PO_NUM : '',
							SITE_ID: !!li.SITE_ID ? li.SITE_ID : '',
							PM_LIST_NAME: !!li.PM_LIST_NAME ? li.PM_LIST_NAME : '',
							PM_LOCATION_NAME: !!li.PM_LOCATION_NAME ? li.PM_LOCATION_NAME : '',
							PM_ITEM_STATUS: !!li.PM_ITEM_STATUS ? li.PM_ITEM_STATUS : '',
							COMPLETED_BY: !!li.COMPLETED_BY ? li.COMPLETED_BY : '',
							COMMENTS: !!li.COMMENTS ? li.COMMENTS : '',
						})
					})


					return { searchResults: newJsonList };
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "sites not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getSearchedSites");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},


	//******************************************RAPS APIS*********************************************//

	getProjects(latitude, longitude, proximity, user_id, gnodeb_id, sector_id, du_id) {

		let url;
		if (user_id === "")
			url = `${config.IopService.iopProjectServiceUrl}/siteintegration/raps/projects?latitude=${latitude}&longitude=${longitude}&proximity=${proximity}`
		else
			url = `${config.IopService.iopProjectServiceUrl}/siteintegration/raps/user/projects?user_id=${user_id}`

		if (gnodeb_id) {
			url = `${config.IopService.iopProjectServiceUrl}/siteintegration/raps/projects?gnodeb_id=${gnodeb_id}&sector_id=${sector_id}&du_id=${du_id}`
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
					return errorHandler(json, "#getProjectRAPS");
				}
				if (json && json.projects) {
					return json;
				} else {
					if (json && json.Header && json.Header.respCode) {
						switch (json.Header.respCode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			})
			.catch(err => {
				logger.error("#getProjectRAPS");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getProjectsBySubMarket(submarket, project_name) {

		let url = `${config.IopService.iopProjectServiceUrl}/siteintegration/raps/projectsBySubmarket?submarket=${submarket}&project_name=${project_name}`


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
					return errorHandler(json, "#getProjectBySubMarketRAPS");
				}
				if (json && json.projects) {
					return json;
				} else {
					if (json && json.Header && json.Header.respCode) {
						switch (json.Header.respCode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			})
			.catch(err => {
				logger.error("#getProjectBySubMarketRAPS");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	updateEquipment: (input) => {
		let url = `${config.IopService.iopProjectServiceUrl}/siteintegration/raps/equipment/info`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#validateEquipmentRAPS");
				}
				if (json.data.updateEquipment.result_message && json.data.updateEquipment.result_code === 0) {
					return json.data.updateEquipment;
				} else {
					if (json && json.result_message && json.result_code) {
						switch (json.Header.respCode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#validateEquipmentRAPS");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getNokeDeviceInfo: (input) => {
		let url = `${config.IopService.baseurl}/ivr/noke/lookup`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#validateNokeLockLookUp");
				}
				if (json.result === "success" && json.error_code === 0) {
					return json;
				} else {
					if (json && json.result && json.error_code) {
						switch (json.Header.respCode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#validateNokeLockLookUp");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getNokeCommands: (input) => {
		let url = `${config.IopService.baseurl}/ivr/noke/unlock`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#validategetNokeCommands");
				}
				if (json.result === "success" && json.error_code === 0) {
					return json;
				} else {
					if (json && json.errors.length) {
						switch (json.errors[0].status) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#validategetNokeCommands");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	IVRProfileInfo(login) {
		let url = `${config.IopService.baseurl}/ivr/profile/` + login
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
					return errorHandler(json, "#getIVRProfileInfo");
				}
				if (json && json.projects) {
					return json;
				} else {
					if (json && json.Header && json.Header.respCode) {
						switch (json.Header.respCode) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			})
			.catch(err => {
				logger.error("#getIVRProfileInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getEquipmentFormat() {
		let url = `${config.IopService.iopProjectServiceUrl}/siteintegration/raps/equipmentFormat`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"Authorization": config.app.authHeader
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getEquipmentFormat");
			}
			if (json) {
				return json;
			} else {
				if (json && json.Header && json.Header.respCode) {
					switch (json.Header.respCode) {
						case 404:
							return new NotFound({ data: json });
						case 502:
							return new GateWayDown({ data: json });
						case 400:
							return new InputError({ data: json });
						case 500:
							return new CustomErr({ data: json });
						default:
							return new UnkonwnError({ data: json });
					}
				} else {
					return new UnkonwnError({ data: json });
				}
			}
		})
			.catch(err => {
				logger.error("#getEquipmentFormat");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getCountyListForSubMarket(subMarket, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/getCountyListForSubMarket?subMarket=${subMarket}`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getSitesBySubmarket");
			}
			if (json) {
				return json
			}
			if (json.errors && json.errors.length > 0) {

				switch (json.errors[0].status) {
					case "400":
						return new InputError({ data: { code: 400, message: "sites not found" } });
					default:
						return new UnkonwnError({ data: json.errors[0] });
				}

			} else {
				return new InputError();
			}
		})
			.catch(err => {

				logger.debug("#getCountyListForSubMarket");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	updateSiteEquipmentInfo(input, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/updateSiteInfoData`

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'

			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#updateSiteEquipmentInfo");
			}
			if (json) {
				return json
			}
			if (json.errors && json.errors.length > 0) {

				switch (json.errors[0].status) {
					case "400":
						return new InputError({ data: { code: 400, message: "Unfortunate update" } });
					default:
						return new UnkonwnError({ data: json.errors[0] });
				}

			} else {
				return new InputError();
			}
		})
			.catch(err => {

				logger.debug("#updateSiteEquipmentInfo");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	submitIssueReport(input, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/submitIssueReport`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'
			},
		}).then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#submitIssueReport");
			}
			if (json && json.status) {
				return json
			}
			if (json.errors && json.errors.length > 0) {
				return new UnkonwnError({ data: json.errors[0] });
			} else {
				return new InputError();
			}
		}).catch(err => {
			logger.debug("#submitIssueReport");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
	//*******************************Nest Evaluation*******************************************

	getNestEvaluationQs(vendorId, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getQuestionairesList?vendorId=${vendorId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getQuestionairesList?vendorId=${vendorId}`
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
					return errorHandler(json, "#getNestEvaluationQs");
				}
				if (json && json.data) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "data not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				} else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#getNestEvaluationQs");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getAttachmentContent(unid, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';
		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getAttachmentContent?unid=${unid}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getAttachmentContent?unid=${unid}`
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
					return errorHandler(json, "#getAttachmentContent");
				}
				if (json && json.data) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "data not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#getAttachmentContent");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getNestModelDetails(unid, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/getQuestionaireDetails?unid=${unid}`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getNestModelDetails");
				}
				if (json && json.data) {



					return json;
				}
				if (json.errors && json.errors.length > 0) {

					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "data not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getNestModelDetails");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	getAttachmentsListOpsTracker(unid, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/getAttachmentsListFromOpstracker?unid=${unid}`
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
					return errorHandler(json, "#getAttachmentsListOpsTracker");
				}
				if (json.attachmentsList) {
					return json;
				} if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Attachments not found" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}

				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getAttachmentsListOpsTracker");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	updateQuestionnaireAttachments(loginId, input, siteUnid, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/updateQuestionnaireAttachments?siteUnid=${siteUnid}`
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateQuestionnaire");
				}
				if (json && json.data && json.data.message) {
					return {
						code: 200,
						message: json.data.message,
						data: json.data
					};
				} else {
					if (json && json.code) {
						switch (json.code) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#updateQuestionnaire");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	updateQuestionnaire(loginId, input, siteUnid, clientreq) {
		let url = `${config.pmService.baseurl}/vppm/updateQuestionnaire?siteUnid=${siteUnid}`
		return fetch(url, {
			method: 'PUT',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": loginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#updateQuestionnaire");
				}
				if (json && json.data && json.data.message) {
					return {
						code: 200,
						message: json.data.message,
						data: json.data
					};
				} else {
					if (json && json.code) {
						switch (json.code) {
							case 404:
								return new NotFound({ data: json });
							case 502:
								return new GateWayDown({ data: json });
							case 400:
								return new InputError({ data: json });
							case 500:
								return new CustomErr({ data: json });
							default:
								return new UnkonwnError({ data: json });
						}
					} else {
						return new UnkonwnError({ data: json });
					}
				}
			}).catch(err => {
				logger.debug("#updateQuestionnaire");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});;
	},
	validatePONum(poId, submarket, psLocId, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/validatePONum?poId=${poId}&submarket=${submarket}&psLocId=${psLocId}`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#validatePONum");
				}
				if (json && json.po_info && json.po_info.length > 0) {
					return { po_info: "valid" };
				}
				if (json.errors && json.errors.length > 0) {

					return { po_info: json.errors[0].detail }
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

				logger.debug("#validatePONum");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getVendorsListEsso(market, submarket, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getVendors?market=${market}&submarket=${submarket}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getVendors?market=${market}&submarket=${submarket}`
		}
		if (config.IopService.vendorManagementAPITOIOP == "Y") {
			url = `${config.IopService.baseurl}/vendor-management/vendors/area/${encodeURIComponent(market)}/market/${encodeURIComponent(submarket)}`;
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
					return errorHandler(json, "#getVendorsListEsso");
				}
				if (config.IopService.vendorManagementAPITOIOP == "Y") {
					let { data } = json;
					if (data.length > 0) {
						let output = data.map(obj => {
							return {
								peoplesoft_id: obj.peoplesoftId,
								phone: obj.phone,
								service_email: obj.serviceEmail,
								vendor_category: obj.vendorCategory,
								vendor_id: obj.vendorId,
								vendor_name: obj.vendorName,
								vendor_portal: obj.vendorPortal,
								vendor_sponsor_id: obj.vendorSponsorId,
								meta_universalid: obj.metaUniversalId
							}
						});
						return { "vendors": output};
					}

					if (json && json.errors) {
						let code = json.errors[0].code ? json.errors[0].code : json.errors[0].status;
						if (typeof code === 'string') {
							code = parseInt(code)
						}
						switch (code) {
							case 404:
								return new NotFound({ data: json.errors });
							case 502:
								return new GateWayDown({ data: json.errors });
							case 500:
								return new CustomErr({ data: json.errors });
							default:
								return new UnkonwnError({ data: json.errors });
						}
					} else {
						return new CustomErr({ data: { code: 500, message: "Oops! Data cannot be loaded. Please retry." } });
					}
				} else {
					if (json && json.vendors && json.vendors.length > 0) {
						return json;
					}
					if (json.errors && json.errors.length > 0) {
						return json.errors
					} else {
						return new InputError();
					}
				}
			})
			.catch(err => {

				logger.debug("#getVendorsListEsso");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getMarketListEsso(clientreq) {

		let url = `${config.pmService.baseurl}/vppm/getMarketRefData`

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#getMarketListEsso");
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
	getVendorUserAuth(vendorEmail, clientreq) {

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getExistingLinkedUsers?vendor_email=${vendorEmail}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getExistingLinkedUsers?vendor_email=${vendorEmail}`
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
					return errorHandler(json, "#getVendorUserAuth");
				}
				if (json && json.output) {
					let newUsers = json.output.users.filter(i => i.LINK_STATUS && i.LINK_STATUS == 'Y')
					let newJson = {
						...json,
						output: {
							...json.output,
							users: newUsers
						}
					}
					return newJson;
				}
				if (json.errors && json.errors.length > 0) {

					return json.errors


				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getVendorUserAuth");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	unLinkVendor(id, name, clientreq) {

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/unLinkVendor?id=${id}&last_updated_by=${name}`
		} else {
			url = `${config.pmService.baseurl}/vppm/unLinkVendor?id=${id}&last_updated_by=${name}`
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
					return errorHandler(json, "#unLinkVendor");
				}
				if (json && json.output) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {

					return json.errors


				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#unLinkVendor");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getUserInfoLinked(vendorEmail, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getUserInfo?emailId=${vendorEmail}&skipCheck=Y`
		} else {
			url = `${config.pmService.baseurl}/vppm/getUserInfo?emailId=${vendorEmail}&skipCheck=Y`
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
					return errorHandler(json, "#getUserInfoLinked");
				}
				if (json && json.userinfo) {
					return json;
				}
				if (json.error && json.error.length > 0) {
					// if(json.error[0].detail && json.error[0].detail.includes('Error getting vendor user profile, either invite expired or user not registered.')){
					return json.error[0]

					// else{
					// 	return json.errors
					// } 



				}
			})
			.catch(err => {
				logger.debug("#getUserInfoLinked");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getUserInfoVendorLinked(vendorId, clientreq) {

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/vppm/getExistingLinkedUsers?vendor_id=${vendorId}`
		} else {
			url = `${config.pmService.baseurl}/vppm/getExistingLinkedUsers?vendor_id=${vendorId}`
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
					return errorHandler(json, "#getUserInfoVendorLinked");
				}
				if (json && json.output) {
					let newUsers = json.output.users.filter(i => i.LINK_STATUS && i.LINK_STATUS == 'Y')
					let newJson = {
						...json,
						output: {
							...json.output,
							users: newUsers
						}
					}
					return newJson;

				}
				if (json.errors && json.errors.length > 0) {

					return json.errors


				} else {
					return new InputError();
				}
			})
			.catch(err => {

				logger.debug("#getUserInfoVendorLinked");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	linkExistingVendorToNewCompany(input, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/linkExistingVendorToNewCompany`


		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#linkExistingVendorToNewCompany");
				}
				if (json && json.output && !json.output.error) {
					return json;
				} else if (json && json.output && json.output.error) {
					let err = json.output.error[0];
					if (err.status === 400) {
						return new UnkonwnError({ data: err });
					}
					return new UnkonwnError({ data: err });
				} else {
					logger.debug("#linkExistingVendorToNewCompany");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {

				logger.debug("#linkExistingVendorToNewCompany");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	//C-Band Submission
	saveDeviceToEnodeb(input, clientreq) {

		let url = `${config.pmService.baseurl}/vppm/saveDeviceToEnodeB`


		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then(json => {

				if (typeof json === 'string') {
					return errorHandler(json, "#saveDeviceToEnodeb");
				}
				if (json && json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
					let err = json.errors[0];
					if (err.status === 400) {
						return new UnkonwnError({ data: err });
					}
					return new UnkonwnError({ data: err });
				} else if (json) {
					return json;
				} else {
					logger.debug("#saveDeviceToEnodeb");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {

				logger.debug("#saveDeviceToEnodeb");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},
	getOSWAutoReplyMessagesByUnid(siteUnid, clientreq) {
		let url = `${config.pmService.baseurl}/sectorlock/getOSWAutoReplyMessagesByUnid/${siteUnid}`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
		.then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getOSWAutoReplyMessagesByUnid");
			}
			if (json) {
					return json;
				}
				if (json.errors && json.errors.length > 0) {
					switch (json.errors[0].status) {
						case "400":
							return new InputError({ data: { code: 400, message: "Please give valid input" } });
						default:
							return new UnkonwnError({ data: json.errors[0] });
					}
				} else {
					return new InputError();
				}
			})
			.catch(err => {
				logger.debug("#getOSWAutoReplyMessagesByUnid");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getWorkOrderDistanceDetails:(siteUnid, userId, clientreq) => {
        let url = `${config.pmService.baseurl}/workorder/workOrderDefaultDetails?siteUnid=${siteUnid}&userId=${userId}`
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
                    return errorHandler(json, "#createWODistanceDetails");
            }
             if (json && json.hasOwnProperty('createWODistanceDetails')) {
                return json;}
                else if (json.errors && json.errors.length > 0) {
                    return new UnkonwnError({ data: json.errors });
        }
            }).catch(err => {
                logger.debug("#createWODistanceDetails");
                logger.error(err);
                if (err.code === 'ECONNREFUSED') {
                    return new ConnectionRefuse();
                } else {
                    return new UnkonwnError();
                }
            });;
    },
	getMetroRootSchedules:(caId) => {
		let url = `${config.IopService.baseurl}/fastdashboard/root/vendor/events/metrorootschedules?caIds=${caId}`
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json"
			},
		})
		.then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getMetroRootSchedules");
			}
			if (json?.schedules) {
				return json.schedules;
			} else {
				return json;
			}
			})
			.catch(err => {
				logger.debug("#getMetroRootSchedules");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getRadioInfo: (siteUnid) => {
		let url = config.IopService.baseurl+ '/site/' + siteUnid + '/radio';
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		})
		.then(json => {
			if (typeof json === 'string') {
				return errorHandler(json, "#getRadioInfo");
			}
			if(json.error){
				return new NoDataFoundError();

			}
			if (json.radioInfo) {
				return {radioInfo : Object.values(json.radioInfo).flat()};
			} else {
				return new NoDataFoundError();
			}
		}).catch(err => {
			logger.debug("#getRadioInfo");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		});
	},
}

module.exports = apis


function errorHandler(data, key) {
	logger.debug("#key");
	logger.debug(data);
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
}

let processDataForUser = async function (wolist, schedules) {
	let o = {
		"requested": {
			"Pending Approval": { name: "Pending VZ Approval", data: [], color: "--status-color-blue", woType: [] },
			"DA Acknowledgement Pending": { name: "DA Acknowledge Pending", data: [], color: "--status-color-orange", woType: [] }
		},
		"quote": {
			"Quote Pending": { name: "Quote Pending", data: [], color: "--status-color-orange", woType: [] },
			"Quote Received": { name: "Quote Received", data: [], color: "--status-color-blue", woType: [] },
			"Awaiting PO": { name: "Awaiting PO", data: [], color: "--status-color-blue", woType: [] },
		},
		"work": {
			"Work Pending Unscheduled": { name: "Work Pending Unscheduled", data: [], color: "--status-color-red", woType: [] },
			"Work Pending Scheduled": { name: "Work Pending Scheduled", data: [], color: "--status-color-orange", woType: [] },
			"Work Pending": { name: "Work Pending", data: [], color: "--status-color-orange", woType: [] },
			"Work Completed": { name: "Work Completed", data: [], color: "--status-color-green", woType: [] },
			"Work Accepted": { name: "Work Accepted", data: [], color: "--status-color-green", woType: [] },
			"Work Declined": { name: "Work Declined", data: [], color: "--status-color-yellow", woType: [] },
			"Work Cancelled": { name: "Work Cancelled", data: [], color: "--status-color-blue", woType: [] }
		},
		"mdurequested": {
			"Pending Approval": { name: "Pending VZ Approval", data: [], color: "--status-color-blue", woType: [] },
			"DA Acknowledgement Pending": { name: "DA Acknowledge Pending", data: [], color: "--status-color-orange", woType: [] }
		},
		"mduquote": {
			"Quote Pending": { name: "Quote Pending", data: [], color: "--status-color-orange", woType: [] },
			"Quote Received": { name: "Quote Received", data: [], color: "--status-color-blue", woType: [] },
			"Awaiting PO": { name: "Awaiting PO", data: [], color: "--status-color-blue", woType: [] },
		},
		"mduwork": {
			"Work Pending": { name: "Work Pending", data: [], color: "--status-color-orange", woType: [] },
			"Work Pending Unscheduled": { name: "Work Pending Unscheduled", data: [], color: "--status-color-red", woType: [] },
			"Work Pending Scheduled": { name: "Work Pending Scheduled", data: [], color: "--status-color-orange", woType: [] },
			"Work Completed": { name: "Work Completed", data: [], color: "--status-color-green", woType: [] },
			"Work Accepted": { name: "Work Accepted", data: [], color: "--status-color-green", woType: [] },
			"Work Declined": { name: "Work Declined", data: [], color: "--status-color-yellow", woType: [] },
			"Work Cancelled": { name: "Work Cancelled", data: [], color: "--status-color-blue", woType: [] }
		},
		"rma": {
			"Shipped": { name: "Shipped", data: [], color: "--status-color-orange", woType: [] },
			"Delivered": { name: "Delivered", data: [], color: "--status-color-blue", woType: [] },
			"Received & Installed": { name: "Received & Installed", data: [], color: "--status-color-orange", woType: [] },
			"Returned": { name: "Returned", data: [], color: "--status-color-red", woType: [] },
			"Closed": { name: "Closed", data: [], color: "--status-color-green", woType: [] }
		},
		"history": {
			name: "History",
			data: [],
			woType: []
		}
	}
	let filteredList = [];
	let WorkType = {};
	for (let wo = 0; wo < wolist.length; wo++) {
		let workorder = wolist[wo]
		
		let declineCount = 0;
		if (workorder.quoteitems && workorder.quoteitems.length > 0) {
			const declineHistoryJsonString = workorder.quoteitems[0].decline_history_json  
			if (declineHistoryJsonString) {
			  try {
				const declineHistoryArray = JSON.parse(declineHistoryJsonString);
				if (Array.isArray(declineHistoryArray)) {
				  declineCount = declineHistoryArray.length;
				}
			  } catch (e) {
				declineCount = 0; 
			  }
			}
		}
		workorder.quote_decline_count = declineCount;

		const id = workorder.workorder_id;
		const vendor_status = workorder.vendor_status ? workorder.vendor_status : "";
		const quote_status = workorder.quote_statuses;
		const work_status = workorder.workorder_status;
		const wo_type = workorder.site_type;
		const work_type = workorder.work_type;
		const priority = workorder.priority;

		const status = getVendorStatus(work_status, quote_status, vendor_status, work_type, priority);
		if (status) {
			workorder.vendor_portal_status = status
			if(status == "Work Pending"){
				let eventsArr = [];
				for(let i = 0; i < schedules.length; i ++){
					if(schedules[i].workId == id){
						eventsArr.push(schedules[i]);
					}
				}
				workorder.events = eventsArr;
			}
			filteredList.push(workorder)
			WorkType[workorder.work_type] = workorder.work_type;
			if(work_type.toLowerCase() == 'mdu'){
				if (o.mduquote[status]) {
					o.mduquote[status].data.push(id)
					o.mduquote[status].woType.push(wo_type)
				} else if (o.mduwork[status]) {
					o.mduwork[status].data.push(id)
					o.mduwork[status].woType.push(wo_type)
				} else if (o.mdurequested[status]) {
					o.mdurequested[status].data.push(id)
					o.mdurequested[status].woType.push(wo_type)
					
				}
			}else{
				if (o.quote[status]) {
					o.quote[status].data.push(id)
					o.quote[status].woType.push(wo_type)
				} else if (o.work[status]) {
					o.work[status].data.push(id)
					o.work[status].woType.push(wo_type)
				} else if (o.requested[status]) {
					o.requested[status].data.push(id)
					o.requested[status].woType.push(wo_type)
				}
			}

		}

	}
	let pendingWOsForRma = o.work['Work Pending'].data?.join(',') || ''
	let rmaData = await fetchRmaForWoIds(pendingWOsForRma)
	rmaData.forEach(rma => {
		if(rma?.STATUS?.toLowerCase() === "shipped"){
			o.rma["Shipped"].data.push(rma.RMA_DETAILS_ID)
		} else if(rma?.STATUS?.toLowerCase() === "delivered"){
			o.rma["Delivered"].data.push(rma.RMA_DETAILS_ID)
		} else if (rma?.STATUS?.toLowerCase() === "received") {
			o.rma["Received & Installed"].data.push(rma.RMA_DETAILS_ID)
		} else if (rma?.STATUS?.toLowerCase() === "installed") {
			o.rma["Received & Installed"].data.push(rma.RMA_DETAILS_ID)
		} else if (rma?.STATUS?.toLowerCase() === "returned") {
			o.rma["Returned"].data.push(rma.RMA_DETAILS_ID)
		} else if (rma?.STATUS?.toLowerCase() === "closed") {
			o.rma["Closed"].data.push(rma.RMA_DETAILS_ID)
		}
	})
	let result = { filteredList: filteredList, panData: { requested: _.values(o.requested), quote: _.values(o.quote), work: _.values(o.work), mdurequested: _.values(o.mdurequested), mduquote: _.values(o.mduquote), mduwork: _.values(o.mduwork), rma: _.values(o.rma), history: [o.history] }, WorkType: [], rma_data: rmaData }
	let orderedWorkType = Object.keys(WorkType).sort((a, b) => a.localeCompare(b));
	orderedWorkType.push(orderedWorkType.splice(orderedWorkType.indexOf("Other"), 1)[0])
	orderedWorkType.forEach(i => {
		result.WorkType.push({ value: i, label: i })
	});
	return result;
}
let processDataForAdmin = function (wolist) {

	let o = {
		quote_pending: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		},
		quote_approved: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		},
		work_accepted: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": [],
			'completedOnTime': 0,
			'overDueCompleted': 0,
			'totalAmount': 0,
			'month': {}
		},
		completed: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": [],
			'completedOnTime': 0,
			'overDueCompleted': 0,
			'totalAmount': 0,
			'month': {}
		},
		work_pending: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		},
		quote_received: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		},
		po_requested: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		},
		awaiting_po: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		},
		adhoc: {
			"sites": [],
			"workorder": [],
			"dueToday": [],
			"overDue": [],
			"dueThisWeek": []
		}
	}

	let sites = {};

	for (let i = wolist.length - 1; i >= 0; i--) {
		let wo = wolist[i];
		let siteId = wo.site_unid;
		let siteName = wo.site_name;
		let status = getStatus(wo.quote_statuses, wo.workorder_status);
		let key = '';
		let dueDate = (wo.work_due_date && wo.work_due_date.length > 0) ? moment(wo.work_due_date, "YYYY-MM-DD hh:mm:ss").endOf('day') : null;
		let quoteDueDate = (wo.work_award_date && wo.work_award_date.length > 0) ? moment(wo.work_award_date, "YYYY-MM-DD hh:mm:ss").endOf('day') : null;
		let completedDate = (wo.work_completed_date && wo.work_completed_date.length > 0) ? moment(wo.work_completed_date, "YYYY-MM-DD hh:mm:ss") : null;


		switch (status) {
			case STATUS_QUOTEPENDING:
				key = "quote_pending";
				break;
			case STATUS_QUOTERECEIVED:
				key = "quote_received";
				break;
			case STATUS_QUOTEAPPROVED:
				key = "quote_approved";
				break;
			case STATUS_POREQUESTED:
				key = "po_requested";
				break;
			case STATUS_WORKPENDING:
				key = "work_pending";
				break;
			case STATUS_WORKCOMPLETED:
				key = "work_completed"
				break;
			case STATUS_WORKACCEPTED:
				key = "work_accepted";
				break;
			case STATUS_COMPLETED:
				key = "completed";
				break;
			case STATUS_AWAITING_PO:
				key = "awaiting_po";
				break;
		}

		let today = moment();

		if (key === 'work_pending' && dueDate) {
			if (dueDate.format('YYYY-MM-DD') === today.format("YYYY-MM-DD")) {
				o[key].dueToday.push(wo.workorder_id);
			}
			if (dueDate < today) {
				o[key].overDue.push(wo.workorder_id);
			}
			if (today < dueDate && dueDate <= today.add(7, 'days')) {
				o[key].dueThisWeek.push(wo.workorder_id);
			}
		} else if (key === 'quote_pending' && quoteDueDate) {
			if (quoteDueDate.format('YYYY-MM-DD') === today.format("YYYY-MM-DD")) {
				o[key].dueToday.push(wo.workorder_id);
			}
			if (quoteDueDate < today) {
				o[key].overDue.push(wo.workorder_id);
			}
			if (today < quoteDueDate && quoteDueDate <= today.add(7, 'days')) {
				o[key].dueThisWeek.push(wo.workorder_id);
			}
		} else if (completedDate && (key === 'completed' || key === 'work_accepted')) {
			if (wo.quoteitems && wo.quoteitems.length > 0 && wo.quoteitems[0].actual_total.length) {
				let total = parseFloat(wo.quoteitems[0].actual_total);
				o[key].totalAmount += total;
				let mon = completedDate.format('YYYY-MM');
				if (!o[key].month[mon])
					o[key].month[mon] = 0;
				o[key].month[mon] += total;

			}

			if (dueDate && dueDate < completedDate) {
				o[key].overDueCompleted++;
			} else {
				o[key].completedOnTime++;
			}
		}

		if (key) {
			if (!sites[key]) {
				sites[key] = {};
			}

			if (!sites[key][siteId]) {
				sites[key][siteId] = {
					name: siteName,
					workorder: []
				}
			}

			sites[key][siteId].workorder.push(wo.workorder_id);
			o[key].workorder.push(wo.workorder_id);
		} else {
			o["adhoc"].workorder.push(wo.workorder_id);
		}

	}


	let months = [];

	for (let mon in o['completed'].month) {
		months.push({ month: mon, cost: o['completed'].month[mon] })
	}
	o['completed'].month = months;

	months = [];

	for (let mon in o['work_accepted'].month) {
		months.push({ month: mon, cost: o['work_accepted'].month[mon] })
	}
	o['work_accepted'].month = months;

	for (let key in sites) {
		for (let siteId in sites[key]) {
			o[key].sites.push({
				name: sites[key][siteId].name,
				workorder: sites[key][siteId].workorder
			})
		}

	}


	return o;

}

let fetchRmaForWoIds = async function (woId) {
	if (!woId || woId.trim() === '') return [];
	let query = `SELECT r.*,
            CASE 
                WHEN r.s4_forward_disposition IN ('FSL', 'DC') AND r.status='DELIVERED' THEN 
                    (SELECT MAX(created_on) FROM rma_status_audit WHERE rma_details_id=r.rma_details_id AND iop_status='DELIVERED')
                WHEN r.s4_forward_disposition='OEM_AE' AND r.status='DELIVERED' THEN 
                    (SELECT MAX(created_on) FROM rma_status_audit WHERE rma_details_id=r.rma_details_id AND iop_status='Shipped')
                ELSE NULL
            END as lastBusinessDay
        FROM rma_details r 
        WHERE r.status IN ('Shipped', 'DELIVERED', 'Closed', 'Received', 'Installed', 'RETURN DELIVERED') AND r.vwrs_id IN (${woId})`
	let url = `${config.IopService.baseurl}/db/get`;
	let args = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: { query } })
	};

	try {
		let response = await fetch(url, args);
		if (response?.result) {
			return response.result;
		}
		return [];
	} catch (err) {
		return [];
	}
}


