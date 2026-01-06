import { ConnectionRefuse, UnkonwnError, InputError, GateWayDown, NotFound, CustomErr, InternalServerError, UnAuthorized, NoDataFoundError } from '../data/errors'
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')
const {mapEatInput} = require('../util/EatHelper');
import { buildRmuLinkPayload, buildRmuUnlinkPayload } from '../util/RmuLinkHelper';


const safeStringify = (val) => {
  if (val instanceof Error) {
    return JSON.stringify({
      name: val.name,
      message: val.message,
      stack: val.stack
    });
  }
  if (typeof val === 'object' && val !== null) {
    try {
      return JSON.stringify(val);
    } catch (e) {
      return '[Unserializable Object]';
    }
  }
  return String(val);
};

const errorHandler = (json, functionName) => {
  logger.error(`${functionName} - Error: ${safeStringify(json)}`);
  return new UnkonwnError({ data: json });
}

export const apis = {
  getHostnameMapping: (method, site, clientreq) => {
    const url = `${config.AiOpsProject}/NMC/projects/data.cfc?method=${method}&site=${site}`;
    logger.info(`#getHostnameMapping - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#getHostnameMapping");
      }
      if (json) {
        logger.info(`#getHostnameMapping - Response: ${JSON.stringify(json)}`);
        return json;
      }
      else if (json.errors && json.errors.length > 0) {
        return new UnkonwnError({ data: json.errors });
      }

    }).catch(err => {
      logger.info("#getHostnameMapping - Request failed");
      
      const statusCode = err.status || err.statusCode || err.code || 'UNKNOWN';
      const message = err.message || err.statusText || 'Unknown error occurred';
      const details = {
        url: url,
        method: 'GET',
        timestamp: new Date().toISOString(),
        originalError: err
      };
      
      logger.error(`#getHostnameMapping - Status: ${statusCode}, Message: ${message}, Details: ${JSON.stringify(details, null, 2)}`);
      
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new UnkonwnError();
      }
    });
  },

  searchHpovServer: async (method, proc, reqBody, clientreq) => {
    const url = `${config.AiOpsProject}/NMC/projects/data.cfc?method=${method}&proc=${proc}&hostname=${reqBody.hostname}`;
    logger.info(`#searchHpovServer - ${url}`);

    try {
        const json = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
            },
        });

        if (typeof json === 'string') {
            return errorHandler(json, "#searchHpovServer");
        }
        if (json) {
            if (json['status'] && json['status'].toUpperCase() !== 'NOT FOUND' && reqBody?.flag == 1) {
              try{
                await apis.linkRmuToIop(reqBody);
              }catch (err) {
                logger.error(safeStringify({
                  status: err.status || '500',
                  message: err.message || 'Internal Server Error in linking RMU to IOP',
                  details: JSON.stringify(err, Object.getOwnPropertyNames(err))
                }));
              }
            }
            return json;
        } else if (json.errors && json.errors.length > 0) {
          return new UnkonwnError({ data: json.errors });
        }
        logger.info(`#searchHpovServer - Response: ${JSON.stringify(json)}`);
        return json;
    } catch (err) {
        logger.info("#searchHpovServer - Request failed");

        const statusCode = err.status || err.statusCode || err.code || 'UNKNOWN';
        const message = err.message || err.statusText || 'Unknown error occurred';
        const details = {
            url: url,
            method: 'GET',
            timestamp: new Date().toISOString(),
            originalError: err
        };

        logger.error(`#searchHpovServer - Status: ${statusCode}, Message: ${message}, Details: ${JSON.stringify(details, null, 2)}`);

        if (err.code === 'ECONNREFUSED') {
          return new ConnectionRefuse();
        } else {
          return new UnkonwnError();
        }
    }
},

  pingHost: (method, host, clientreq) => {
    const url = `${config.AiOpsProject}/scripts/siteboss/ipadd_ping.cfc?method=${method}&host=${host}`;
    logger.info(`#pingHost - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#pingHost");
      }
      if (json) {
        return json;
      }
      else if (json.errors && json.errors.length > 0) {
        return new UnkonwnError({ data: json.errors });
      }
      logger.info(`#pingHost - Response: ${JSON.stringify(json)}`);
      return json;
    }).catch(err => {
      logger.info("#pingHost - Request failed");
      
      const statusCode = err.status || err.statusCode || err.code || 'UNKNOWN';
      const message = err.message || err.statusText || 'Unknown error occurred';
      const details = {
        url: url,
        method: 'GET',
        timestamp: new Date().toISOString(),
        originalError: err
      };
      
      logger.error(`#pingHost - Status: ${statusCode}, Message: ${message}, Details: ${JSON.stringify(details, null, 2)}`);
      
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new UnkonwnError();
      }
    });
  },
  createHPOVRegistration: async (input, clientreq) => {
    const url = `${config.pmService.baseurl}/rmu/hpovRegistration`;
    logger.info(`#createHPOVRegistration - ${url}`);
    try{
    let reqBody = {
      "requesterName": input.hpovDeviceRegistration.requesterName,
      "siteUnid": input.siteUnid,
      "requestApplication": input.hpovDeviceRegistration.requestApplication,
      "hostname": input.hpovDeviceRegistration.hpovDevices[0].ipAddress,
      "rmuLegacy": input.hpovDeviceRegistration.rmuLegacy
    }
    if(input.hpovDeviceRegistration.requestorType.toUpperCase() == 'HPOV ADD'){
      await apis.linkRmuToIop(reqBody);
    }
    else if(input.hpovDeviceRegistration.requestorType.toUpperCase() == 'HPOV DELETE'){
      await apis.unlinkRMUToIOP(reqBody);
    }
    logger.info(`#createHPOVRegistration - Request Body: ${JSON.stringify(input)}`);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
      body: JSON.stringify(input)
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#createHPOVRegistration");
      }
      if (json && json.details) {
        logger.info(`#createHPOVRegistration - Response: ${JSON.stringify(json)}`);
        const jiraValue = json.details?.Response?.[0]?.jira;
        return {
          statusCode: jiraValue ? 200 : 204,
					message: "Success", 
          data: json
        };
      }
      else if (json.errors) {
        return {
          statusCode: json.status || 500, 
          message: json.message || "Error occurred",
          data: json.errors
        };
      }
    }).catch(err => {
      logger.info("#createHPOVRegistration");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new UnkonwnError();
      }
    });
    }catch (err) {
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || 'Error occurred while linking RMU to IOP : ' + err.toString()
      }));
      return new UnkonwnError();
    }
  },
  getTestInfo: (siteUnid) => {
    const url = `${config.IopService.baseurl}/site/${siteUnid}/testinfo`;
    logger.info(`#getTestInfo - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#getTestInfo");
      }
      if (json.test_info) {
        logger.info(`#getTestInfo - Response: ${JSON.stringify(json)}`);
        return { 
					statusCode: 200, 
					message: "Success", 
					test_info: json['test_info'] 
				};
      }
      else if (json.errors && json.errors.length > 0) {
        return new UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#getTestInfo");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  createEatTestRequest: (input, clientreq) => {
    const url = `${config.IopService.baseurl}/eat/site/${input.siteUnid}/test`;
    logger.info(`#createEatTestRequest - ${url}`);
    let reqBody = mapEatInput(input);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
      body: JSON.stringify(reqBody)
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#createEatTestRequest");
      }
      if (json.eat_tests) {
        logger.info(`#createEatTestRequest - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: "Success", 
          eat_tests: json['eat_tests'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#createEatTestRequest");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  getOpenTest: (siteUnid) => {
    const url = `${config.IopService.baseurl}/eat/site/${siteUnid}/test/open`;
    logger.info(`#getOpenTest - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#getOpenTest");
      }
      if (json.eat_test_status) {
        logger.info(`#getOpenTest - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: "Success", 
          eat_test_status: json['eat_test_status'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#getOpenTest");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  cancelEatTest: (input, clientreq) => {
    const url = `${config.IopService.baseurl}/eat/test/${input.eatTestId}/cancel`;
    logger.info(`#cancelEatTest - ${url}`);
    
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
      body: JSON.stringify({ user_id: input.userId })
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#cancelEatTest");
      }
      if (json.user_id) {
        logger.info(`#cancelEatTest - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: json['message'] || "Success", 
          user_id: json['user_id'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#cancelEatTest");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  getTestHistory: (siteUnid) => {
    const url = `${config.IopService.baseurl}/eat/site/${siteUnid}/test/history`;
    logger.info(`#getTestHistory - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#getTestHistory");
      }
      if (json.eat_tests) {
        logger.info(`#getTestHistory - Response: ${JSON.stringify(json)}`);
        const sortedEatTests = json['eat_tests'].sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
        return { 
          statusCode: 200, 
          message: "Success", 
          eat_tests: sortedEatTests
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#getTestHistory");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  getTestStatus: (eatTestId) => {
    const url = `${config.IopService.baseurl}/eat/test/${eatTestId}/run/status`;
    logger.info(`#getTestStatus - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#getTestStatus");
      }
      if (json.eat_test_status) {
        logger.info(`#getTestStatus - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: "Success", 
          eat_test_status: json['eat_test_status'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#getTestStatus");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  startEatTest: (input, clientreq) => {
    const url = `${config.IopService.baseurl}/eat/test/${input.eatTestId}/run/start`;
    logger.info(`#startEatTest - ${url}`);
    
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
      body: JSON.stringify({ user_id: input.userId, indiv_tests: input.indiv_tests })
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#startEatTest");
      }
      if (json.eat_test_status) {
        logger.info(`#startEatTest - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: "Success", 
          eat_test_status: json['eat_test_status'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#startEatTest");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  stopEatTest: (input, clientreq) => {
    const url = `${config.IopService.baseurl}/eat/test/${input.eatTestId}/run/stop`;
    logger.info(`#stopEatTest - ${url}`);
    
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
      body: JSON.stringify({ user_id: input.userId })
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#stopEatTest");
      }
      if (json.eat_test_status) {
        logger.info(`#stopEatTest - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: "Success", 
          eat_test_status: json['eat_test_status'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#stopEatTest");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  completeEatTest: (input, clientreq) => {
    const url = `${config.IopService.baseurl}/eat/test/${input.eatTestId}/complete`;
    logger.info(`#completeEatTest - ${url}`);
    
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
      body: JSON.stringify({ user_id: input.userId, source_system: input.source_system, email_list: input.email_list, vendor_fname: input.vendor_fname, vendor_lname: input.vendor_lname, company_name: input.company_name })
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#completeEatTest");
      }
      if (json.message) {
        logger.info(`#completeEatTest - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: json['message'], 
          user_id: json['user_id'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#completeEatTest");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  getTestAuditDetails: (eatTestId) => {
    const url = `${config.IopService.baseurl}/eat/test/${eatTestId}/audit`;
    logger.info(`#getTestAuditDetails - ${url}`);
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
      },
    }).then(json => {
      if (typeof json === 'string') {
        return errorHandler(json, "#getTestAuditDetails");
      }
      if (json.audit_info) {
        logger.info(`#getTestAuditDetails - Response: ${JSON.stringify(json)}`);
        return { 
          statusCode: 200, 
          message: "Success", 
          audit_info: json['audit_info'] 
        };
      }
      else if (json.errors && json.errors.length > 0) {
        return new  UnkonwnError({ data: json.errors });
      }
    }).catch(err => {
      logger.info("#getTestAuditDetails");
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error',
        details: err.details || err.toString()
      }));
      if (err.code === 'ECONNREFUSED') {
        return new  ConnectionRefuse();
      } else {
        return new  UnkonwnError();
      }
    });
  },
  linkRmuToIop: async function (reqBody) {
    const requestBodyRmuLink = buildRmuLinkPayload(reqBody);
    logger.info(`The RMU to IOP linking request body: ${safeStringify(requestBodyRmuLink)}`);
    let rmuLinkUrl;
    if(reqBody.rmuLegacy == "Y"){
      rmuLinkUrl = `${config.IopService.baseurl}/site/rmu/link`;
    }else{
      rmuLinkUrl = `${config.IopService.baseurl}/rmunest/equipment`;
    }
    logger.info(`The RMU to IOP linking request URL: ${rmuLinkUrl}`);
    try {
      const json = await fetch(rmuLinkUrl, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBodyRmuLink)
      });

      logger.info(`Response from RMU to IOP linking: ${safeStringify(json)}`);
      if (!json || json.errors || (json.status && json.status >= 400)) {
        throw new Error(`RMU link failed: ${safeStringify(json)}`);
      }
      return json;
    } catch (err) {
      logger.error(safeStringify({
        status: err.status || '500',
        message: err.message || 'Internal Server Error in linking RMU to IOP',
        details: JSON.stringify(err, Object.getOwnPropertyNames(err))
      }));
      throw err;
    }
},
getSiteTypes: (clientreq) => {
    const url = `${config.IopService.baseurl}/eat/sitetypes`;
    logger.info(`#getSiteTypes - ${url}`);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
        },
    }).then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#getSiteTypes");
        }
        if (json.site_types) {
          logger.info(`#getSiteTypes - Response: ${JSON.stringify(json)}`);
            return {
                statusCode: 200,
                message: "Success",
                site_types: json['site_types']
            };
        }
        else if (json.errors && json.errors.length > 0) {
            return new  UnkonwnError({ data: json.errors });
        }
    }).catch(err => {
        logger.info("#getSiteTypes");
        logger.error(safeStringify({
            status: err.status || '500',
            message: err.message || 'Internal Server Error',
            details: err.details || err.toString()
        }));
        if (err.code === 'ECONNREFUSED') {
            return new  ConnectionRefuse();
        } else {
            return new  UnkonwnError();
        }
    });
},
unlinkRMUToIOP: async function (reqBody) {
    let requestBodyRmuUnlink = buildRmuUnlinkPayload(reqBody);
    logger.info(`The RMU to IOP unlinking request body: ${JSON.stringify(requestBodyRmuUnlink)}`);
    let rmuUnlinkUrl
    if (reqBody.rmuLegacy == "Y") {
      rmuUnlinkUrl = `${config.IopService.baseurl}/site/rmu/unlinkRMU`;
    } else {
      rmuUnlinkUrl = `${config.IopService.baseurl}/rmunest/equipment/`;
    }
    logger.info(`The RMU to IOP unlinking request URL: ${rmuUnlinkUrl}`);
    
    try {
        const json = await fetch(rmuUnlinkUrl, {
            method: 'PUT',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodyRmuUnlink)
        });

        logger.info(`Response from RMU to IOP unlinking: ${safeStringify(json)}`);
        if (!json || json.errors || (json.status && json.status >= 400)) {
            throw new Error(`RMU unlink failed: ${safeStringify(json)}`);
        }
        return json;
    } catch (err) {
        logger.error(safeStringify({
            status: err.status || '500',
            message: err.message || 'Internal Server Error in unlinking RMU to IOP',
            details: JSON.stringify(err, Object.getOwnPropertyNames(err))
        }));
        throw err;
    }
}
}

