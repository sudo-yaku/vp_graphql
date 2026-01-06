import { ConnectionRefuse, UnkonwnError, InputError, GateWayDown, NotFound, CustomErr, InternalServerError, UnAuthorized, NoDataFoundError } from '../data/errors'
import _, { uniqBy } from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')

export const apis = {
  getRmaPartCodes: (text, clientreq) => {
		let isOffShore = 
		(clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore :
			 false;

		let url = '';

		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/dashboard/rma/partcode/search/${text}`
		} else {
			url = `${config.IopService.baseurl}/dashboard/rma/partcode/search/${text}`
		}
		logger.info(`#getRmaPartCodes - ${url}`)
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json =>{
			if (typeof json === 'string') {
				return errorHandler(json, "#getRmaPartCodes");
			}
			if (json) {
				return json;
			}
			else if (json.errors && json.errors.length > 0) {
				return new UnkonwnError({ data: json.errors });
			}
		}).catch (err => {
			logger.debug("#getRmaPartCodes");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		})
	},

  getRmaPrepops: (site_unid, manager_id, clientreq) => {
		let isOffShore = 
		(clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore :
			 false;

		let url = '';

		if (isOffShore) {
			url = `${config.IopService.baseScruburl}/dashboard/rma/${manager_id}/prepops?site_unid=${site_unid}`
		} else {
			url = `${config.IopService.baseurl}/dashboard/rma/${manager_id}/prepops?site_unid=${site_unid}`
		}
		logger.info(`#getRmaPrepops - ${url}`)
		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
			},
		}).then(json =>{
			if (typeof json === 'string') {
				return errorHandler(json, "#getRmaPrepops");
			}
			if (json) {
				return json;
			}
			else if (json.errors && json.errors.length > 0) {
				return new UnkonwnError({ data: json.errors });
			}
		}).catch (err => {
			logger.debug("#getRmaPrepops");
			logger.error(err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError();
			}
		})
	},

  createDraftRMA:(manager_id, input) => {
    let url = `${config.IopService.baseurl}/dashboard/vendor/${manager_id}/rma`
		logger.info(`#createDraftRMA - ${url}`)
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
        return errorHandler(json, "#createDraftRMA");
      }
      if (json.errors && json.errors.length > 0) {
        return new UnkonwnError({ data: json.errors });
      } else if (json) {
        return json;
      }
    }).catch(err => {
      logger.debug("#createDraftRMA");
      logger.error(err);
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new UnkonwnError();
      }
    })
  },

  resubmitRMA:(rmaId, input) => {
    let url = `${config.IopService.baseurl}/dashboard/vendor/resubmit/${rmaId}/rma`
    logger.info(`#resubmitRMA - ${url}`)
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
        return errorHandler(json, "#resubmitRMA");
      }
      if (json.errors && json.errors.length > 0) {
        return new UnkonwnError({ data: json.errors });
      } else if (json) {
        return json;
      }
    }).catch(err => {
      logger.debug("#resubmitRMA Error");
      logger.error(err);
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new UnkonwnError();
      }
    })
  },
  
  getDefectiveSerialNumber: (site_unid, partcode, clientreq) => {
    let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
      && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;
  
    let url = '';
  
    if (isOffShore) {
      url = `${config.IopService.baseScruburl}/dashboard/rma/serialNumber?site_unid=${site_unid}&partcode=${partcode}`
    } else {
      url = `${config.IopService.baseurl}/dashboard/rma/serialNumber?site_unid=${site_unid}&partcode=${partcode}`
    }
  
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json =>{
      if (typeof json === 'string') {
        return errorHandler(json, "#getDefectiveSerialNumber");
      }
      if (json) {
        return json;
      }
      else if (json.errors && json.errors.length > 0) {
        return new UnkonwnError({ data: json.errors });
      }
    }).catch (err => {
      logger.debug("#getDefectiveSerialNumber");
      logger.error(err);
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new UnkonwnError();
      }
    })
  },

  getRMAInformation(vwrs_id, rma_id, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/workorder/getRMAInformation?vwrs_id=${vwrs_id}&rma_id=${rma_id}`
		} else {
			url = `${config.pmService.baseurl}/workorder/getRMAInformation?vwrs_id=${vwrs_id}&rma_id=${rma_id}`
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
					// return errorHandler(json, "#getRMAInformation");
				}
				if (json && json.result) {
					return json;
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getRMAInformation");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

  getRMADetails(vendorID, clientreq) {
		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			url = `${config.pmService.baseScruburl}/workorder/getRMADetails/${vendorID}`
		} else {
			url = `${config.pmService.baseurl}/workorder/getRMADetails/${vendorID}`
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
					// return errorHandler(json, "#getRMAInformation");
				}
				logger.info(`#getRMADetails Response-- ${JSON.stringify(json)}`)
				if (json && json.data) {
					return json;
				} else if (json.message) {
					return ({ data: [] });
				} else if (json.errors) {
					return new UnkonwnError({ data: json.errors });
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getRMAInformation");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},

	uploadRMApictires(LoginId,input, clientreq) {
		let url = "";
		if (config.IopService.routeToVWRS == "Y") {
			url = `${config.IopService.baseurl}/vwrs/vendor/attachments`
		} else {
			url = `${config.IopService.baseurl}/workorder/vendor/attachments`
		}
		console.log("input---", input)
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(input),
			headers: { 
				'Content-Type': 'application/json', 
				"IOPUSERID": LoginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					// return errorHandler(json, "#uploadFiles");
				}
				if (json) {
					return json;
				} 
				if (json && json.error && json.error.length > 0) {
					if (json.status === 400) {
						return new UnkonwnError(json);
					}
					if (json.status === 500) {
						return new UnkonwnError(json);
					}
					return new UnkonwnError(json);
				} else {
					logger.debug("#uploadRMApictires");
					logger.debug(json);
					return new UnkonwnError();
				}
			}).catch(err => {
				logger.debug("#uploadRMApictires");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});

	},

	getRMApictures(LoginId,category, attachmentId, includeLinkedAttachments, clientreq) {

		let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
			&& clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

		let url = '';

		if (isOffShore) {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/attachments?category=${category}&attachmentId=${attachmentId}&includeLinkedAttachments=${includeLinkedAttachments}`;
			} else {
				url = `${config.IopService.baseScruburl}/workorder/vendor/attachments?category=${category}&attachmentId=${attachmentId}&includeLinkedAttachments=${includeLinkedAttachments}`
			}
		} else {
			if (config.IopService.routeToVWRS == "Y") {
				url = `${config.IopService.baseurl}/vwrs/vendor/attachments?category=${category}&attachmentId=${attachmentId}&includeLinkedAttachments=${includeLinkedAttachments}`;
			} else {
				url = `${config.IopService.baseurl}/workorder/vendor/attachments?category=${category}&attachmentId=${attachmentId}&includeLinkedAttachments=${includeLinkedAttachments}`;
			}
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": LoginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getRMApictures");
				}
				if (json && json.data) {
					return json;
				} else if (json.statusCode && json.statusCode == 404) {
					return new NotFound({data:json.message});
				} else if (json.error && json.error.length > 0) {
					return new UnkonwnError({data:json.message});
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({data:json.errors});
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getRMApictures");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getRMApicturesPreview(LoginId,categoryID, attachmentId, clientreq) {
		let url = '';
		if (config.IopService.routeToVWRS == "Y") {
			url = `${config.IopService.baseurl}/vwrs/vendor/attachment/${categoryID}/${attachmentId}`;
		} else {
			url = `${config.IopService.baseurl}/workorder/vendor/attachment/${categoryID}/${attachmentId}`;
		}

		return fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				"IOPUSERID": LoginId
			},
		})
			.then(json => {
				if (typeof json === 'string') {
					return errorHandler(json, "#getRMApicturesPreview");
				}
				if (json && json.attachment) {
					return json;
				}else if (json.statusCode && json.statusCode == 404) {
					return new NotFound({data:json.message});
				} else if (json.error && json.error.length > 0) {
					return new UnkonwnError({data : json.error});
			
				} else if (json.errors && json.errors.length > 0) {
					return new UnkonwnError({data : json.errors});
				} else {
					return new InputError();
				}
			}).catch(err => {
				logger.debug("#getRMApicturesPreview");
				logger.error(err);
				if (err.code === 'ECONNREFUSED') {
					return new ConnectionRefuse();
				} else {
					return new UnkonwnError();
				}
			});
	},
	getRMAattachmentPreview:(attachmentId, preview) => {
		let url = `${config.IopService.baseurl}/dashboard/rma/downloadAttachment/${attachmentId}?preview=${preview}`
		logger.info(`#getRMAattachmentPreview - ${url}`)
		return fetch(url, {
		  method: 'GET',
		  headers: {
			'Content-Type': 'application/json',
			"Accept": "application/json",
		  },
		})
		.then(json => {
		  if (typeof json === 'string') {
			return errorHandler(json, "#getRMAattachmentPreview");
		  }
		  if (json.errors && json.errors.length > 0) {
			return new UnkonwnError({ data: json.errors });
		  } else if (json) {
			return json.attachment;
		  }
		}).catch(err => {
		  logger.debug("#getRMAattachmentPreview");
		  logger.error(err);
		  if (err.code === 'ECONNREFUSED') {
			return new ConnectionRefuse();
		  } else {
			return new UnkonwnError();
		  }
		})
	  },
}