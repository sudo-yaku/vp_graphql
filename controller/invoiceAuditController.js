const fs = require('fs');
import moment from 'moment';
import { ConnectionRefuse, UnkonwnError, InputError, NotFound, NoDataFoundError } from '../data/errors'
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')
const {prepareAinDMultipartData} = require('../util/AInDMultipartHelper')
const {prepareAuditMultipartData} = require('../util/AuditHelper')
const {prepareAinDPayLoadData} = require('../util/AInDPayloadHelper');
const axios = require('axios');

const formatUtcAuditTs = () => {
    const m = moment.utc();
    const day = m.format('DD');
    const mon = m.format('MMM').toUpperCase(); // FEB
    const year = m.format('YY');               // 25
    const hour = m.format('hh');               // 12-hour, zero-padded
    const min = m.format('mm');
    const sec = m.format('ss');
    const ms = m.format('SSS');                // milliseconds
    const frac9 = ms + '000000';               // pad to 9 digits (nanoseconds not available, so zeros)
    const ampm = m.format('A');                // AM / PM
    return `${day}-${mon}-${year} ${hour}.${min}.${sec}.${frac9} ${ampm}`;
};

const errorHandler = (errorJson, source) => {
    logger.debug(`Error in ${source}: ${errorJson}`);
    try {
        const error = JSON.parse(errorJson);
        if (error && error.Error && error.Error.length > 0) {
            switch (error.Error[0].status) {
                case 501:
                    return new NotFound({ data: error.Error[0] });
                default:
                    return new UnkonwnError({ data: error.Error[0] });
            }
        }
        return new UnkonwnError({ message: errorJson });
    } catch (e) {
        logger.error(`Failed to parse error: ${e.message}`);
        return new UnkonwnError({ message: errorJson });
    }
};

