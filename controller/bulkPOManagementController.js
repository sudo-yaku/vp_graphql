import { ConnectionRefuse, UnkonwnError, InputError, InternalServerError } from '../data/errors'
import _ from 'lodash';
import logger from '../util/LogUtil'
import { fetch } from './proxy'
let config = require('config')

export const apis = {
    getPmListDetails(vendorId, pmType, year, clientreq) {
        let isOffShore = (clientreq && clientreq.session && clientreq.session.userdata
            && clientreq.session.userdata.isUserOffShore) ? clientreq.session.userdata.isUserOffShore : false;

        let url = '';

        if (isOffShore) {
        url = `${config.pmService.baseScruburl}/vppm/getPMListsForVP?vendorId=${vendorId}&year=${year}`
        }else{
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
}
