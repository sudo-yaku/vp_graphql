export const typeDefs = `
scalar JSON
input getUserAuthInput{
  Header:getUserAuthHeader
  Body: getUserAuthReq
}
input getUserAuthHeader {
  transactionId: String
  client_name: String
}
input getUserAuthReq{
  email: String
  appName: String
  appVersion: String
  userDeviceInfo:userDeviceDetails
}
input userDeviceDetails{
  deviceId: String
  deviceName: String
  osVersion: String
  deviceSerial: String
  shellVersion: String
  devicePhoneNumber: String
}
type auth_response {
  user:Vendor
  features: FeatureInfo
}
type Vendor {
  vendor_id : Int
  vendor_name : String
  vendor_sponsor_id: String
  vendor_sponsor_email: String
  vendor_category : String
  vendor_area : String
  vendor_region : String
  vendor_service_email : String
  vendor_phone : String
  vendor_address : String
  vendor_city: String
  vendor_state: String
  vendor_zip: String
  vendor_peoplesoft_id: String
  userid: String
  fname: String
  lname: String
  name: String
  phone: String
  email: String
  title: String
  vendor_role: String
  contact_unid: String
  vendor_unid: String
  lastname: String
  preferences: JSON
  permissions: JSON
  meta_universalid: String
  login_id: String
  is_vendor_disabled: String
  techID:String
  address1:String
  address2:String
  address3:String
  city:String
  state:String
  country:String
  zipcode:String
  AltPhone:String
  supervisor:String
  updatedBy:String
  status:String
  badge:String
  sessionTimeout:String
  isSuperAdmin: String
  isssouser: Boolean
  vendorDisplayName:String
  vendorDisplayCode:String
  group_vendors: [VendorInfo]
  releaseNotesInfo: ReleaseInfo
  vmcMessagesInfo: vmcMessagesData
  ssoLogoutURL:String
  vendor_pricing_macro_ant_tow:String
  favoriteSubMarket: String
  lastAccessedSubMarket: String
  lastAccessedDate: String
  ssoRole:String
  vendor:String
  customer_type:String
  lastUpdatedDate:String
  vendor_mdg_id : String
  vendor_uuid : String
  vendor_sponsorid : String
  is_vpauto_enabled : String
  isUserOffShore : String
  is_vendor_trained : String
  is_isso_reg:String
  is_pricing_matrix : Int
  is_group_visibility : Int
  service_email: String
  vendor_pricing_small_cell: String
  incentive_eligible : String
  wno_user: String
  smallcell_incentive_eligible: String
  need_to_delete_date : String
  user_status : String
  last_login_datetime : String
  pending_certification: Int
}

type FeatureInfo {
  NETWORK_APP_VERSION: String
}
type ReleaseInfo{        
  showReleaseNotes: String 
  title: String
  description: String
  link: String  
}
type vmcMessagesData {
  vmcMessages: [VMCMessage]
  showVmcMessage:  Boolean
}
type VMCMessage {
  messageId: String
  startTime: String
  endTime: String
  msgSubject: String
  msgText: String
  sentDate: String
  sentBy: String
  marketName: String
  userRole: String
  vendorName: String
}
type VendorUser{
  vendor_id : Int
  vendor_name : String
  vendor_sponsor_id: String
  vendor_sponsor_email:String
  vendor_category : String
  vendor_area : String
  vendor_region : String
  vendor_service_email : String
  vendor_phone : String
  vendor_address : String
  vendor_city: String
  vendor_state: String
  vendor_zip: String
  vendor_peoplesoft_id: String
  userid: String
  fname: String
  lname: String
  name: String
  phone: String
  email: String
  title: String
  vendor_role: String
  contact_unid: String
  vendor_unid: String
  lastname: String
  group_vendors: [VendorInfo]
  meta_universalid: String
  login_id: String
  is_vendor_disabled: String
}
type VendorInfo{
  userid: String
  vendor_role: String
  lastname: String
  fname: String
  vendor_id: Int
  vendor_name: String
  vendor_unid: String
  vendor_mdg_id: String
  vendor_category: String
  vendor_area: String
  vendor_region: String
  group_vendors: [VendorInfo]
  vendor_uuid: String
  vendor_sponsorid: String
  is_vendor_disabled: String
  is_vpauto_enabled: String
  is_pricing_matrix: Int
  is_group_visibility: Int  
  vendor_pricing_macro_ant_tow:String
  vendor_pricing_small_cell: String
  incentive_eligible : String
}
type configData {
  configData: [ConfigData]
  submarketData: [String]
  isGeneratorVendor:String
  oswClosureCodes : JSON
  invoiceOosNA : String
  invoiceOosVendor : String
}
type ConfigData {
  ATTRIBUTE_NAME: String
  ATTRIBUTE_VALUE: String
  ATTRIBUTE_CATEGORY: String
  ATTRIBUTE_DESCRIPTION: String
}
type openOsw {
  openOsw: [
    oswType
  ]
}
type oswType{
    OPENOSW: Int
    SECTOR_REQ_UNQ_ID: Int
    SECTOR_REQUEST_TYPE: String
    WORK_REQUEST_TYPE: String
    SITE_TYPE: String
    WORK_ORDER_ID: String
    WORK_TYPE: String
    WORK_INFO: String
    SITE_UNID: String
    SWITCH_UNID: String
    MARKET: String
    SUB_MARKET: String
    INCLUDE_WORK_INFO: String
    DESCRIPTION: String
    GC_TECH_ID: String
    GC_USER_ID: String
    VENDOR_NAME: String
    VENDOR_COMPANY: String
    VENDOR_PHONE: String
    VENDOR_EMAIL: String
    ENODEB_ID: String
    SECTOR: String
    CARRIER: String
    RADIO: String
    NOTIFY_ADDRESS: String
    LOCK_UNLOCK_REQUEST_ID: Int
    REQUEST_STATUS: String
    REQUEST_COMMENTS: String
    REQUEST_SOURCE: String
    CREATED_DATE: String
    CREATED_BY: String
    LAST_UPDATED_BY: String
    LAST_UPDATE_DATE: String
    LAST_WORKED_BY: String
    NON_SERVICE_IMPACTING: String
    IS_AUTO: String
    IS_WORK_COMPLETE: String
    WORK_COMPLETE_NOTES: String
    SITE_NAME: String
    FAULT_CODE: String
    RESOLUTION_CODE: String
    VENDOR_ID: Int
    IS_REMINDER_ACKNOWLEDGED: String
    REPLACE_ANTENNA_WORK_SECTOR: String
    REPLACE_ANTENNA_WORK: String
    VENDOR_MDG_ID: String
  }
type PORemainder{
  count : String
  receivedSitesData :[receivedSites]
}
type receivedSites{
  PM_LIST_NAME: String
  PO_NUM: String,
  VENDOR_ID: String,
  VENDOR_NAME: String
  VENDOR_PSID: String
  PM_LIST_STATUS: String
  PM_LIST_ID: String
  PM_LIST_ITEM_ID: String
  PM_LOCATION_NAME:String
  SITE_ID: String
  PS_LOCATION_ID: String
  LINE: String
  PM_COST: String
  ITEM_STATUS: String
  DUE_DATE: String
  START_DATE: String
  COMPLETED_DATE: String
  COMPLETED_BY: String
}
type ivrData{
  ivr_tech_id:String
  user_id:String
  first_name: String
  last_name: String
  company: String
  function_name: String
  sponsor: String
  account_locked: String
  pin_expired: String
  pin: String
  new_pin: String
  manager_name: String
  manager_contact: String
}
type UserIVRDetailsResponse{
  ivr_profile:[ivrData]
}
type getUserInfoVendorLinkedResp{
  output: outputType
}
type outputType{
  users:[usersType]
  companies:[companiesType]
}
type usersType{
  LINKED_USER_ID:Int
  CONTACT_UNID: String
  VENDOR_ID: String
  LINKED_VENDOR_ID: String
  EMAIL_ADDRESS: String
  OPSTRACKER_USERID: String
  IVR_ACTIVE: String
  LINK_STATUS : String
  FIRST_NAME : String
  LAST_NAME : String
  PHONE_NUMBER : String
  LINKED_BY: String
  LINKED_ON: String
  LAST_UPDATED_BY: String
  LAST_UPDATED_DATE: String
}
type companiesType{
  VDR_CMPNY_UNQ_ID:Int
  CMPNY_UUID: String
  VENDOR_ID:Int
  VENDOR_NAME: String
  VENDOR_CATEGORY: String
  VENDOR_AREA: String
  VENDOR_REGION: String
  VENDOR_PEOPLESOFTID: String
  VENDOR_SERVICE_EMAIL: String
  VENDOR_CONTACT_INFO: String
  VENDOR_ADDRESS: String
  VENDOR_CITY: String
  VENDOR_STATE: String
  VENDOR_ZIPCODE: String
  VENDOR_UUID: String
  VENDOR_SPONSORID: String
  IS_VENDOR_DISABLED : String
  IS_VPAUTO_ENABLED: String
  IS_PRICING_MATRIX : Int
  IS_GROUP_VISIBILITY : Int
}
type getVendorUserAuthResp{
  output: outputType
}`;