export const apis = {
    async getBidUnitRules(userId) {
		try {
			logger.debug(`Fetching bid unit rules for user ${userId}`);
			const url = `${config.IopService.baseurl}/vwrs/invoice/auditRules?user_id=${userId}`;
			
			const json = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					"Accept": "application/json"
				},
			});
			
			// Handle string response (usually error)
			if (typeof json === 'string') {
				logger.debug(`Received string response in #getBidUnitRules: ${json}`);
				return errorHandler(json, "#getBidUnitRules");
			}
			
			// Handle successful data response
			if (json && json["data"] && Object.keys(json["data"]).length > 0) {
				logger.info(`#getBidUnitRules Success - received ${Object.keys(json["data"]).length} rules`);
				return { 
					statusCode: 200,
					message: "Success",
					data: json["data"] 
				};
			} 
			
			// Handle error object in response
			if (json && json.Error && json.Error.length > 0) {
				logger.error(`#getBidUnitRules Error - status: ${json.Error[0].status}, message: ${json.Error[0].message || 'No message'}`);
				switch (json.Error[0].status) {
					case 501:
						return new NotFound({ data: json.Error[0] });
					default:
						return new UnkonwnError({ data: json.Error[0] });
				}
			} 
			
			// Handle empty or invalid response
			logger.debug(`#getBidUnitRules - Received invalid or empty response`);
			return new InputError();
			
		} catch (err) {
			logger.error(`#getBidUnitRules Exception: ${err.message}`, err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError({ message: err.message });
			}
		}
	},
	async getLineItemsByWorkOrderId(workOrderId, userId) {
		try {
			logger.debug(`Fetching line items for workOrder ${workOrderId} and user ${userId}`);
			const url = `${config.IopService.baseurl}/vwrs/lineItems/workOrder/${workOrderId}?user_id=${userId}`;
			
			const json = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					"Accept": "application/json"
				},
			});
			
			// Handle string response (usually error)
			if (typeof json === 'string') {
				logger.debug(`Received string response in #getLineItemsByWorkOrderId: ${json}`);
				return errorHandler(json, "#getLineItemsByWorkOrderId");
			}
			
			// Handle successful data response
			if (json && json["data"]) {
				logger.info(`#getLineItemsByWorkOrderId Success - received line items for workOrder ${workOrderId}`);
				return { 
					statusCode: 200, 
					message: "Success", 
					data: json["data"] 
				};
			} 
			
			// Handle error object in response
			if (json && json.Error && json.Error.length > 0) {
				logger.error(`#getLineItemsByWorkOrderId Error - status: ${json.Error[0].status}, message: ${json.Error[0].message || 'No message'}`);
				switch (json.Error[0].status) {
					case 501:
						return new NotFound({ data: json.Error[0] });
					default:
						return new UnkonwnError({ data: json.Error[0] });
				}
			}
			
			// Handle empty or invalid response
			logger.debug(`#getLineItemsByWorkOrderId - Received invalid or empty response`);
			return new InputError();
			
		} catch (err) {
			logger.error(`#getLineItemsByWorkOrderId Exception: ${err.message}`, err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError({ message: err.message });
			}
		}
	},
	async getVendorWorkOrderByWorkOrderId(workOrderId, userId) {
		try {
			logger.debug(`Fetching vendor work order for workOrder ${workOrderId} and user ${userId}`);
			const url = `${config.IopService.baseurl}/vwrs/vendorWorkOrder/workOrder/${workOrderId}?user_id=${userId}`;
			
			const json = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					"Accept": "application/json"
				},
			});
			
			// Handle string response (usually error)
			if (typeof json === 'string') {
				logger.debug(`Received string response in #getVendorWorkOrderByWorkOrderId: ${json}`);
				return errorHandler(json, "#getVendorWorkOrderByWorkOrderId");
			}
			
			// Handle successful data response (both string and object data types)
			if (json && json["data"]) {
				logger.info(`#getVendorWorkOrderByWorkOrderId Success - received data for workOrder ${workOrderId}`);
				return { 
					statusCode: 200, 
					message: "Success", 
					data: json["data"] 
				};
			} 
			
			// Handle error object in response
			if (json && json.Error && json.Error.length > 0) {
				logger.error(`#getVendorWorkOrderByWorkOrderId Error - status: ${json.Error[0].status}, message: ${json.Error[0].message || 'No message'}`);
				switch (json.Error[0].status) {
					case 501:
						return new NotFound({ data: json.Error[0] });
					default:
						return new UnkonwnError({ data: json.Error[0] });
				}
			}
			
			// Handle empty or invalid response
			logger.debug(`#getVendorWorkOrderByWorkOrderId - Received invalid or empty response`);
			return new InputError();
			
		} catch (err) {
			logger.error(`#getVendorWorkOrderByWorkOrderId Exception: ${err.message}`, err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError({ message: err.message });
			}
		}
	},
	async getAuditByWorkOrderByWorkOrderId(workOrderId, userId) {
		try {
			logger.debug(`Fetching audit data for workOrder ${workOrderId} and user ${userId}`);
			
			// Fetch line items
			const line_items = await this.getLineItemsByWorkOrderId(workOrderId, userId);
			logger.debug(`Line items fetch result for workOrder ${workOrderId}: ${line_items.statusCode}`);
			
			// Fetch vendor work order
			const vendorWorkOrder = await this.getVendorWorkOrderByWorkOrderId(workOrderId, userId);
			logger.debug(`Vendor work order fetch result for workOrder ${workOrderId}: ${vendorWorkOrder.statusCode}`);
			
			// Check if both API calls returned data
			if(line_items.data && vendorWorkOrder.data){
				logger.info(`#getAuditByWorkOrderByWorkOrderId Success - received data for workOrder ${workOrderId}`);
				const {
						quote_total,
						materials_total,
						labor_total,
						fuel_total,
						rental_total,
						...filteredVendorWorkOrder
					} = vendorWorkOrder.data;
				return {
					statusCode: 200,
					message: "Success",
					data: {
						line_items: line_items.data,
						vendorWorkOrder: filteredVendorWorkOrder
					}
				};
			} else {
				logger.debug(`#getAuditByWorkOrderByWorkOrderId - No data found for workOrder ${workOrderId}`);
				return new NoDataFoundError({ message: "No data found for the given work order ID" });
			}
		} catch (err) {
			logger.error(`#getAuditByWorkOrderByWorkOrderId Exception: ${err.message}`, err);
			return new UnkonwnError({ message: err.message });
		}
	},
	async postInvoiceSubmit(input) {
		try {
			logger.debug(`Processing invoice submission for workorder ${input.body.workorder_id}`);
			
			// Fetch required data
			let oswInfo = await this.getOSWInfo(input.body.workorder_id);
			logger.debug(`OSW info fetch result: ${oswInfo.statusCode || 'unknown'}`);
			
			let audit_rules = await this.getBidUnitRules(input.metadata.user_id);
			logger.debug(`Audit rules fetch result: ${audit_rules.statusCode || 'unknown'}`);
			
			// Prepare VWRS info
			const vwrsInfo = {
				metadata: input.metadata,
				workorder_id: input.body.workorder_id,
				line_items: input.body.line_items,
				vendorWorkOrder: input.body.vendorWorkOrder,
				attachments: input.body.attachments,
				price_matrix: input.body.price_matrix,
				oswInfo: oswInfo['data'] || [],
				audit_rules: audit_rules['data'] || [],
				vendorcomments: input.body?.vendorcomments || '',
				distanceMob: input.body?.distanceMob || ''
			};
			
			// Set up authentication
			const username = config.aindUserName;
			const password = config.aindPassword;
			const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
			const url = `${config.aindUrl}/ntwgenie/api/v1/agents/vwrs/vwrs-audit-info`;
			
			// Prepare payload and form data
			let payload = prepareAinDPayLoadData(vwrsInfo);
			const form = prepareAinDMultipartData(payload, input.body.attachments || []);
			
			logger.info(`[${formatUtcAuditTs()}] Sending invoice data to AInD for workorder ${input.body.workorder_id}`);
			logger.info(`[${formatUtcAuditTs()}] AInD Endpoint URL: ${url}`);
			logger.info(`[${formatUtcAuditTs()}] AInD Payload: ${JSON.stringify(payload)} attachments_count=${(input.body.attachments||[]).length}`);
			
			// Make API request to AInD
			let response = {"data": {"defaultMessage": "no data found"}};
			try{
			 response = await axios({
				url: url,
				method: 'POST',
				data: form,
				headers: {
					...form.getHeaders(),
					Authorization: basicAuth
				}
			})
			if (response && response.data && response.data.findings) {
                    if (Array.isArray(response.data.findings.workorder_findings)) {
                        response.data.findings.workorder_findings = response.data.findings.workorder_findings.map(f => ({
                            ...f,
                            issue: f.issue && f.details ? `${f.issue} ${f.details}` : f.issue
                        }));
                    }
                    if (Array.isArray(response.data.findings.bid_unit_findings)) {
                        response.data.findings.bid_unit_findings = response.data.findings.bid_unit_findings.map(f => ({
                            ...f,
                            issue: f.issue && f.details ? `${f.issue} ${f.details}` : f.issue
                        }));
                    }
                }
			}catch (err) {
				logger.error(`AInD API request failed: ${err.message}`, err);
				response= { "data": { "status": err?.status || '500', "message": err?.message || 'Unknown error occurred', "details": err?.stack || 'No details available' } };
			}
			
			logger.info(` [${formatUtcAuditTs()}] Received AInD response for workorder ${input.body.workorder_id}`);
			logger.info(`[${formatUtcAuditTs()}] AInD Response: ${JSON.stringify(response.data)}`);
			
			// Add AInD response to VWRS info
			vwrsInfo['auditRes'] = response && response.data;
			// Submit audit data
			logger.debug(`Submitting audit data for workorder ${input.body.workorder_id}`);
			let auditData = await this.postAuditSubmit(vwrsInfo, payload);
			
			if (!auditData) {
				logger.error(`Failed to submit audit data for workorder ${input.body.workorder_id}`);
				return new InputError();
			}
			
			// Prepare final response
			let responseData = response.data;
			if (auditData && typeof auditData === 'object' && 'data' in auditData) {
				responseData.auditData = auditData.data;
			} else {
				responseData.auditData = {};
			}
			
			logger.info(`Successfully processed invoice submission for workorder ${input.body.workorder_id}`);
			return responseData;
			
		} catch (err) {
			logger.error(`#postInvoiceSubmit Exception: ${err.message}`, err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError({ message: err.message });
			}
		}
	},
	async postAuditSubmit(vwrsInfo, payload) {
		try {
			const userId = vwrsInfo.metadata.user_id;
			logger.debug(`Submitting audit data for user ${userId}`);
			
			const urlAudit = `${config.IopService.baseurl}/vwrs/invoice/audit?userid=${userId}`;
			logger.debug(`Posting to audit endpoint: ${urlAudit}`);
			
			// Prepare form data with attachments
			const formData = prepareAuditMultipartData(vwrsInfo, payload);
			
			logger.info(`Sending audit data for workorder ${vwrsInfo.workorder_id}`);
			
			// Make API request
			const response = await axios({
				url: urlAudit,
				method: 'POST',
				data: formData,
				headers: {
					...formData.getHeaders(),
					"IOPUSERID": userId
				}
			});
			
			// Check if we have a valid response
			if (!response || !response.data) {
				logger.error('No response data received from audit endpoint');
				return new InputError();
			}
			
			logger.info(`[${formatUtcAuditTs()}] Successfully submitted audit data for workorder ${vwrsInfo.workorder_id}`);
			logger.info(`[${formatUtcAuditTs()}] Audit Response: ${JSON.stringify(response.data)}`);

			// Handle response with error information
			if (response.data && response.data.Error && response.data.Error.length > 0) {
				logger.error(`[${formatUtcAuditTs()}] Audit submission error - status: ${response.data.Error[0].status}, message: ${response.data.Error[0].message || 'No message'}`);
				switch (response.data.Error[0].status) {
					case 501:
						return new NotFound({ data: response.data.Error[0] });
					default:
						return new UnkonwnError({ data: response.data.Error[0] });
				}
			}
			
			// Return successful response data
			return response.data;
			
		} catch (err) {
			logger.error(`#postAuditSubmit Exception: ${err.message}`, err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError({ message: err.message });
			}
		}
	},
	async completeInvoiceTransaction(auditId, input, userId) {
		try {
			logger.debug(`Completing invoice transaction for audit ID ${auditId} by user ${userId}`);
			const url = `${config.IopService.baseurl}/vwrs/invoice/audit/${auditId}/workorder-submission`;
			
			const payload = {
				data: input
			};
			logger.info(`[${formatUtcAuditTs()}] Payload for completing invoice transaction: ${JSON.stringify(payload)}`);
			logger.debug(`Sending PATCH request to ${url}`);
			const json = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'IOPUSERID': userId
				},
				body: JSON.stringify(payload)
			});
			
			// Handle string response (usually error)
			if (typeof json === 'string') {
				logger.debug(`Received string response in #completeInvoiceTransaction: ${json}`);
				return errorHandler(json, "#completeInvoiceTransaction");
			}
			
			// Handle error object in response
			if (json && json.Error && json.Error.length > 0) {
				logger.error(`#completeInvoiceTransaction Error - status: ${json.Error[0].status}, message: ${json.Error[0].message || 'No message'}`);
				switch (json.Error[0].status) {
					case 501:
						return new NotFound({ data: json.Error[0] });
					default:
						return new UnkonwnError({ data: json.Error[0] });
				}
			}

			// Handle successful data response
			if (json) {
				logger.info(`[${formatUtcAuditTs()}] #completeInvoiceTransaction Success - completed transaction for audit ID ${auditId}`);
				logger.info(`[${formatUtcAuditTs()}] Complete Invoice Transaction Response: ${JSON.stringify(json)}`);
				return { 
					statusCode: 200, 
					message: "Success", 
					data: json 
				};
			} 
			
			// Handle empty or invalid response
			logger.debug(`#completeInvoiceTransaction - Received invalid or empty response`);
			return new InputError();
			
		} catch (err) {
			logger.error(`#completeInvoiceTransaction Exception: ${err.message}`, err);
			if (err.code === 'ECONNREFUSED') {
				return new ConnectionRefuse();
			} else {
				return new UnkonwnError({ message: err.message });
			}
		}
	},
	async getAuditInvoiceByWorkOrderId(workOrderId, userId) {
    try {
        logger.debug(`Fetching audit invoice for workOrder ${workOrderId} and user ${userId}`);
        const url = `${config.IopService.baseurl}/vwrs/${workOrderId}/invoice/audit/invoiced`;
        
        const json = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "IOPUSERID": userId
            },
        });
        
        // Handle string response (usually error)
        if (typeof json === 'string') {
            logger.debug(`Received string response in #getAuditInvoiceByWorkOrderId: ${json}`);
            return errorHandler(json, "#getAuditInvoiceByWorkOrderId");
        }
        
        // Handle successful data response
        if (json && json["data"]) {
            logger.info(`#getAuditInvoiceByWorkOrderId Success - received data for workOrder ${workOrderId}`);
            return { 
                statusCode: 200, 
                message: "Success", 
                data: json["data"] 
            };
        } 
        
        // Handle error object in response
        if (json && json.Error && json.Error.length > 0) {
            logger.error(`#getAuditInvoiceByWorkOrderId Error - status: ${json.Error[0].status}, message: ${json.Error[0].message || 'No message'}`);
            switch (json.Error[0].status) {
                case 501:
                    return new NotFound({ data: json.Error[0] });
                default:
                    return new UnkonwnError({ data: json.Error[0] });
            }
        }
        
        // Handle empty or invalid response
        logger.debug(`#getAuditInvoiceByWorkOrderId - Received invalid or empty response`);
        return new InputError();
        
    } catch (err) {
        logger.error(`#getAuditInvoiceByWorkOrderId Exception: ${err.message}`, err);
        if (err.code === 'ECONNREFUSED') {
            return new ConnectionRefuse();
        } else {
            return new UnkonwnError({ message: err.message });
        }
    }
},
async getOSWInfo(workOrderId) {
    try {
        logger.debug(`Fetching OSW info for workOrder ${workOrderId}`);
        const url = `${config.pmService.baseurl}/sectorlock/getOSWInfo?work_order_id=${workOrderId}`;
        
        const json = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
        });
        
        // Handle string response (usually error)
        if (typeof json === 'string') {
            logger.debug(`Received string response in #getOSWInfo: ${json}`);
            return errorHandler(json, "#getOSWInfo");
        }
        
        // Handle successful data response
        if (json && json["oswInfo"]) {
            logger.info(`#getOSWInfo Success - received OSW data for workOrder ${workOrderId}`);
            return { 
                statusCode: 200, 
                message: "Success", 
                data: json["oswInfo"] 
            };
        }
        
        // Handle error object in response
        if (json && json.Error && json.Error.length > 0) {
            logger.error(`#getOSWInfo Error - status: ${json.Error[0].status}, message: ${json.Error[0].message || 'No message'}`);
            switch (json.Error[0].status) {
                case 501:
                    return new NotFound({ data: json.Error[0] });
                default:
                    return new UnkonwnError({ data: json.Error[0] });
            }
        }
        
        // Handle empty or invalid response
        logger.debug(`#getOSWInfo - Received invalid or empty response`);
        return new InputError();
        
    } catch (err) {
        logger.error(`#getOSWInfo Exception: ${err.message}`, err);
        if (err.code === 'ECONNREFUSED') {
            return new ConnectionRefuse();
        } else {
            return new UnkonwnError({ message: err.message });
        }
    }
}
}
