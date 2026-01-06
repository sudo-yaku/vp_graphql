import api from '../controller/controller';
import { apis as loginController } from '../controller/loginController';
import { apis as bulkPOManagementController} from '../controller/bulkPOManagementController';
import { apis as capitalProjectController} from '../controller/capitalProjectController';
import { apis as recentActivityController } from '../controller/recentActivityController';
import { apis as reportManagementController } from '../controller/reportManagementController';
import { apis as vendorWorkOrderController } from '../controller/vendorWorkOrderController';
import { apis as oswController } from '../controller/oswController';
import { apis as rmaController } from '../controller/rmaController';
import {apis as rmuController} from '../controller/rmuController';
import { apis as nestEvaluationController } from '../controller/NestEvaluationController';
import { apis as invoiceAuditController } from '../controller/invoiceAuditController';
import { apis as DonorSiteController } from '../controller/5GHRController';
import {apis as siteToolsController} from '../controller/siteToolsController';
import { get } from 'lodash';


const resolvers = {
  Query: {
    getDangerousSite :  (root, {siteUnid }, { req }) => {
      return api.getDangerousSite(siteUnid, req);
    },
    getRoofTopInfo: (root, {metaId}, {req}) => {
      return api.getRoofTopInfo(metaId, req);
    },
    getReceivedSitesVendor:(root, { vendorId },{req}) => {
      return api.getReceivedSitesVendor(vendorId,req)
    },
    deviceTestDetails: (root, { project_num }, {req}) => {
      return api.deviceTestDetails(project_num,req)
    },
    deviceConfigView: (root, { request_id }, {req}) => {
      return api.deviceConfigView(request_id,req)
    },
    getDeviceTestHistory: (root, { project_num, test_type, vdu_type }, {req}) => {
      return api.getDeviceTestHistory(project_num, test_type, vdu_type, req)
    },
    getVendorList: (root, { vendor_id }, { req }) => {
      return loginController.getVendorList(vendor_id, req);
    },
    getVendorContactRecord: (root, { contact_unid }, { req }) => {
      return api.getVendorContactRecord(contact_unid,req);

    },
    getVendorUserAuth: (root, { vendorEmail }, { req }) => {
      return api.getVendorUserAuth(vendorEmail,req);
    },
    getUserInfoLinked: (root, { vendorEmail }, { req }) => {
      return api.getUserInfoLinked(vendorEmail,req);
    },
    getUserInfoForCompanies: (root, { input }, { req }) => {
      return api.getUserInfoForCompanies(input,req);
    },
    getLoadCqData: (root, { input }, {req}) => {
      return api.getLoadCqData(input)
    },
    getvduHistoryForProject: (root, { vdu_id }, { req }) => {
      return api.getvduHistoryForProject(vdu_id, req)
    },
    getWorkOrderDistanceDetails: (root, {siteUnid, userId}, {req}) =>{
      return api.getWorkOrderDistanceDetails(siteUnid, userId, req)
    },
    unLinkVendor: (root, { id,name }, { req }) => {
      return api.unLinkVendor(id,name,req);
    },
    getUserInfoVendorLinked: (root, { vendorId }, { req }) => {
      return api.getUserInfoVendorLinked(vendorId,req);
    },
    getNotifications:(root, { category }, {req})=>{
      return api.getNotifications(category,req);
    },
    getUserAuth:(root, {input},{req}) =>{
      return loginController.getUserAuth(input, req);        
    },
    getVendorWorkOrder: (root, {loginId, startdate, enddate, mdgId}, { req }) => {
      return api.getVendorWorkOrder(loginId, startdate, enddate, mdgId, req);
    },
    getHealthCheckDetails :  (root, {siteunid }, { req }) => {
      return api.getHealthCheckDetails(siteunid, req);
    },
    getRETScanDetails: (root, {oswId }, { req }) => {
      return api.getRETScanDetails(oswId, req);
    },
    getMMURequests : (root, {project_id }, { req }) => {
      return api.getMMURequests(project_id, req);
    },
    viewMMUDownload  : (root, {request_id }, { req }) => {
      return api.viewMMUDownload(request_id, req);
    },
    getFastHistory :  (root, {siteunid }, { req }) => {
      return api.getFastHistory(siteunid, req);
    },
    getOpenOswForUser :  (root, { user_id }, { req }) => {
      return api.getOpenOswForUser(user_id, req);
    },
    getCompanyInfoForVendor :  (root, { vendor_mdg_id }, { req }) => {
      return api.getCompanyInfoForVendor(vendor_mdg_id, req);
    },
    getLatestOswDate : (root, { work_order_id }, { req }) => {
      return oswController.getLatestOswDate(work_order_id, req);
    },
    getCountforVPAutomation :  (root, { vendor_id }, { req }) => {
      return api.getCountforVPAutomation(vendor_id, req);
    },
    getMarketsforGenRunReport :  (root, args, { req }) => {
      return api.getMarketsforGenRunReport(req);
    },
    getCompaniesInfoForAllVendors :  (root, args, { req }) => {
      return api.getCompaniesInfoForAllVendors(req);
    },
    getSubMarketsforGenRunReport :  (root, {market }, { req }) => {
      return api.getSubMarketsforGenRunReport(market,req);
    },
    getAnteenaInformation :  (root, {siteUnid}, { req }) => {
      return api.getAnteenaInformation(siteUnid,req);
    },
    getSwitchesforGenRunReport :  (root, {market,submarket }, { req }) => {
      return reportManagementController.getSwitchesforGenRunReport(market,submarket,req);
    },
    getDevicesforGenRunReport :  (root, {market,submarket,switchName }, { req }) => {
      return reportManagementController.getDevicesforGenRunReport(market,submarket,switchName,req);
    },
    getGenRunResult :  (root, {deviceName,startDate,endDate }, { req }) => {
      return reportManagementController.getGenRunResult(deviceName,startDate,endDate,req);
    },
    generatorFuelReport :  (root, {market, subMarket }, { req }) => {
      return reportManagementController.generatorFuelReport(market, subMarket,req);
    }, 
    getGroupsforOpenAlarmsReport :  (root, {market, subMarket }, { req }) => {
      return reportManagementController.getGroupsforOpenAlarmsReport(market, subMarket,req);
    },
    getSwitchesForOpenAlarmReport :  (root, {market, subMarket, group }, { req }) => {
      return reportManagementController.getSwitchesForOpenAlarmReport(market, subMarket,group,req);
    },
    getOpenAlarmsDataReport :  (root, {switchName, startDate, stopDate }, { req }) => {
      return reportManagementController.getOpenAlarmsDataReport(switchName, startDate, stopDate,req);
    },
    getHealthRequestDetails:  (root, {requestid }, { req }) => {
      return api.getHealthRequestDetails(requestid, req);
    },
    getSiteDetails: (root, { siteunid }, { req }) => {
      return api.getSiteDetails(siteunid, req);
    },
    fetchSiteData: (root, { siteunid }, { req }) => {
      return nestEvaluationController.fetchSiteData(siteunid, req);
    },
    getDownloadHealthcheck : (root, { requestid }, { req }) => {
      return api.getDownloadHealthcheck(requestid, req);
    },
    getEventsBySiteUnid : (root, { siteunid }, { req }) => {
      return api.getEventsBySiteUnid(siteunid, req);
    },
    getEventDetails: (root, { vendorId, loginId, type }, { req }) => {
      return api.getEventDetails(vendorId, loginId, type, req);

    },
    getHVACPmModelAttDetails: (root, { pmType,unid }, { req }) => {

      return api.getHVACPmModelAttDetails(pmType,unid, req);

    },
    getPmModelAttDetails: (root, { pmType,po_item_id }, { req }) => {

      return api.getPmModelAttDetails(pmType,po_item_id, req);

    },
    
    getActiveSites: (root, { vendorId, submarket,managerId,poItemIds }, { req }) => {
      
      return api.getActiveSites(vendorId, submarket,managerId,poItemIds,  req);

    },
    getCreateListSites: (root, { vendorId,year}, { req }) => {
      
      return api.getCreateListSites(vendorId,year,  req);

    },
    
    getNestEvaluationQs: (root, { vendorId}, { req }) => {
      
      return api.getNestEvaluationQs(vendorId, req);

    },
    validatePONum: (root, { poId,submarket,psLocId}, { req }) => {
      
      return api.validatePONum(poId,submarket,psLocId, req);

    },

    getNestModelDetails: (root, { unid}, { req }) => {
      
      return api.getNestModelDetails(unid, req);

    },
    getAttachmentContent: (root, { unid}, { req }) => {
      return api.getAttachmentContent(unid, req);
    },
    getAttachmentsListOpsTracker: (root, { unid}, { req }) => {
      
      return api.getAttachmentsListOpsTracker(unid, req);

    },
    
    getFixedPricingServ: (root, { loginId, market, submarket, national, listname, worktype, costtype, sitetype, fixed, nonfixed, zipcode,matrix, nonmatrix,matrixeligible }, { req }) => {
      
      return api.getFixedPricingServ(loginId, market, submarket, national, listname, worktype, costtype, sitetype, fixed, nonfixed, zipcode,matrix, nonmatrix,matrixeligible, req);

    },
    getFixedPricingExistServ: (root, {loginId, unid }, { req }) => {
      
      return api.getFixedPricingExistServ(loginId, unid, req);

    },


    getSearchedSites: (root, { vendorId, search, year }, { req }) => {
      
      return api.getSearchedSites(vendorId, search,year, req);

    },
    
    getEnodebData: (root, { unid }, { req }) => {
      
      return api.getEnodebData(unid, req);

    },
    getSectorLockData: (root, { unid }, { req }) => {
      
      return api.getSectorLockData(unid, req);

    },

    getConfigData: (root, {vendorId }, { req }) => {
      
      return loginController.getConfigData(vendorId,req);

    },

    getSnapProjects: (root, { market, submarket }, { req }) => {
      
      return api.getSnapProjects(market, submarket, req);

    },
    getCbandSnapProjects: (root, { market, submarket }, { req }) => {
      
      return api.getCbandSnapProjects(market, submarket, req);

    },
    
     getCbandProjDetails: (root, { projectNum }, { req }) => {
      
      return api.getCbandProjDetails(projectNum, req);

    },
    

    getPmListDetails: (root, { vendorId, pmType, year }, { req }) => {
      
      return bulkPOManagementController.getPmListDetails(vendorId, pmType, year, req);

    }, 
    getSyncedSitesInfo: (root, { submarket,managerId,pmType }, { req }) => {
      
      return api.getSyncedSitesInfo(submarket,managerId,pmType ,req);

    },
    getFileDataForPmlist: (root, { pmListId, pmListItemId, updateType, name, isCommonFile }, { req }) => {
      
      return api.getFileDataForPmlist(pmListId, pmListItemId, updateType, name, isCommonFile, req);

    },
    getTrainingMaterial: (root, { req }) => {
      return api.getTrainingMaterial(req);
    },
    getCompletedAttDetails: (root, { pmListId }, { req }) => {
      
      return api.getCompletedAttDetails(pmListId, req);

    },
    getPendingWorkOrderDetails: (root, { vendorId }, { req }) => {
      
      return api.getPendingWorkOrderDetails(vendorId, req);

    },
    
      getBuyerList: (root, { loginId, market, submarket, source }, { req }) => {
      return api.getBuyerList(loginId, market, submarket, source, req);
    },
    getExpenseProjIdData: (root, { loginId, submarket, managerId }, { req }) => {
      return api.getExpenseProjIdData(loginId, submarket, managerId, req);
    },
    getSiteListDetails: (root, { market, submarket, managerId, pmType, location }, { req }) => {
      return api.getSiteListDetails(market, submarket, managerId, pmType, location, req);
    },
    
    getPmDetails: (root, { vendorId, pmType }, { req }) => {

      return api.getPmDetails(vendorId, pmType, req);

    },
    getCurrentSystemRecords: (root, { unids, pmType }, { req }) => {

      return api.getCurrentSystemRecords(unids, pmType, req);
    },
    getCurrentSystemRecordsGen: (root, { unids, pmType }, { req }) => {

      return api.getCurrentSystemRecordsGen(unids, pmType, req);
    },
   
    getTowerInspItems: (root, { pmTypeId,submarket,pmListItemId,unid,pmListId }, { req }) => {
    
      return api.getTowerInspItems(pmTypeId,submarket,pmListItemId,unid,pmListId, req);

    },
    getPmListDetailsByVendorId: (root, { vendorId, year }, { req }) => {

      return api.getPmListDetailsByVendorId(vendorId, year, req);

    },
    getPmGridDetails: (root, { pmListIds }, { req }) => {
    
      return api.getPmGridDetails(pmListIds, req);

    },
    getGO95PoleInfo: (root, { subMarket,poleUnid,pmListItemId, pmListId }, { req }) => {
    
      return api.getGO95PoleInfo(subMarket,poleUnid,pmListItemId,pmListId, req);

    },
	getAuditDetails: (root, { pmListItemId}, { req }) => {
    
      return api.getAuditDetails(pmListItemId, req);

    },
	getFileDataForGO95: (root, { loginId, unid, name}, { req }) => {
    
      return api.getFileDataForGO95(loginId, unid, name, req);

    },
    
    getDraftGridDetails: (root, { pmListIds, isGo95, isTower }, { req }) => {
    
      return api.getDraftGridDetails(pmListIds,isGo95,isTower, req);

    },
   
    
    getElogForWorkorder: (root, { workorder_id, vendor }, { req }) => {
      return api.getElogForWorkorder(workorder_id, vendor, req);

    },
    getElogCommentForInfoId: (root, { userId, eloginfoid, fromsystem }, { req }) => {
      return api.getElogCommentForInfoId(userId, eloginfoid, fromsystem, req);
    },
    logout: (root, args, { req }) => {
      return api.logout(req);
    },
    session: (root, args, { req }) => {
      return api.session(req);
    },
    checkForValidSession:(root,args,{req}) =>{
      return api.checkForValidSession(req);
    },
    getIVRLoginReason: (root, args, { req }) => {
      return api.getIVRLoginReason(req);

    },
    checkFastUser:(root,{vzid})=>{
      return api.checkFastUser(vzid)
    },
    getUserIVRDetails:(root,{userId})=>{
      return api.getUserIVRDetails(userId)
    },
    siteLogin: (root, { input }, { req }) => {
      return api.siteLogin(input, req);

    },
    siteLogout: (root, { input }, { req }) => {
      return api.siteLogout(input, req);
    },
    getAlarm: (root, { site_unid }, { req }) => {
      return api.getAlarm(site_unid, req);
    },
    getAttachmentsList: (root, { loginId, unid, attachment_type }, { req }) => {
      return api.getAttachmentsList(loginId, unid, attachment_type, req);
    },
    downloadFile: (root, {loginId, unid, file_name, attachment_id, category }, { req }) => {
      return api.downloadFile(loginId, unid, file_name, attachment_id, category, req);
    },
    downloadVSFile: (root, { file_Id }, { req }) => {
      return api.downloadVSFile(file_Id, req);
    },
    downloadLockUnlockAttachment: (root, { file_Id }, { req }) => {
      return api.downloadLockUnlockAttachment(file_Id, req);
    },
    downloadElogFile: (root, { file_Id }, { req }) => {
      return api.downloadElogFile(file_Id, req);
    },
    getGeneratorInfoForUnid: (root, { unid, type }, { req }) => {
      return api.getGeneratorInfoForUnid(unid, type, req);
    },
    getHvacInfoForUnid: (root, { unid, type }, { req }) => {
      return api.getHvacInfoForUnid(unid, type, req);
    },
    getManagersForSubmarket: (root, { submarket }, { req }) => {
      return api.getManagersForSubmarket(submarket, req);
    },
    getVendorTechForVendorId: (root, { login, vendorId }, { req }) => {
      return api.getVendorTechForVendorId(login, vendorId, req);
    },
    delIvrTechUser: (root, { login, userId }, { req }) => {
      return api.delIvrTechUser(login, userId, req);
    },
    getSitesBySubmarket: (root, { site_region }, { req }) => {
      return api.getSitesBySubmarket(site_region, req);
    },
    getCalenderEventsForSite :  (root, { startDate,endDate,siteUnid }, { req }) => {
      return api.getCalenderEventsForSite(startDate,endDate,siteUnid, req);
    },
    getConflictEventDetails :  (root, { startDate,endDate,siteUnid}, { req }) => {
      return api.getConflictEventDetails(startDate,endDate,siteUnid,req);
    },
    getLockData: (root, { lockReqId }, { req }) => {
      return api.getLockData(lockReqId, req);
    },
    getRecentActivity: (root, { userId }, { req }) => {
      return recentActivityController.getRecentActivity(userId, req);
    },
    
    getSwitchesBySubmarket: (root, { switch_region }, { req }) => {
      return api.getSwitchesBySubmarket(switch_region, req);
    },
    getGenTanknfoForUnid: (root, { unid }, { req }) => {
      return api.getGenTanknfoForUnid(unid, req);
    },
    getVendorWoByUnid: (root, { loginId, unid }, { req }) => {
      return vendorWorkOrderController.getVendorWoByUnid(loginId, unid,req);
    },
    vwrsIDSerachQuery: (root, { vwrsID }, { req }) => {
      return vendorWorkOrderController.vwrsIDSerachQuery(vwrsID, req);
    },
    getRMAInformation: (root, { vwrs_id, rma_id }, { req }) => {
      return rmaController.getRMAInformation(vwrs_id, rma_id, req);
    },
    getRMADetails: (root, { vendorID }, { req }) => {
      return rmaController.getRMADetails(vendorID, req);
    },
    fetchBucketCraneSiteDetails: (root, { siteunid }, { req }) => {
      return vendorWorkOrderController.fetchBucketCraneSiteDetails(siteunid, req);
    },
    getSwitchDetails: (root, { switch_unid }, { req }) => {
      return api.getSwitchDetails(switch_unid, req);
    },
    getSiteSectorCarriers: (root, { siteunid }, { req }) => {
      return api.getSiteSectorCarriers(siteunid, req);
    },
    getSpectrumHistory: (root, { siteunid }, { req }) => {
      return api.getSpectrumHistory(siteunid, req);
    },
    getSpectrumResult: (root, { request_id }, { req }) => {
      return api.getSpectrumResult(request_id, req);
    },
    getSpectrumDownload: (root, { request_id }, { req }) => {
      return api.getSpectrumDownload(request_id, req);
    },
    getVendorWoByWorkOrderId: (root, { loginId, workOrderId, vendorId }, { req }) => {
      return vendorWorkOrderController.getVendorWoByWorkOrderId(loginId,workOrderId, vendorId, req);
    },
    getVendorDataByStatusFilter: (root, { loginId, vendorId, startdt, enddt, statusList }, { req }) => {
      return api.getVendorDataByStatusFilter(loginId, vendorId, startdt, enddt, statusList, req);
    },
    getProjects:(root, {latitude,longitude,proximity,user_id,gnodeb_id,sector_id,du_id}) => {
      return api.getProjects(latitude,longitude,proximity,user_id,gnodeb_id,sector_id,du_id);
    },
    getProjectsBySubMarket:(root, {submarket,project_name}) => {
      return api.getProjectsBySubMarket(submarket,project_name);
    },
    getCurrentPinByUserId: (root, { login, userId }, { req }) => {
      return api.getCurrentPinByUserId(login, userId, req);
    },
    getSectorInfo: (root, { enodeb_id, site_unid }, { req }) => {
      return api.getSectorInfo( enodeb_id, site_unid, req);
    },
    getVendorDomains: (root, { userId }, { req }) => {
      return api.getVendorDomains( userId, req);
    },
    logAction : (root, {user_id, email, vendor_id, workorder_id, market, sub_market, action, action_name, action_option, osw_id}, {req}) => {
      return api.logAction(user_id, email, vendor_id, workorder_id, market, sub_market, action, action_name, action_option, osw_id, req);
    },
    IVRProfileInfo: (root, { login }, { req }) => {
      return api.IVRProfileInfo(login, req);
    },
    getPendingItemsForUpdate: (root, { pmListIds, pmType }, { req }) => {
      return api.getPendingItemsForUpdate(pmListIds, pmType, req);
    },
    getEquipmentFormat: (root, { req }) => {
      return api.getEquipmentFormat(req);
    },
    getCountyListForSubMarket:(root, { subMarket }, { req }) => {
      return api.getCountyListForSubMarket(subMarket,  req);
    },
    getWorkTypes: (root, { loginId, workType }, { req }) => {
      return api.getWorkTypes(loginId, workType, req);

    },
    getWorkScope: (root, {serviceType}, {req}) => {
      return api.getWorkScope(serviceType, req);
    },
    resendUserActivationInvite: (root, {userId}, {req}) => {
      return api.resendUserActivationInvite(userId, req);
    },
    getProjectDetails: (root, {market, submarket, projectNumber}, {req}) => {
      return capitalProjectController.getProjectDetails(market, submarket, projectNumber, req);
    },
    getProjectsList: (root, {mdg_id, startDate,endDate,submarket}, {req}) => {
      return api.getProjectsList(mdg_id, startDate,endDate,submarket, req);
    },
    getMarketListEsso: (root, {req}) => {
      return reportManagementController.getMarketListEsso(req);
    },
    getVendorsListEsso: (root, {market, submarket}, {req}) => {
      return api.getVendorsListEsso(market, submarket, req);
    },
    get5gRepeaterProjectDetails: (root, { projectNum }, { req }) => {
      return api.get5gRepeaterProjectDetails(projectNum, req);
    },
    getDispatchLocations:  (root, {unid, mdgId }, { req }) => {
      return api.getDispatchLocations(unid, mdgId, req);
    },
    getVduStepStatus : (root, {projectId, vduId , siteunid, siteName, vendorId, vendorName}, { req }) => {
      return api.getVduStepStatus(projectId, vduId, siteunid, siteName, vendorId, vendorName, req);
    },
    getHolidayEvents:  (root, args, {req}) => {
      return api.getHolidayEvents(req);
    },
    getRmaPartCodes: (root, { text }, { req }) => {
      return rmaController.getRmaPartCodes(text, req)
    },
    getDefectiveSerialNumber: (root, { site_unid, partcode }, { req }) => {
      return rmaController.getDefectiveSerialNumber(site_unid, partcode, req)
    },
    getRmaPrepops: (root, { site_unid, manager_id }, { req }) => {
      return rmaController.getRmaPrepops(site_unid, manager_id, req)
    },
    getIssues:  (root, { unid }, {req}) => {
      return api.getIssues(unid, req);
    },
    getProblemData :  (root, { problemType }, {req}) => {
      return api.getProblemData(problemType, req);
    },
    generatePDFData : (root, args, {req}) => {
      return api.generatePDFData(req);
    },
    getOffHours:  (root, {id, submarket }, {req}) => {
      return api.getOffHours(id, submarket, req);
    },
    getRelatedVendors:  (root, { keyword }, {req}) => {
      return api.getRelatedVendors(keyword, req);
    },
    getRelatedUsers:  (root, { keyword }, {req}) => {
      return api.getRelatedUsers(keyword, req);
    },
    getVendorProfile :(root, { vendorId }, {req}) => {
      return api.getVendorProfile(vendorId, req);
    },
    getProjectInfoSlr : (root, {projectNumber}) => {
      return api.getProjectInfoSlr(projectNumber)
    },
    validateAddress :(root, {location}) => {
      return api.validateAddress(location)
    },
    getOSWAutoReplyMessagesByUnid: (root, {siteUnid}) => {
      return api.getOSWAutoReplyMessagesByUnid(siteUnid)
    },
    getSamsungRadioUpdateDetails: (root, {osw_request_id}, { req }) => {
      return oswController.getSamsungRadioUpdateDetails(osw_request_id, req)
    },
    checkSocketAndDisconnect: (root, {login_id}) => {
      return oswController.checkSocketAndDisconnect(login_id)
    },
    getRMApictures: (root, {loginId,category, attachmentId, includeLinkedAttachments}, { req }) => {
      return rmaController.getRMApictures(loginId,category, attachmentId, includeLinkedAttachments, req)
    },
    getRMApicturesPreview: (root, {loginId,categoryID, attachmentId}, {req}) => {
      return rmaController.getRMApicturesPreview(loginId,categoryID, attachmentId, req)
    },
    bulkUpdatePendingAckFromRedis: (root, { userId, vendorId }, { req }) => {
      return vendorWorkOrderController.bulkUpdatePendingAckFromRedis(userId, vendorId, req);
    },
    getRMAattachmentPreview: (root, { attachmentId, preview }, { req }) => {
      return rmaController.getRMAattachmentPreview(attachmentId, preview, req)
    },
    getBidUnitRules: (root,{userId}) => {
      return invoiceAuditController.getBidUnitRules(userId);
    },
    getLineItemsByWorkOrderId: (root, { workOrderId,userId }) => {
      return invoiceAuditController.getLineItemsByWorkOrderId(workOrderId, userId);
    },
    getVendorWorkOrderByWorkOrderId: (root, { workOrderId, userId }) => {
      return invoiceAuditController.getVendorWorkOrderByWorkOrderId(workOrderId, userId);
    },
    getAuditByWorkOrderByWorkOrderId: (root, { workOrderId, userId }) => {
      return invoiceAuditController.getAuditByWorkOrderByWorkOrderId(workOrderId, userId);
    },
    getAuditInvoiceByWorkOrderId: (root, { workOrderId, userId }) => {
      return invoiceAuditController.getAuditInvoiceByWorkOrderId(workOrderId, userId);
    },
    getOSWInfo: (root, { workOrderId }) => {
      return invoiceAuditController.getOSWInfo(workOrderId);
    },
    getAPRadioDeviceDetails: (root, { fuzeSiteId, managerId }, { req }) => {
      return DonorSiteController.getAPRadioDeviceDetails(fuzeSiteId, managerId, req)
    },
   
    getHostnameMapping: async (parent, args, context) => {
      const { method, site } = args;
      const response = await rmuController.getHostnameMapping(method, site, context.req);
      return { data:response };
    },

    searchHpovServer: async (parent, args, context) => {
      const { method, proc, reqBody } = args;
      const response = await rmuController.searchHpovServer(method, proc, reqBody, context.req);
      return { data: response };
    },

    pingHost: async (parent, args, context) => {
      const { method, host } = args;
      const response = await rmuController.pingHost(method, host, context.req);
      return { data: response };
    },
    getTestInfo: (root, { siteUnid }) => {
      return rmuController.getTestInfo(siteUnid);
    },
    getOpenTest: (root, { siteUnid }) => {
      return rmuController.getOpenTest(siteUnid);
    },
    getTestHistory: (root, { siteUnid }) => {
      return rmuController.getTestHistory(siteUnid);
    },
    getTestStatus: (root, { eatTestId }) => {
      return rmuController.getTestStatus(eatTestId);
    },
    getOswIssueTypes: (root, args, { req }) => {
      return oswController.getOswIssueTypes(req)
    },
    getTestAuditDetails: (root, { eatTestId }) => {
      return rmuController.getTestAuditDetails(eatTestId);
    },
    getMetroRootSchedules: (root, { caId }, { req }) => {
      return api.getMetroRootSchedules(caId, req)
    },
    getWorkOrderForSite: (root, {loginId, startdate, enddate, mdgId, siteId }, { req }) => {
      return siteToolsController.getWorkOrderForSite(loginId, startdate, enddate, mdgId, siteId, req)
    },
    getSiteTypes: (root, {req}) =>{
      return rmuController.getSiteTypes(req)
    },
    getNodes: (root, { siteUnid }, { req }) => {
      return siteToolsController.getNodes(siteUnid, req)
    },
    getHeatMap: (root, { node }, { req }) => {
      return siteToolsController.getHeatMap(node, req)
    },
    getTaskType: (root, { loginId }, { req }) => {
      return siteToolsController.getTaskType(loginId, req)
    },
    recalculateDistance : (root, { workOrderId, loginId }, { req }) => {
      return vendorWorkOrderController.recalculateDistance(workOrderId, loginId);
    },
    getRadioInfo : (root, { siteUnid }, { req }) => {
      return api.getRadioInfo(siteUnid);
    },
    getDashboardConfig: (root,{  }) => {
      return vendorWorkOrderController.getDashboardConfig();
    },
    getWorkUrgency: async(root, { req }) => {
      const data = await vendorWorkOrderController.getWorkUrgency();
      return { data };
    }
  },
  Mutation: {
    createDispatchAddress : (root,  {input} , { req }) => {
      return api.createDispatchAddress(input)
    },
    ericssionServerTest: (root, { input }, { req }) => {
      return api.ericssionServerTest(input);
    },
    vduReplacement : (root,  {input, siteunid, siteName, vendorId, vendorName} , { req }) => {
      return api.vduReplacement(input, siteunid, siteName, vendorId, vendorName, req)
    },
    updateDispatchAddress :(root, {input, locationUnid}) => {
      return api.updateDispatchAddress(input,locationUnid)
    },
    deleteDispatchAddress :(root, {locationUnid}) => {
      return api.deleteDispatchAddress(locationUnid)
    },
    createDeviceTestRequest: (root, { input }, { req }) => {
      return api.createDeviceTestRequest(input, req)
    },
    createDraftRMA: (root, { manager_id, input }, { req }) => {
      return rmaController.createDraftRMA(manager_id, input, req)
    },
    resubmitRMA: (root, {rmaId, input}, { req } ) => {
      return rmaController.resubmitRMA(rmaId, input, req)
    },
    requestHealthCheck : (root, { input, siteunid }, { req }) => {
      return api.requestHealthCheck(input, siteunid, req)
    },
    requestRETScan : (root, { payload}, { req }) => {
      return api.requestRETScan(payload, req)
    },
    loadCqData : (root, { input }, { req }) => {
      return api.loadCqData(input, req)
    },
    updateLockStatus: (root, { input, lockReqId }, { req }) => {
      return api.updateLockStatus(input, lockReqId, req)
    },
    updateManualOswReason: (root, { input, lockReqId }, { req }) => {
      return api.updateManualOswReason(input, lockReqId, req)
    },
    updateStayAutoFlag: (root, { osw_request_id }, { req }) => {
      return oswController.updateStayAutoFlag(osw_request_id, req)
    },
    
    createLockUnlock : (root, { input, siteUnid }, { req }) => {
      return api.createLockUnlock(input, siteUnid, req)
    },
    unlockSector : (root, { input, siteUnid }, { req }) => {
      return api.unlockSector(input, siteUnid, req)
    },
    generateValidationMMU: (root, { input }, { req }) => {
      return api.generateValidationMMU(input, req)
    },
    issoResetAccount : (root, { issoUserId,opstrackerUserId }, { req }) => {
      return api.issoResetAccount(issoUserId,opstrackerUserId, req)
    },
    createContact: (root, { input }, { req }) => {
      return api.createContact(input);
    },
    updateContact: (root, { input }, { req }) => {
      return api.updateContact(input);
    },
    deleteContact: (root, { contact_unid }, { req }) => {
      return api.deleteContactRecord(contact_unid);
    },
    deleteUsers: (root, { input }, { req }) => {
      return api.deleteUsers(input);
    },
    submitLockRequest: (root, { input }, { req }) => {
      return api.submitLockRequest(input, req);
    },
    submitNotes: (root, { input, lockReqId }, { req }) => {
      
      return api.submitNotes(input,lockReqId, req);
    },
     submitAttachment: (root, { input, lockReqId }, { req }) => {
      
      return api.submitAttachment(input,lockReqId, req);
    },
    submitTowerInsp: (root, { input }, { req }) => {
      
      return api.submitTowerInsp(input, req);
    },
    generateInspPDFGO95: (root, { input, type }, { req }) => {
     
      return api.generateInspPDF(input, type, req);
    },
    generateInspPDFHvac: (root, { input, type }, { req }) => {
     
      return api.generateInspPDF(input, type, req);
    },
    generateInspPDFGen: (root, { input, type }, { req }) => {
      
      return api.generateInspPDF(input, type, req);
    },
    generateInspPDF: (root, { input, type }, { req }) => {
      
      return api.generateInspPDF(input, type, req);
    },
    submitInspectionInfo: (root, { input }, { req }) => {
      
      return api.submitInspectionInfo(input, req);
    },

    submitFPQuoteInvoice: (root, {loginId, input, quoteUnid,quoteAction }, { req }) => {
      
      return api.submitFPQuoteInvoice(loginId, input,quoteUnid,quoteAction, req);
    },
    submitFPInvoice: (root, {loginId, input, quoteUnid,quoteAction }, { req }) => {
      
      return api.submitFPQuoteInvoice(loginId, input,quoteUnid,quoteAction, req);
    },
    submitPMDetails: (root, { input }, { req }) => {
      
      return api.submitPMDetails(input, req);
    },	
    updateScheduleDate: (root, { input, refName }, { req }) => {

      return api.updateScheduleDate(input, refName, req);
      },	
    
    createPMList: (root, { input, refName, feGrouped }, { req }) => {

      return api.createPMList(input, refName, feGrouped, req);
      },	
    getTemplateDataGen: (root, { input }, { req }) => {	
      	
      return api.getTemplateDataGen(input, req);
    },	
    getTemplateData: (root, { input }, { req }) => {	
      	
      return api.getTemplateData(input, req);
    },
    uploadFiles: (root, { input }, { req }) => {
      
      return api.uploadFiles(input, req);
    },
	 uploadFilesGO95: (root, { input, unid }, { req }) => {     
      return api.uploadFilesGO95(input,unid, req);
    },
    uploadFilesWO: (root, { input, unid, category }, { req }) => {
      
      return api.uploadFilesWO(input,unid, category, req);
    }, 

    submitFilesvwrs: (root, {loginId, input }, { req }) => {
      return api.submitFilesvwrs(loginId, input, req);
    },
    submitElog: (root, { input }, { req }) => {
      return api.submitElog(input, req);
    },
    submitElogComment: (root, { input }, { req }) => {
      return api.submitElogComment(input, req);
    },
    updateWOStatus: (root, { loginId, input }, { req }) => {
      return api.updateWOStatus(loginId, input, req);
    },
    submitWORequest: (root, { loginId, input }, { req }) => {
      return api.submitWORequest(loginId, input, req);
    },
    submitScheduleRequest: (root, { input }, { req }) => {
      return api.submitScheduleRequest(input, req);
    },
    updateScheduleRequest: (root, { input }, { req }) => {
      return api.updateScheduleRequest(input, req);
    },
    createUpdIvrUser: (root, { input }, { req }) => {
      return api.createUpdIvrUser(input, req);
    },
    createUpdVendorCompany: (root, { input }, { req }) => {
      return api.createUpdVendorCompany(input, req);
    },
    ivrEmailNotification: (root, { input }, { req }) => {
      return api.ivrEmailNotification(input, req);
    },
    submitGenReadings: (root, { input }, { req }) => {
      return api.submitGenReadings(input, req);
    },
    createSpectrumAnalyzer: (root, { input }, { req }) => {
      return api.createSpectrumAnalyzer(input, req);
    },
    updateMultipleMarketIvr: (root, { input }, { req }) => {
      return api.updateMultipleMarketIvr(input, req);
    },
    
    updateEquipment: (root, { input }, { req }) => {
      return api.updateEquipment(input.Body)
    },
    
    getNokeDeviceInfo: (root, { input }, { req }) => {
      return api.getNokeDeviceInfo(input.Body)
    },
    getNokeCommands: (root, { input }, { req }) => {
      return api.getNokeCommands(input.Body)
    },
    updateSiteEquipmentInfo: (root, { input }, { req }) => {
      return api.updateSiteEquipmentInfo(input,req)
    },
    updateQuestionnaire: (root, {loginId, input, siteUnid }, { req }) => {
      return api.updateQuestionnaire(loginId, input, siteUnid, req);
    },
    updateQuestionnaireAttachments: (root, {loginId, input, siteUnid }, { req }) => {
      return api.updateQuestionnaireAttachments(loginId, input, siteUnid, req);
    },
    updateAccessRestrictions : (root, {loginId, fuzeSiteId, unid, input }, { req }) => {
      return api.updateAccessRestrictions(loginId, fuzeSiteId, unid, input, req);
    },
    resetIvrPin : (root, { input }, { req }) => {
      return api.resetIvrPin(input, req);
    },
    updateVendorStatus : (root, { loginId, input, quoteId, status }, { req }) => {
      return api.updateVendorStatus(loginId, input, quoteId, status, req);
    },
    bulkUpdatePendingAck : (root, { input }, { req }) => {
      return vendorWorkOrderController.bulkUpdatePendingAck(input, req);
    },
    updateVendorStatusComments : (root, { input}, { req }) => {
      return api.updateVendorStatusComments(input, req);
    },
    updateAutoVpPermission: (root, { input }, { req }) => {
      return api.updateAutoVpPermission(input,req);
    },
    hvacInfoToOpstracker : (root, { unid, input }, { req }) => {
      return api.hvacInfoToOpstracker(unid, input, req);
    },
    updateResolution :  (root, { unid , input}, { req }) => {
      return api.updateResolution(unid , input, req);
    },
    linkExistingVendorToNewCompany: (root, { input }, { req }) => {
      
      return api.linkExistingVendorToNewCompany(input, req);
    },
    saveDeviceToEnodeb: (root, { input }, { req }) => {
      
      return api.saveDeviceToEnodeb(input, req);
    },
        submitIssueReport: (root, { input }, { req }) => {
      return api.submitIssueReport(input,req);
    },
    serialNumberUpdate:(root, {input}, {req}) => {
      return api.serialNumberUpdate(input, req)
    },
    saveUserActivity: (root, { input }, { req }) => {	      	
      return api.saveUserActivity(input, req);
    }, 
    saveFavoriteSubMarket: (root, { input }, { req }) => {	      	
      return api.saveFavoriteSubMarket(input, req);
    },
    updateUserStatus: (root, { input }, { req }) => {	      	
      return api.updateUserStatus(input, req);
    },
    updateSamsungSN : (root, { site_unid, input }, { req }) => {
      return oswController.updateSamsungSN(site_unid, input, req)
    },
    uploadRMApictires : (root, {loginId,input }, { req }) => {
      return rmaController.uploadRMApictires(loginId,input, req)
    },
    updateVendorTrained: (root, { input }, { req }) => {	      	
      return oswController.updateVendorTrained(input, req);
    },
    deleteAvianAttachment :(root, {attachmentId}) => {
      return nestEvaluationController.deleteAvianAttachment(attachmentId)
    },
    postInvoiceSubmit: (root, { input }, { req }) => {
      return invoiceAuditController.postInvoiceSubmit(input, req);
    },
    postAuditSubmit: (root, {vwrsInfo, input }, { req }) => {
      return invoiceAuditController.postAuditSubmit(vwrsInfo,input, req);
    },
    completeInvoiceTransaction: (root, { auditId, input, userId }, { req }) => {
      return invoiceAuditController.completeInvoiceTransaction(auditId, input, userId, req);
    },
    createHPOVRegistration: (root, { input }, { req }) => {
      return rmuController.createHPOVRegistration(input, req);
    },
    createEatTestRequest: (root, { input }, { req }) => {
      return rmuController.createEatTestRequest(input, req);
    },
    cancelEatTest: (root, { input }, { req }) => {
      return rmuController.cancelEatTest(input, req);
    },
    startEatTest: (root, { input }, { req }) => {
      return rmuController.startEatTest(input, req);
    },
    stopEatTest: (root, { input }, { req }) => {
      return rmuController.stopEatTest(input, req);
    },
    completeEatTest: (root, { input }, { req }) => {
      return rmuController.completeEatTest(input, req);
    },
    postTaskType: (root, { input }, { req }) => {
      return siteToolsController.postTaskType(input, req);
    },
    uploadAvianAttachment: (root, { input }, { req }) => {
      return nestEvaluationController.uploadAvianAttachment(input, req);
    },
    sendEmailNotificationForAvianUpdate: (root, {meta_universalid, input}, {req}) => {
      return nestEvaluationController.sendEmailNotificationForAvianUpdate(meta_universalid, input, req);
    }
  }

};

export default resolvers;
