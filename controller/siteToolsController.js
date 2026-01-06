import { UnkonwnError} from '../data/errors'
import logger from '../util/LogUtil'
import {getVendorWorkOrder} from '../controller/controller'; 
import moment from 'moment'
import { fetch } from './proxy'
import {prepareTaskData} from '../util/SiteToolsHelper';

export const apis = {
    getWorkOrderForSite: async (loginId, startdate, enddate, mdgId, siteId, clientreq) => {
        try{
            let workOrders= await getVendorWorkOrder(loginId, startdate, enddate, mdgId, clientreq);
            if(workOrders?.vendor_wo_details){
                logger.info(`#getWorkOrderForSite - Work Orders found`);
                let filteredWorkOrders = workOrders.vendor_wo_details.filter(wo => wo.site_id === siteId && String(wo.workorder_status).toUpperCase() === "WORKPENDING");
                let workOrderDataForSite = [];
                if (filteredWorkOrders.length > 0) {
                    let latestWorkOrder = filteredWorkOrders.reduce((latest, current) => {
                        const currentDate = moment(current.requested_date, 'DD-MMM-YY hh.mm.ss A');
                        const latestDate = moment(latest.requested_date, 'DD-MMM-YY hh.mm.ss A');
                        return currentDate.isAfter(latestDate) ? current : latest;
                    }, filteredWorkOrders[0]);
                    workOrderDataForSite.push(latestWorkOrder);
                }
                return {
                    statusCode: 200, 
					message: "Success", 
                    data: workOrderDataForSite
                };
            }
            else{
                logger.info(`#getWorkOrderForSite - No Work Orders found : ${JSON.stringify(workOrders)}`);
                return {
                    statusCode: 404,
                    message: "No Work Orders found",
                    data: null
                };
            }

        }catch (err) {
            logger.error(JSON.stringify({
                status: err.status || '500',
                message: err.message || 'Internal Server Error',
                details: err.details || err.toString()
            }));
            return new UnkonwnError();
        }
    },
    getNodes: (siteUnid) => {
    const url = `${config.IopService.baseurl}/neops/${siteUnid}/node/details?prb=1`;
    logger.info(`#getNodes - ${url}`);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
    .then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#getNodes");
        }
        if (json.nodes) {
            logger.info(`#getNodes - Nodes found`);
            return {
                statusCode: 200,
                message: "Success",
                data: json.nodes
            };
        } else if (json.errors && json.errors.length > 0) {
            return new UnkonwnError({ data: json.errors });
        } else {
            logger.info(`#getNodes - No Nodes found for siteId: ${siteId}`);
            return {
                statusCode: 404,
                message: "No Nodes found",
                data: null
            };
        }
    })
    .catch(err => {
        logger.info("#getNodes");
        logger.error(JSON.stringify({
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
},
getHeatMap: (node) => {
    const url = `${config.IopService.baseurl}/neops/prb/enodeb/${node}/analyzer`;
    logger.info(`#getHeatMap - ${url}`);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
    .then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#getHeatMap");
        }
        if (json.prbResults) {
            logger.info(`#getHeatMap - Heatmap found`);
            return {
                statusCode: 200,
                message: "Success",
                data: json.prbResults
            };
        } else if (json.errors && json.errors.length > 0) {
            return new UnkonwnError({ data: json.errors });
        } else {
            logger.info(`#getHeatMap - No Heatmap found for node: ${node}`);
            return {
                statusCode: 404,
                message: "No Heatmap found",
                data: null
            };
        }
    })
    .catch(err => {
        logger.info("#getHeatMap");
        logger.error(JSON.stringify({
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
}, 
postTaskType: async (input) =>{
    const url = `${config.IopService.baseurl}/fastdashboard/fast/task`;
    logger.info(`#postTaskType - ${url}`);

    let category = await apis.getTaskType(input?.payload?.user_id);
    logger.info(`#postTaskType - Category fetched: ${JSON.stringify(category)}`);
    let reqBody = prepareTaskData(input?.payload, category?.data);
    logger.info(`#postTaskType - Request Body: ${JSON.stringify(reqBody)}`);
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(reqBody)
    })
    .then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#postTaskType");
        }
        if (json.task) {
            logger.info(`#postTaskType - Task created successfully`);
            return {
                statusCode: 200,
                message: json.message || "Task created successfully",
                data: json.task
            };
        } else if (json.errors && json.errors.length > 0) {
            return new UnkonwnError({ data: json.errors });
        } else {
            logger.info(`#postTaskType - Failed to create task`);
            return {
                statusCode: 400,
                message: "Failed to create task",
                data: null
            };
        }
    })
    .catch(err => {
        logger.info("#postTaskType");
        logger.error(JSON.stringify({
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
},
getTaskType: (loginId) => {
    const url = `${config.IopService.baseurl}/fastdashboard/fast/task/prepops/field?user_id=${loginId}&user_type=OPSPORTAL`;
    logger.info(`#getTaskType - ${url}`);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
    .then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#getTaskType");
        }
        if (json.pmd_task_prepops) {
            logger.info(`#getTaskType - Task found`);
            return {
                statusCode: 200,
                message: "Success",
                data: json.pmd_task_prepops
            };
        } else if (json.errors && json.errors.length > 0) {
            return new UnkonwnError({ data: json.errors });
        } else {
            logger.info(`#getTaskType - No Task found for loginId: ${loginId}`);
            return {
                statusCode: 404,
                message: "No Task found",
                data: null
            };
        }
    })
    .catch(err => {
        logger.info("#getTaskType");
        logger.error(JSON.stringify({
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
}
}
