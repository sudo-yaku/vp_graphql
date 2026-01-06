import { makeExecutableSchema, addMockFunctionsToSchema, addSchemaLevelResolveFunction } from 'graphql-tools';
import mocks from './mocks';
import resolvers from './resolvers';
import { UnAuthorized } from './errors'
import AppLogger from '../corelib/AppLogger';
import {typeDefs as loginSchema} from './loginSchema';
import { typeDefs as bulkPOManagementSchema } from './bulkPOManagementSchema';
import { typeDefs as capitalProjectSchema } from './capitalProjectSchema';
import { typeDefs as companyProfileSchema } from './companyProfileSchema';
import { typeDefs as recentActivitySchema } from './recentActivitySchema';
import { typeDefs as reportManagementSchema } from './reportManagementSchema';
import { typeDefs as vendorWorkOrderSchema } from './vendorWorkOrderSchema';
import { typeDefs as oswSchema } from './oswSchema';
import { typeDefs as rmaSchema } from './rmaSchema';
import { typeDefs as rmuSchema } from './rmuSchema';
import { typeDefs as nestEvaluationSchema } from './nestEvaluationSchema';
import { typeDefs as invoiceAuditSchema } from './invoiceAuditSchema';
import { typeDefs as siteToolsSchema } from './siteToolsSchema';


const typeDefs = `
type workorder_by_site{
  name:String
  workorder:[String]
}
type cost_by_month{
  month:String
  cost:Float
}

type fileinfo{
  file_name: String
  file_path: String
  file_path_full: String
  file_size: String
  file_modifieddate: String
  category: String
  description: String
  source_universalid: String
  meta_universalid: String
  file_url: String
}
type list_of_files{
  attachments:[fileinfo]
}
type dashboard_obj{
  sites:[workorder_by_site]
  workorder:[String]
  dueToday:[String]
  overDue:[String]
  dueThisWeek:[String]
  adhoc:[String]
  completedOnTime:Int
  overDueCompleted:Int
  totalAmount:Float
  month:[cost_by_month]
}
type dashboard{
  quote_pending:dashboard_obj
  quote_received:dashboard_obj
  quote_approved:dashboard_obj
  po_requested:dashboard_obj
  awaiting_po:dashboard_obj
  work_pending:dashboard_obj
  work_completed:dashboard_obj
  work_accepted:dashboard_obj
  completed:dashboard_obj
}

type circuit_vendor{
  vendor: String
  fullname: String
  trouble_contacts: String
  comments: String
}
type emer_contacts{
  name: String
  value: String
}
type xng_info{
  comments: String
  directions: String
  restrictions: String
  emer_contacts:[emer_contacts]
}
type contacts{
  role: String
  name: String
  title: String
  email: String
  phone: String
}
type bird_nest_activity{
  bird_type: String
  biologist_name: String
  restricted: String
  bird_restriction: String
  tower_access: String
  ground_access: String
  comments: String
  log: String
  updated: String
  emis_verification: String
}
type refDataType {
      SEC_UNQ_ID: String
      VENDOR_ID: String
      VENDOR_COMPANY: String
      MARKET: String
      SUB_MARKET: String
      WORK_TYPE: String
      LAST_UPDATED_BY: String
      LAST_UPADTED_DATE: String
    }
type sectorLockData{
  siteData: [sectorSiteData]
  refData: [refDataType]
    
}
type enodebData{
  enodeBData:radioCellList  
}
type radioCellList{
  radio_cell_list:[radioDetails]
}
type radioDetails{
  enodeb_id: String
  vendor: String
  radio_units: [String]
  cell_list:[String]
}
type sectorSiteData{
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
    ENODEB_ID:String
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
    VENDOR_MDG_ID: String
}
type callout_zones{
  cz_unid: String
  name: String
  num: String
  period: String
  start_time: String
  end_time: String
  manager: String
  phone_no: String
  phone_no_2: String
  phone_no_mgr: String
  sms: String
  notes: String
  instructions: String
  mgr_name: String
}
type circuits{
  circuitid: String
  status: String
  type: String
  bandwidth: String
  vendor: String
  pathview_url: String
}
type enodebs{
  enodeb_num:String
  enodeb_ip:String
  enodeb_vendor:String
}
type fastHistorydetails{
  slrhistory : [fastData]
}
type fastData{
        SECTOR_REQ_UNQ_ID: Int,
        SECTOR_REQUEST_TYPE: String,
        WORK_REQUEST_TYPE: String,
        SITE_TYPE: String,
        WORK_ORDER_ID: String,
        WORK_TYPE: String,
        WORK_INFO: String,
        SITE_UNID: String,
        SWITCH_UNID: String,
        MARKET: String,
        SUB_MARKET: String,
        INCLUDE_WORK_INFO: String,
        DESCRIPTION:String,
        GC_TECH_ID: String,
        GC_USER_ID: String,
        VENDOR_NAME: String,
        VENDOR_COMPANY: String,
        VENDOR_PHONE: String,
        VENDOR_EMAIL: String,
        ENODEB_ID: String,
        SECTOR: String,
        CARRIER: String,
        RADIO: String,
        NOTIFY_ADDRESS: String,
        LOCK_UNLOCK_REQUEST_ID: Int,
        REQUEST_STATUS: String,
        REQUEST_COMMENTS: String,
        REQUEST_SOURCE: String,
        CREATED_DATE: String,
        CREATED_BY: String,
        LAST_UPDATED_BY: String,
        LAST_UPDATE_DATE: String
}
type healthcheckdetails{
  enodeb_healthcheck : [healthCheck]
  
}
type RETScanDetails{
  result : [RETScanCheck]
  
}
type cbandtools{
  errors : JSON
  cfg_requests : [toolscband]
}
type toolscband{
            SCT_REQ_HEADER_ID: String
            ENODEB_ID : String
            SITE_UNID: String
            ACTION: String
            DESCRIPTION: String
            STATUS: String
            CREATED_BY: String
            CREATED_ON: String
            MODIFIED_ON: String
            UUID: String
            PROJECT_NUMBER: String
            TASK_INST_ID: String
            WF_INST_ID: String
            IS_DELETED: String
            DELETED_BY: String
}
type downloadMMU{
  req_details : RequestDetails
}
type RequestDetails{
  request_id: String
  enodeb_num: String
  enodeb_name: String
  enodeb_ip: String
  enodeb_model: String
  req_header : RequestHeader
  oam_ip: String
  action: String
  job_id: String
  config_txt: String
  job_status: String
}
type RequestHeader{
  enodeb_id: String
  site_unid: String
  action: String
  description: String
  status: String
  user_id: String
  wf_inst_id: String
  task_inst_id: String
  project_number: String
  validation_type: String
}
type healthrequest_response{
  enodeb_healthcheck_result : hcresponse
  errors : JSON
}
type DownloadHC{
  data : String
}
type eventsBySite{
  data : [EventsSite]
}

type EventsSite{
  eventId: String
  eventName: String
  eventType: String
  productCode: String
  startDate: String
  endDate: String
  createdDate: String
  createdBy:String
  siteSurveyId: String
  siteSurveyReferenceId: String
}
type hcresponse{
  request_id : String
  req_type : String
  ondemand_info : Hdresult
  precheck_info : JSON
  postcheck_info : JSON
  vendor : String
  summary: JSON
}
type Hdresult{
  result : [Hdoutput]
  }
  type Hdoutput{
    enodeb_id : String
    output : [String]
  }
type healthCheck{
  request_id: String
  enodeb_ids : [String]
  created_by : String
  created_by_name : String
  osw_request_id : String
  hc_result : String
  created_on : String
  req_type : String
  email_ids : [String]
  timezone : String
  command_list : String
  notes : String
  file_count : Int
  ondemand_exec_time : String
  precheck_start_time : String
  postcheck_start_time : String
  precheck_exec_time : String
  postcheck_exec_time : String
  status : String
  status_color : String
  errors : JSON
  actions: Act
}
type RETScanCheck{
  request_id: String
  status: String
  node_id: String
  type: String
  note: String
  created_by: String
  created_on: String
  execution_time: String
  status_color: String
  actions: Acts
}

type Acts
{
  view: String
  download: String
  run: String
}
type Act{
  clone : String
  view : String
  download : String
}
type site_node_deatils{
  node: String
  vendor: String
  type: String
  commandList : String
  enodeb_name : String
  targeted_commands : [JSON]
}

  type Site{
  enodebs: [enodebs]
  callout_zones: [callout_zones]
  node_details: [site_node_deatils]
  siteid: String
  site_unid: String
  name: String
  sitename: String
  area: String
  region: String
  market: String
  switch: String
  sitetype: String
  opstracker_url: String
  type: String
  security_lock: String
  security_lock_noc_int: String
  tower_type: String
  tower_managed_by: String
  tower_manager_phone: String
  tower_noc_monitored: String
  tower_vzw_owned: String
  sitefunction: String
  address: String
  city: String
  state: String
  zip: String
  county: String
  latitude: String
  longitude: String
  techname: String
  techid: String
  covid19_restricted: String
  root_drive: Boolean
  root_drive_ca: String
  managername: String
  managerid: String
  mdgid: String
  locus_id: String
  direction: JSON
  restriction: JSON
  gatecombo1: String
  gatecombo2: String
  accessrestriction: String
  equipmenttype: String
  evm: String
  brand: String
  signagebarriers: String
  lec: String
  circuits: [circuits]
  clli: String
  alltel_atc_site: String
  vertical_site: String
  sequoia_site: String
  callout_zone_name: String
  ps_loc_id: String
  status: String
  vzreg_frn: String
  asr_num: String
  atc_site_id: String
  emis_id: String
  hvac_contact_phone: String
  hvac_maint_vendor: String
  telco_contact_phone: String
  telco_provider: String
  gas_account: String
  gas_company: String
  gas_contact_phone: String
  gas_meter: String
  power_account: String
  power_company: String
  power_meter: String
  power_phone: String
  bird_nest_activity: bird_nest_activity
  local_fire_dept: String
  local_fire_dept_phone: String
  local_police_dept_phone: String
  contacts: [contacts]
  cell_num_list: [String]
  door_codes: String
  nss_switch: String
  lucent_switch: String
  remedy_site_id: String
  xing_id: String
  nss_site_id: String
  nss_site_id_2: String
  nss_site_id_3: String
  nss_site_id_4: String
  nss_site_id_5: String
  nss_site_id_6: String
  nss_site_id_7: String
  nss_site_id_8: String
  nss_site_id_9: String
  site_network_id: String
  siterra_id: String
  twr_led_main_strobe: String
  twr_led_side_lights: String
  twr_light_cont_mfr: String
  twr_light_cont_model: String
  twr_light_cont_serial: String
  twr_light_notes: String
  twr_light_type_fcc: String
  twr_light_type_vol: String
  twr_light_chap_fcc: String
  fcc_uls_twr_type: String
  das_ibr_ip: String
  tower_mast_amp: String
  call_sign: String
  pm_no_towerlight: String
  twr_light_mon_by: String
  lighting_test_period: String
  twr_light_vol_req: String
  twr_light_last_tested: String
  twr_light_next_test: String
  is_kgi: String
  is_twilight: String
  noc_ticket_severity: String
  noc_ticket_severity_display: String
  env_nocc_monitored: String
  node_types : JSON
  state_switch_cds: [String]
  xng_info: xng_info
  circuit_vendor: [circuit_vendor]
  man_lift_requirements:String
  rrh_antenna_access:String
  company_code:String
  is_donor: Boolean
  safety_rooftop_emp_access: String
  safety_night_lighting: String
  safety_fall_prot_req: String
  safety_ladder_sclimb_type: String
  safety_des_area_eqp_type: String
  safety_travel_restr_type: String
  safety_rooftop_notes: String
  safety_fall_prot_equip: String
  safety_equip_required: String
  safety_equip_tooltip: String
  safety_ladder_sclimb_type_oth: String
  osw_freeze: Boolean
  is_hazardous_site: Boolean
  hazard_type: String
  hazard_justification: String
}
type switch_response{
  switchdetails: Switch
}
type Switch{
  switch_unid: String
  switch_name: String
  latitude: String
  longitude: String
  area: String
  region: String
  market: String
  switch_clli: String
  address: String
  city: String
  state: String
  zip: String
  county: String
  brand: String
  phone: String
  callout_zone_name: String
  contacts:[SwitchContact]
  callout_zones: [Switchczone]
}
type Switchczone{
  cz_unid: String
  name: String
  period: String
  manager: String
  manager_id: String
  phone_no: String
  phone_no_2: String
  phone_no_mgr: String
  sms: String
  notes: String
  instructions: String

}
type SwitchContact{
  role: String
  name: String
  title: String
  email: String
  phone: String
  mgr_id: String
  tech_id: String
  altphone: String

}
type Preferences{
  isAdmin: String
}
type file{
  file_name: String
  file_type: String
  last_modified: String
  file_size: String
  file_Id: Int
}
type userObj {
  login_id: String,
  fname: String,
  lname: String,
  phone: String,
  email: String,
  status: String,
  role: String,
  cellview: String,
  switchview: String,
  market: String,
  preferences:JSON,
  isHybrid:Boolean,
  showRMA:Boolean
}

type FastUserCheckResponse {
  user:userObj
}

 type companyInfo {
            VDR_CMPNY_UNQ_ID: Int
            CMPNY_UUID: String
            VENDOR_ID: Int
            VENDOR_NAME: String
            VENDOR_CATEGORY: String
            VENDOR_AREA: String
            VENDOR_REGION: String
            VENDOR_PEOPLESOFTID: String
            VENDOR_SERVICE_EMAIL: String
            VENDOR_CONTACT_INFO: JSON
            VENDOR_ADDRESS: String
            VENDOR_CITY: String
            VENDOR_STATE:String
            VENDOR_ZIPCODE:String
            VENDOR_UUID: JSON
            VENDOR_SPONSORID: String
            VENDOR_SPONSER_EMAIL: String
            VENDOR_MDGID: String
            IS_VENDOR_DISABLED: String
            IS_VPAUTO_ENABLED: String
            IS_PRICING_MATRIX: Int
            IS_GROUP_VISIBILITY: Int
            CREATED_BY: String
            CREATED_DATE: String
            LAST_UPDATED_BY: String
            LAST_UPDATED_DATE: String
 }

 type companyinfoforvendorResponse{
  companyinfoforvendor:[companyInfo]
 }
 type CountforVPAutomation{
  VPAutomationCount:JSON
 }
 type marketsInfo
 {
            value: Int,
            market: String
 }

 type companyVendorInfo {
    VDR_CMPNY_UNQ_ID: Int
    CMPNY_UUID: String
    VENDOR_ID: Int
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
    VENDOR_SPONSORID:String
    VENDOR_SPONSER_EMAIL: String
    VENDOR_MDGID:String
    IS_VENDOR_DISABLED:String
    IS_VPAUTO_ENABLED:String
    IS_PRICING_MATRIX:Int
    IS_GROUP_VISIBILITY:Int
    CREATED_BY:String
    CREATED_DATE:String
    LAST_UPDATED_BY:String
    LAST_UPDATED_DATE:String

 }

 type getCompaniesInfoForAllVendorsResponse{
  companyinfoforvendorDetails:[companyVendorInfo]
  OSWVendors : [OSWVendorsInfo]
 }
 type OSWVendorsInfo{
  VENDOR_ID: Int
  MARKET: String
  SUB_MARKET: String
            
 }

 type getMarketsforGenRunReportResponse{
  data:[marketsInfo]
 }
 type subMarketInfo
 {
            value:Int,
            subMarket:String
 }
 type getSubMarketsforGenRunReportResponse{
  data:[subMarketInfo]
 }
 type Anteenadetails{
    sector:String,
    band_tech:String,
    ant_model_no: String,
    ant_azimuth_deg: String,
    ant_mech_deg: String,
    ant_height: String
 }
type AnteenaInfoResponse{
  enodeb_id:String,
  antenna_info:[Anteenadetails]
}

 type AnteenaInformation{
  site_unid:String,
  sectors:JSON,
  antenna_info_for_site:[AnteenaInfoResponse] 
 }

 type getAnteenaInformationResponse{
  towerdetails:AnteenaInformation
 }
 type switchInfo
 {
          value:Int,
          switch:String
 }

 type getSwitchesforGenRunReportResponse{
  data:[switchInfo]
 }
 type deviceInfo
 {
          value:Int,
          device:String
 }

 type getDevicesforGenRunReportResponse{
  data:[deviceInfo]
 }

 type genrunsdata {
  START_TIME: String
  STOP_TIME: String
  runType: String
  durationMinutes:Float
  totalMin: Float
  totalScheduledMin: Float
  totalEmergencyMin: Float
  totalMaintenanceMin: Float
}

 type getGenResultData
 {
          cellNumber:String
          cellName: String
          siteName: String,
          DEVICE_NAME: String,
          isMtso: Boolean,
          techName: String,
          USWIN: String,
          mdgId: String,
          schedules:JSON
          genruns: [genrunsdata]
              
 }

 type getGenRunResultResponse{
  status:String
  count:Int
  data:[getGenResultData]
 }

type schedfile{
  file_name: String
  file_type: String
  last_modified: String
  file_size: String
  file_Id: Int
  file_data: String
  preview: String
  filename: String
}
type ELogcomment{
  eLogInfoId: Int
  contenttext: String
  meta_createdby: String
  meta_createddate: String
  meta_createdname: String
}
type WorkRequestComment{
  eLogCommentsId: Int
  eLogInfoId: Int
  contenttext: String
  meta_createdby: String
  meta_lastupdatedate: String
  meta_createdname: String
  files : [file]
  hasAttachment : Boolean
}
type Hvac{
  hvac_unit_id: String
  unit_size: String
  refrigerant: String
  quantity: String
  quantity_units: String
  model: String
  comments: String
  unit_type: String
  serial_no: String
  eco_installed: String
  no_eco_reason: String
  economizer: EcomSpec
  install_date: String
  manufacture_date: String
  create_date: String
  update_date: String
  created_by: String
  updated_by: String
  hvac_pic_url: String
}
type User{
  userid: String
  name: String
  email: String
  phone: String
  role: String
}

type EcomSpec{
  type: String
  install_date: String
  functioning: String
}
type Generator{
  generator_id: String
  siterra_id: String
  generator_name: String
  gen_serial_no: String
  gen_comments: String
  gen_manufacture_date: String
  gen_fuel_type: String
  gen_type: String
  gen_location: String
  gen_use: String
  gen_in_out: String
  gen_size: String
  gen_install_date: String
  gen_startup_date: String
  gen_create_date: String
  gen_update_date: String
  gen_created_by: String
  gen_updated_by: String
  gen_status: String
  engine_manufacturer: String
  engine_model: String
  engine_power: String
  engine_manufacture_date: String
  engine_serial_no: String
  gen_field_permit: String
  gen_hour_meter_present: String
  gen_in_service: String
  gen_third_party: String
  gen_vzw_maintained: String
  gen_vzw_fueled: String
  gen_vzw_permit: String
  gen_runtime: String
  gen_annual_runtime: String
  gen_run_freq: String
  gen_nert_limit_imposed: String
  gen_nert_limit_type: String
  gen_nert_limit: String
  gen_spec: GeneratorSpec
  generator_pic_url: String
  fuel_tanks: [FuelTank]
}
type GeneratorSpec{
  manufacturer: String
  model: String
  fuel_type: String
  gen_size: String
  fuel_rt_25: String
  fuel_rt_50: String
  fuel_rt_75: String
  fuel_rt_100: String
  status: String
}
type FuelTank{
  fuel_tank_id: String
  fuel_type: String
  tank_type: String
  capacity: String
  install_date: String
}
type comment{
  eLogCommentsId: Int
  eLogInfoId: Int
  comments: String
  meta_createdby: String
  meta_lastupdatedate: String
  meta_createdname: String
  files : [file]
  hasAttachment : Boolean
}
type ELog{
  eLogInfoId : Int
  subject : String
  subjectId : String
  element : String
  elementId : String
  elogtype : String
  contenttext : String
  universalid : String
  meta_createdby : String
  meta_createdname : String
  meta_createddate : String
  meta_lastupdatedate : String
  red_flag : String
  unvalue : String
  privacyflag : String
  hours : String
  oncall : String
  shift : String
  subtype : String
  subtypeid : String
  subtypename : String
  worktype : String
  fromsystem : String
  changeControl : String
  vendor : String
  enodeB : String
  cellId : String
  carrier : String
  isAddToReport : String
  followUp : String
  files : [file]
  comments : [comment]
}

type file_uploaded {
  accessed:String
  file_name:String
  file_size:String
  file_url:String
  modified:String
}
type file_upload_error{
  code: Int
  message: String
  file_name:String
}
type IVROutput{
  message:String
  state_switch_cd:String
  generate_alarms:String
  cell_num:String
  login_reason:String
  login_reason_id:String
  login_description:String
  lockcode:String
}
type IVRLoginResponse{
  ivr_login:IVROutput
}
type IVRLogoutResponse{
  ivr_logout:IVROutput
}
type GenTank{


  gen_meta_universalid: String
  gen_emis_id: String
  gen_name: String
  serialnum: String
  manufacturer: String
  model: String
  description: String
  gen_size: String
  genmodel_fuel_type: String
  tank1_size: String
  tank2_size: String
  tank3_size: String
  tank4_size: String
  tank5_size: String
  tank6_size: String
  tank7_size: String
  tank8_size: String
  current_reading: [String]
  genrun_delta_time:String
  oil_level: String
  ac_voltage: String
  ac_current: String
}
type get_genTank_response{
  code:Int
  message:String
  genTank:[GenTank]
}
type Alarm{
  alertid:String
  amo_name:String
  description:String
  correlates_count:String
  count:String
  created:String
  updated:String
  severity:String
  name:String
  manager_name:String
  site_unid:String
  siteid:String
  cell_number:String
  site_name:String
  switch:String
  source:String
  alarmsource:String
  remedyticket:String
  device_name:String
  group_name:String
  techid:String
}
type UnMappedAlarm{
  amo_name:String
  description:String
  created:String
  updated:String
  severity:String
  market:String
  enodeb_id:String
  name:String
  manager_name:String
}
type AlarmResponse{
  alarms:[Alarm]
  unmapped_alarms:[UnMappedAlarm]
}
type DeviceTestHistory {
  test_type: String
  test_runs: [test_runs]
}
type test_runs {
  sequence_num: String
  vdu_active: String
  vdu_id: String
  test_status: String
  vdu_type: String
  triggered_on: String
  oam_gw_ip: String
  iLoIp: String
  user_id: String
  user_name: String
  user_type: String
  vendor_company: String
  vendor_id: String
  request_id: String
  log: String
}
type DeviceTestDetailsResponse {
  project_num: String
  vdu_type: String
  ping_test: [ping_test]
  firmware_upgrade: [firmware_upgrade]
  server_status: [server_status]
  vdu_info: [vdu_info]
}
type vdu_info {
  vdu_type: String
  vdu_id: String
  du_id: String
  ilo_ip: String
  oam_gw_ip: String
  hostname: String
  f1c_gw_ip: String
  edn_mgmt_ip: String
  edn_mgmt_gw: String
  oam_ip: String
}
type DeviceConfigViewResponse {
  req_details: deviceConfigViewObj
}
type deviceConfigViewObj {
  request_id: String
  enodeb_num: String
  enodeb_name: String
  enodeb_ip: String
  enodeb_model: String
  oam_ip: String
  action: String
  job_id: String
  config_txt: String
  job_status: String
  req_header: req_header
}
type req_header {
  enodeb_id: String
  site_unid: String
  action: String
  description: String
  status: String
  user_id: String
  wf_inst_id: String
  task_inst_id: String
  project_number: String
  validation_type: String
}
type DeviceTestResponse {
  deviceTestRequest: deviceTestRsp
  errors:[deviceErrType]
}
type issoResponse{
  emailsSent:[String]
  output : JSON
}
type HealthCheckResponse{
  errors : JSON
  enodeb_healthcheck : [healthCheck]
  HLTH_REQUEST_ID : [String]
  replace_antenna_work: String
}
type RetScanResponse{
  request_id : String
  errors: JSON
  message: String
}
type cqDataResponse{
 cfg_request : cfgCqData
 errors : JSON
}
type cfgCqData{
  hostname : String
  vdu_id: String
  ilo_ip: String
  f1c_gw_ip : String
  edn_mgmt_ip : String
  edn_mgmt_gw :  String
  oam_gw_ip:  String
  oam_ip:  String
  vdu_type :  String
  vdu_list : [VDU_Lists]
}
type MMUResponse{
  errors : JSON
  output : MMUpostOutput
}
type MMUpostOutput{
  user_id: String
  request_id: String
  message: String
}
type VDU_Lists{
  vdu_type : String
  vdu_id : String
  ilo_ip : String
  oam_gw_ip: String
  hostname: String
  f1c_gw_ip: String
  edn_mgmt_ip: String
  edn_mgmt_gw: String
  clusterName: String
  namespaceName: String
  oam_ip: String
}

type deviceTestRsp {
  project_num: String
  vdu_type: String
  ping_test: [ping_test]
  firmware_upgrade: [firmware_upgrade]
  server_status: [server_status]
  vdu_info: [vdu_info]
}
type ping_test {
  vdu_active: String
  vdu_type: String
  vdu_id: String
  triggered_on: String
  status: String
  oam_gw_ip: String
  iLoIp: String
  user_id: String
  user_name: String
  user_type: String
  vendor_company: String
  vendor_id: String
  log: String
}
type firmware_upgrade {
  vdu_active: String
  status: String
  vdu_type: String
  vdu_id: String
  oam_gw_ip: String
  triggered_on: String
  iLoIp: String
  user_id: String
  user_name: String
  user_type: String
  vendor_company: String
  vendor_id: String
  log: String
}
type server_status {
  enodeb_model: String
  enodeb_num: String
  test_status: String
  user_id: String
  user_name: String
  triggered_on: String
  vdu_type: String
  vendor_company: String
  vendor_id: String
  vdu_id: String
  log: String
}
input cqData{
  user_id : String
  cfg_request: cqDataRequest
}
input cqDataRequest{
  test_type : String
  vdu_type01 : String
  project_id : String
}
input validateData{
  user_id : String
  cfg_request : validationResponse
}
input validationResponse{
     project_id  : String
     clusterName : String
    namespaceName : String
    test_type : String
    oam_ip : String
    f1c_gw_ip : String
    vdu_type : String
    oam_gw_ip : String
    hostname : String
    vdu_id : String
    vdu_type01 : String
    edn_mgmt_ip : String
    edn_mgmt_gw : String
    ilo_ip : String
}
input healthReqBody{
  enodeb_ids : [String]
  req_type : String
  email_ids : [String]
  is_targeted : String
  targeted_option : [String]
  command_list : String
  command_list_5g : String
  created_by : String
  workorderid : String
  site_name : String
  work_request_type : String
  user_id : String
  user_name : String
  vendor_id : String
  vendor_company : String
  phone_no : String
  sector_lock_unlock_req_id : String
  created_by_name : String
  last_updated_by : String
  comments: String
  replace_antenna_work: String
}

  input retScanReqBody{
  nodeId : String
  siteUnid : String
  OSW_ID : Int
  reqType : String
  source : String
  userId : String
  fullScan : Boolean
  sector : String
  notes : String
}

input addressPayload{
  address: String
  latitude:String
  longitude: String
  mdg_id: String
  vendor_name:String
  metaUniversalId:String
  createdBy:String
  psLoc:String
  modifiedBy:String
  modifiedOn:String
  createdOn:String
}
input vduReplace{
  user_id : String
  cfg_request : vduReplaceCFG
}
input vduReplaceCFG{
  config_type : String
  sel_config : [selConfig]
}
input selConfig{
  du_id : String
  project_id : String
}
type DispatchAddressResponse{
  resultmessage : String
}
input deviceReqBody {
  request_type: String
  test_type: String
  site_type: String
  site_unid: String
  band_type: String
  device_bandId: String
  project_id: String
  market: String
  submarket: String
  vendor_id: String
  vendor_company: String
  user_id: String
  user_name: String
  created_by: String
}
input updateListObj {
                  PM_LIST_ITEM_ID:Int
                  PM_LIST_ID:Int
                  PM_ITEM_DUE_DATE:String
                  PM_COST:String
                  INCLUDED_IN_PMLIST:String
                  LAST_UPDATED_BY:String
                  ACTION:String
                  PM_ITEM_STATUS:String
                  SCHEDULED_DATE:String
                  declinedComment:String
              }
input updateScheduleDate{
  pmListitemsCount:String
  updateList: [updateListObj],
  addList: [String],
  pmList: [String]
}
input atoll_info_input {
  atoll_info: [updateSerialNumberPayload]
}
input updateSerialNumberPayload {
  SI_ATOLL_INFO_5GR_ID: String
  PROJECT_NUMBER: String
  UNITSERIALNUMBER: String
  SERVINGDONORSERIALNO: String
  DONORGNODEBID: String
  UNITTYPE: String
  DONORBANDINFO: String
  DONORBANDCLASS: String
  DONORGNBDUID: String
  DONORGNBDUNUMBER: String
  REPEATERMANUFACTURER: String
  REPEATERMODEL: String
}
input createPMListInput{
  createList: createListInputType
}
input updateScheduleDatereq{
  source : String
  pmListitemsCount:String
  updateList: [updateListObj],
  addList: [String],
  pmList: [pmListVzReview]
}
input pmListVzReview { 
  ps_poll_ind:String
  pm_list_status:String
  po_status:String
  po_num:String
  pm_list_id:Int 
  productCode:String
  applyPMVendor:String
  notify_poTeam:String 
  last_updated_by:String
  buyer:String
}

input createListInputType{
  pmList: pmListInputType
  siteOrSwitchList: [siteOrSwitchListInputType]
}
input pmListInputType{
                  pm_list_year:String
                  pm_type   :String          
                  frequency :String           
                  market :String           
                  sub_market:String            
                  pm_group :String            
                  manager:String                
				          manager_id :String           
                  location_type:String            
                  ps_item_id:String    
                  mmid :String        
                  buyer  :String           
                  buyer_id :String           
                  emp_id :String     
                  enterprise_id : String
                  createdBy_EID: String
                  modifiedBy_EID:String      
                  creator :String            
                  approver :String          
                  vendor_id :String           
                  vendor_name :String            
                  vendor_psid :String  
                  vendor_mdgid :String            
                  po_bu  :String          
                  cost_center :String           
                  product_cd :String           
                  expense_proj_id:String  
                  wbs_element : String          
                  po_email_distro :String           
                  po_num :String            
                  pm_list_status :String           
                  ps_poll_ind :String          
                  po_entered_date :String          
                  apply_pm_vendor:String           
			            is_list_completed :String          
				          is_vendor_requested :String          
				          buyer_email :String           
				          vendor_email :String          
				          manager_email :String           
				          associated_type_id :[String]
}

input siteOrSwitchListInputType{
            name  :String        
            status :String        
            unid:String         
            ps_loc_id :String         
            switch_name :String  
            locus_id : String        
            location_manager:String          
            location_manager_id :String         
            fe :String        
            fe_id  :String       
            emp_id :String   
            enterprise_id :String
            buyer_email :String    
            manufacturer :String  
            mdg_id : String      
            mmid: String
            company_code: String
            soa :String         
            pm_cost :String        
            pm_item_start_date:String         
            pm_item_due_date :String        
            pm_item_status :String        
            default_pm_vendor_id :String      
            default_pm_vendor_name :String       
            site_priority :String     
            equipment_status :String       
            site_callout_zone :String       
            included_in_pmlist :String     
		      	po_item_id  :String      
 		      	description :String       
			      total_cost :String     
            scheduled_date:String 
            po_item_description:String
}
input inspectionResultType
  {
                PM_LIST_ID:Int  
                PM_LIST_ITEM_ID:Int  
                POLE_UNID:String  
                INSPECTION_UNID:String  
                INSP_TYP:String  
                INSP_STATUS:String  
                INSP_COMPLETION_DATE:String  
                INSP_TECH:String  
                INSP_VENDOR_ID:String  
                INSP_COMMENTS:String  
                DEVIATION_FOUND:String  
                LAST_UPDATED_BY:String 
                RMV_DEVIATIONS: String 
            }
input deviationResultType {
                INSPECTION_UNID:String 
                POLE_UNID:String 
                DEVIATION_ID:Int 
                DEVIATION_NAME:String 
                DEVIATION_OWNBYVZ:String 
                DEVIATION_STATUS:String 
                OTHER_DEVIATION_OWNERS:String 
                REMEDIATION_LEVEL:String 
                DEVIATION_COMMENTS:String 
                REMEDIATION:String 
                REMEDIATION_STATUS:String 
                REMEDIATION_COMMENTS:String 
                REMEDIATION_ACCPT:String 
                REMEDIATION_ACCPT_BY:String 
                REMEDIATION_ACCPT_DATE:String 
                LAST_UPDATED_BY:String 
            }
input opsTrackerCreateReqBodyInput{
    recordtype:String 
    retrieve:String 
    retrieveformat:String 
    data: opstrakerDataInput
  }
input opstrakerDataInput{
        pole_unid:String 
        status:String 
        po_num:String 
        inspection_type:String 
        inspection_date:String 
        inspection_tech_name:String 
        vendor_id:String 
        deviations_found:String 
        pole_latitude:String 
        pole_longitude:String 
        notes:String 
        cfd_deviations: [
            cfd_deviations_input
        ]
      }
input cfd_deviations_input{
                deviation:String 
                deviation_owners:String 
                deviation_status:String 
                deviation_comments:String 
                remediation_level:Int 
                remediation:String 
                remediation_complete_date:String 
                remediation_status:String 
                remediation_comments:String 
                remediation_accepted_date:String 
                remediation_accepted_by:String 
            }
input InspectionInfoInputType{
 inspectionResult: [inspectionResultType]
 deviationResult: [deviationResultType]
 
}
input updatedDataTower{
  inspectionDetailsDel:String
  inspectionSummary:[inspectionSummaryTower]
  inspectionDetails:[inspectionDetailsTower]
}
input inspectionDetailsTower{
  INSPECTION_UNID:String
  EQUIPMENT_UNID:String
  ATTRIBUTE_ID:Int
  ATTRIBUTE_NAME:String
  ATTRIBUTE_VALUE:String
  ATTRIBUTE_CATEGORY:String
  ATTRIBUTE_SUBCATEGORY:String
  ATTRIBUTE_FIELDS:String
  ATTRIBUTE_COMMENTS:String
  LAST_UPDATED_BY:String
}
input inspectionSummaryTower{
                    PM_LIST_ID:Int
                    PM_LIST_ITEM_ID:Int
                    SITE_UNID:String
                    EQUIPMENT_UNID:String
                    EQUIPMENT_TYPE:String
                    MDG_ID:String
                    INSPECTION_UNID:String
                    OPSTRACKER_UNID:String
                    INSP_STATUS:String
                    INSP_COMPLETED_BY:String
                    INSP_COMPLETED_DATE:String
                    INSP_COMMENTS:String
                    LAST_UPDATED_BY:String
                    VENDOR_ID:String
                    HVAC_CONTROLLER_TYPE:String
                    HVAC_CONTROLLER_MODEL:String
}
input opsTrackerCreateReqBodyTowerInp{
            recordtype:String
            retrieve:String
            retrieveformat:String
            data: TowerDataOps
}
input cfd_minormaintenance_typ{
            itemid: Int
            itemname:String
            cost:String
            quantity:String
            itemtotalcost:String

}
input TowerDataOps{
  site_universalid:String
  status:String
  po_number:String
  inspection_type:String
  inspection_date:String
  inspection_tech_name:String
  vendor_id:String
  remediation_required:String
  crit_items_found:String
  OBS_POT_IMPACTING:String
  OBS_NON_IMPACTING:String
  impacting_items_found:String
  struct_manufacturer:String
  struct_model:String
  tower_highest_point:String
  safety_climb_safe:String
  safety_climb_mfr:String
  comments :String
  cfd_minormaintenance:[cfd_minormaintenance_typ]
}
input towerInspItemsInput{
  output: towerOutpType
  siteInfo: siteInfoPdfType
}
input genInspItemsInput{
  pmListData: pmListDataGenPDF
  pmItemInfo:pmItemInfoGenPDF
  attributeData:[attributeDataGenPDF]
  sitesInfo:[sitesInfoGenPDF]
}
input submarketd{
  PM_LIST_ID:Int
  MARKET:String
  MANAGER_ID:String
  SUB_MARKET:String
  PM_ITEM_UNID:String
}
input hvacInspItemsInput{
pmListData: pmListDataGenPDF
pmItemInfo:pmItemInfoGenPDF
submarketUnidData:submarketd
sitesInfo:[sitesInfoHvacpdf]
attributeData:[towerAttrType]

}

input go95InspItemsInput {
  data: go95innerInput  
}
input go95innerInput {
  getGO95PoleInfo: go95actualinput
}
input go95actualinput{
  poleAttributeData: [poleAttributeDataInp]
  go95DeviationsRefData: [GO95RefDataInp]
  poleData:[poleDataInp]
  attachmentList:[String]
}
input poleAttributeDataInp {
         INSP_UNQ_ID:String
        PM_LIST_ID:String
        PM_LIST_ITEM_ID:String
        POLE_UNID:String
        INSPECTION_UNID:String
        INSP_TYPE:String
        INSP_STATUS:String
        INSP_COMPLETION_DATE:String
        INSP_TECH:String
        INSP_VENDOR_ID:String
        INSP_COMMENTS:String
        DEVIATION_FOUND:String
        LAST_UPDATED_BY:String
        LAST_UPDATED_DATE:String
        OPSTRCK_INSP_UNID:String
        DEVIATION_ID:String
        DEVIATION_NAME:String
        DEVIATION_OWNBYVZ:String
        DEVIATION_STATUS:String
        OTHER_DEVIATION_OWNERS:String
        DEVIATION_COMMENTS:String
        REMEDIATION:String
        REMEDIATION_LEVEL:String
        REMEDIATION_STATUS:String
        REMEDIATION_COMMENTS:String
        REMEDIATION_ACCPT:String
        REMEDIATION_ACCPT_BY:String
        REMEDIATION_ACCPT_DATE:String
        OPSTRCK_DEVIATION_UNID:String
        OPSTRCK_REMEDIATION_UNID:String
	      INSPECTION_UNID:String
        EQUIPMENT_UNID:String
        ATTRIBUTE_ID:Int
        ATTRIBUTE_NAME:String
        ATTRIBUTE_VALUE:String
        ATTRIBUTE_CATEGORY:String
        ATTRIBUTE_SUBCATEGORY:String
        ATTRIBUTE_FIELDS:String
        ATTRIBUTE_COMMENTS:String
        LAST_UPDATED_BY:String
}
input equipmentInfoInp{
            pole_unid: String
            structure_type: String
            structure_owner: String
            pole_type:String
            structure_height:String
            pole_row_private: String
            last_pole_patrol_insp: String
            next_pole_patrol_insp: String
            last_pole_detailed_insp: String
            next_pole_detailed_insp: String
          }
input GO95RefDataInp{
        DEVIATION_ID: String
        DEVIATION_DESC: String
        DEVIATION_LABEL: String
        INSP_GROUP: String
        REMEDIATION_LEVEL: String
        REMEDIATION: String
        LAST_UPDATED_BY: String
        LAST_UPDATED_DATE: String
}
input poleDataInp{
        SITE_UNID: String
        SITE_ID: String
        SITE_NAME: String
        PS_LOCATION_ID: String
        SITE_PRIORITY: String
        SITE_STATUS: String
        SITE_TYPE: String
        SITE_ONAIR_DATE: String
        SITE_LATITUDE: String
        SITE_LONGITITUDE: String
        SITE_ADDRESS: String
        SITE_CITY: String
        SITE_STATE: String
        SITE_COUNTY: String
        SITE_ZIPCODE: String
        SWITCH: String
        SITE_MANAGER_ID: String
        SITE_MANAGER_NAME: String
        SWITCH_MANAGER_ID: String
        SWITCH_MANAGER_NAME: String
        SITE_TECHID: String
        SITE_TECH_NAME: String
        LAST_ACTIVITY_TRACKER: String
        LAST_UPDATED_BY: String
        LAST_UPDATED_DATE: String
        MARKET: String
        SUB_MARKET: String
        EQUIPMENT_TYPE: String
        EQUIPMENT_INFO: [
          equipmentInfoInp
    ]
}

input pdfquipinput{
manufacturer:String
install_date:String
serial_number:String
economizer_type:String
unit_type:String
unit_size:String
model:String
refrigerant:String
hvac_unit_id:String
}
input vendorassninput{
vendor_id:Int
vendor_name:String
peoplesoft_id:String
pm_category:String
}
input sitesInfoHvacpdf{
address:String
city:String
county:String
equipmentinfo:[pdfquipinput]
hvac_contact_phone:String
hvac_controller_mfr:String
hvac_controller_model:String
hvac_controller_type:String
latitude_decimal:String
longitude_decimal:String
manager_id:String
manager_name:String
meta_universalid:String
mdg_id:String
network_id:Int
ps_loc:String
shelter_vendor:String
site_callout_zone:String
site_id:String
site_name:String
site_priority:Int
site_status:String
site_type:String
soa:String
st:String
switch:String
switch_manager_id_1:String
switch_manager_id_2:String
switch_manager_name_1:String
switch_manager_name_2:String
tech_id:String
tech_name:String
vendorassignments: [vendorassninput]
zip:String
}
input sitesInfoGenPDF{
            address:String
            city:String
            county:String
            equipmentinfo:[String]
            hvac_contact_phone:String
            hvac_controller_mfr:String
            hvac_controller_type:String
            hvac_controller_model:String
            latitude_decimal:String
            longitude_decimal:String
            manager_id:String
            manager_name:String
            meta_universalid:String
            mdg_id:String
            network_id:Int
            ps_loc:String
            shelter_vendor:String
            site_callout_zone:String
            site_id:String
            site_name:String
            site_priority:Int
            site_status:String
            site_type:String
            soa:String
            st:String
            switch:String
            switch_manager_id_1:String
            switch_manager_id_2:String
            switch_manager_name_1:String
            switch_manager_name_2:String
            tech_id:String
            tech_name:String
            vendorassignments: [String]
            zip:String
}
input attributeDataGenPDF{
            PM_ITEM_RESULT_ID:String
            PM_TEMPLATE_ID:Int
            PM_TMPLT_ATTR_NEW_VALUE_SENT:String
            PM_TMPLT_ATTR_ID:Int
            PM_TMPLT_ATTR_NAME:String
            PM_TMPLT_ATTR_OLD_VALUE:String
            PM_TMPLT_ATTR_NEW_VALUE:String
            PM_TMPLT_ATTR_FLD_LBLMAP:String
            IS_MANDATORY:String
            PM_TMPLT_ATTR_FLD_TYPE:String
}
input pmListDataGenPDF{
        PM_LIST_NAME :String
        PM_LIST_ID :String
        FREQUENCY :String
        EXPENSE_PROJ_ID :String
        COST_CENTER :String
        PO_BU :String
        MANAGER_ID :String
        PO_ENTERED_DATE :String
        PO_EMAIL_DISTRO :String
        BUYER :String
        PRODUCT_CD :String
        VENDOR_ID :String
        VENDOR_NAME :String
        PM_TYPE_ID :Int
        PM_LIST_STATUS :String
        PO_STATUS :String
        PO_NUM :String
        PS_ITEM_ID :String
        MMID :String
        PM_LIST_STATUS_1 :String
        CREATER :String
        CREATED_DATE :String
        PS_POLL_IND :String
        PM_LIST_STATUS_2 :String
        APPLY_PM_VENDOR :String
        NOTIFY_POTEAM :String
        BUYER_ID :String
        EMP_ID :String
        PM_ATTACHMENTS_ID :String
        PM_FILE_NAME :String
        PM_FILE_CATEGORY :String
        PM_FILE_TYPE :String
        ASSOCIATED_TYPE_ID :String
        VENDOR_EMAIL :String
        IS_COMPLETED :String
        IS_VENDOR_REQUESTED :String
        PM_GROUP :String
        BUYER_EMAIL :String
        MANAGER_EMAIL :String
}
input pmItemInfoGenPDF{
        PM_EQUIPMENTS_COUNT :String
        EQUIPMENT_UNIT_SIZE :String
        SITE_TYPE :String
        LAST_COMPLETED_DATE :String
        PM_LIST_ID: Int,
        PM_ITEM_COMPLETED_DATE :String
        COMPLETED_BY :String
        PM_LIST_ITEM_ID :String
        PO_ITEM_ID :String
        DESCRIPTION :String
        PM_LIST_ITEM_ID_PS: Int,
        SWITCH_NAME :String
        PM_LOCATION_NAME :String
        PM_SITE_ID :String
        PS_LOCATION_ID :String
        PM_LOCATION_UNID :String
        PM_ITEM_STATUS :String
        PM_EQUIPMENT_MAKER :String
        PM_LOCATION_STATUS :String
        FIELDENGINEER :String
        LOCATION_PRIORITY :String
        EQUIPMENT_STATUS :String
        PM_COST :String
        LINE :String
        SCHEDULE :String
        LINE_SCH_MATCH_STATUS :String
        PM_ITEM_DUE_DATE :String
        PO_ITEM_DESCRIPTION :String
        PM_ITEM_START_DATE :String
}
input towerOutpType {
  
  towerAttributeData:[towerAttrType]
  towerAttributeDataFromOpstracker:towerDataOpstrk
  attachmentList: [towerAttachType]
  towerinspectionsRefData: [towerinspRefDataType]
  towerData: [towerOutputDataType]
  
  
}
input siteInfoPdfType{
  vendorId:String
  vendorName:String
}
input towerAttrType{
  PM_LIST_ITEM_ID:String
  PM_LIST_ID:String
  LINE:String
  MDG_ID:String
  SCHEDULE:String
  PM_LOCATION_NAME:String
  PM_LOCATION_UNID:String
  PS_LOCATION_ID:String
  LOCATION_MANAGER:String
  LOCATION_MANAGER_ID:String
  FIELDENGINEER:String
  FIELDENGINEER_ID:String
  PM_COST:String
  PM_ITEM_START_DATE:String
  PM_ITEM_DUE_DATE:String
  PM_ITEM_STATUS:String
  PM_ITEM_COMPLETED_DATE:String
  COMPLETED_BY:String
  EQUIPMENT_UNID:String
  SCHEDULED_DATE:String
  EQUIPMENT_TYPE:String
  OPSTRACKER_UNID:String
  INSP_COMMENTS:String
  INSP_STATUS:String
  INSP_COMPLETED_BY:String
  INSPECTION_UNID:String
  ATTRIBUTE_ID:String
  ATTRIBUTE_NAME:String
  ATTRIBUTE_VALUE:String
  ATTRIBUTE_CATEGORY:String
  ATTRIBUTE_SUBCATEGORY:String
  ATTRIBUTE_FIELDS:String
  ATTRIBUTE_COMMENTS:String
  LAST_UPDATED_BY:String
  LAST_UPDATED_TIME:String
  }
  input towerDataOpstrk{
    cfd_gam_currentdoc_description: String
    comments: String
    crit_items_found: String
    impacting_items_found: String
    inspection_date: String
    inspection_tech_name: String
    meta_createdby: String
    meta_createddate: String
    meta_lastupdateby: String
    meta_lastupdatedate: String
    meta_universalid: String
    obs_non_impacting: String
    obs_pot_impacting: String
    po_number: String
    remediation_required: String
    safety_climb_mfr: String
    safety_climb_safe: String
    site_universalid: String
    status: String
    struct_manufacturer: String
    struct_model: String
    tower_highest_point:String
    vendor_id: String

  }
  input towerAttachType{
    recordtype:String
    source_universalid:String
    meta_universalid:String
    file_name:String
    file_size:String
    file_modifieddate:String
    category:String
    description:String
  }
  input towerinspRefDataType{
  
    PM_TYPE_ID:String
    ATTRIBUTE_TYPE:String
    ATTRIBUTE_CATEGORY:String
    ATTRIBUTE_NAME:String
    ATTRIBUTE_VALUE:String

}
input towerOutputDataType{
  
  SITE_UNID:String
  SITE_ID:String
  SITE_NAME:String
  PS_LOCATION_ID:String
  SITE_PRIORITY:String
  SITE_STATUS:String
  SITE_TYPE:String
  SITE_ONAIR_DATE:String
  SITE_LATITUDE:String
  SITE_LONGITITUDE:String
  SITE_ADDRESS:String
  SITE_CITY:String
  SITE_STATE:String
  SITE_COUNTY:String
  SITE_ZIPCODE:String
  SWITCH:String
  SITE_MANAGER_ID:String
  SITE_MANAGER_NAME:String
  SWITCH_MANAGER_ID:String
  SWITCH_MANAGER_NAME:String
  SITE_TECHID:String
  SITE_TECH_NAME:String
  LAST_ACTIVITY_TRACKER:String
  LAST_UPDATED_BY:String
  LAST_UPDATED_DATE:String
  MARKET:String
  SUB_MARKET:String
  EQUIPMENT_TYPE:String
  EQUIPMENT_INFO: [
    equipmentInfoTower
  ]
  }
  input equipmentInfoTower{
    
      tower_managed_by:String
      tower_struct_last_inspection:String
      tower_struct_inspect_by:String
      tower_struct_next_inspection:String
      towertype:String
      
  }
input TowerInspectionInfoInput{
  updatedData:updatedDataTower
  opsTrackerCreateReqBody:opsTrackerCreateReqBodyTowerInp
  opsTrackerUpdateReqBody:String
}
input InspectionInfoInput{
  updatedData:InspectionInfoInputType
  opsTrackerCreateReqBody: opsTrackerCreateReqBodyInput
  opsTrackerBulkUpdateReqBody:String

	opsTrackerUpdateReqBody: opsupdateType
}
input opsupdateType{
                    meta_universalid: String
                    recordtype: String
                    retrieve: String
                    retrieveformat: String
                    data: opsDataType
                }
input opsDataType{
                        status: String
                        notes: String
                        cfd_deviations: [ops_cfd_devType]
                    }
input ops_cfd_devType{
                            meta_universalid: String
                            deviation: String
                            deviation_owners: String
                            deviation_status: String
              deviation_comments: String
              remediation_level:String
              remediation: String
              remediation_complete_date:String
							remediation_comments: String
              remediation_status:String
              remediation_accepted_date:String
              remediation_accepted_by:String
                        }
input PMDetailsInput{
  updatedData:[PMDetailsInputType]
}
input uploadFilesInput{
  fileList:[uploadFilesInputType]
}
input uploadFilesInputWO{
  files:[uploadFilesInputTypeWO]
}
input uploadFilesInputTypeWO{
  data:String
  description:String
  size:String
  name:String
}
input uploadFilesInputGO95{
  files:[uploadFilesInputTypeGO95]
}
input createReqBodyInput{
  createReqBody: createReqBodyType
}
input submitAttachmentInput{
  attachmentreqBody: attsReqBodyType
}
input attsReqBodyType{
files: [filesArr]
uploaded_by:String
}
input filesArr{
  
                vp_req_id:String   
                source:String
               file_name:String
               file_size:String
               file_content:String
            
}

input submitNotesInput{
  notesreqBody: notesReqBodyType
  notesAddedBy: notesAddedByType
}
input notesAddedByType{
  user_id:String
  phone: String
}

input notesReqBodyType{
         site_unid:String
		 vp_req_id:String  
         text:String
		 source:String
         created_by:String
}
input unLockreqBodyInput{
  unLockreqBody: createReqBodyType
}

input gcInfoTypeInput{
            gc_tech_id:String
            gc_user_id:String
            name:String 
            company:String
            phone:String
            email:String
         }
input workInfoTypeInput {
            work_type:String
            work_id:String
            work_info:String
         }
         input createReqBodyType{
          type:String 
          site_type:String
          site_name:String
          market:String
          submarket:String
          source:String
          status:String
          gc_info: gcInfoTypeInput
          site_unid:String
          switch_unid:String
          description:String
          non_service_impacting:String
          is_vendor_trained:String
          lock_params:[lockParamsType]
          notify_email_address:[String]
          include_work_info:String
          work_info:workInfoTypeInput
          requested_by:String
          vendor_id:String
          category:String
          replace_antenna_work: String
          is_vendor_trained: String
          opscalender_eventid: String
          kirke_id: String
          event_start_date: String
          event_end_date: String,
          vendor_mdg_id: String
          node_vendor: String
       }
input lockParamsType {
    enodeb:String
    radio:[String]
    lncell:[String]
    vendor:String
}      
input QuotesInput{
    vendor_id:String
    quotetotal:String
    materialssubtotal:String
    laborsubtotal:String
    genfuelsubtotal:String
    quotecomments:String
    meta_universalid:String
    quoteaction:String
}

input uploadFilesInputType{
    PM_LIST_ID:Int
    ASSOCIATED_PM_LISTS:String
    PM_LIST_ITEM_ID:Int
    PM_LOCATION_UNID:String
    PM_FILE_CATEGORY:String
    PM_FILE_NAME:String
    PM_FILE_TYPE:String
    PM_FILE_SIZE:String
    PM_FILE_DATA:String
    LAST_UPDATED_BY:String
   
}
input uploadFilesInputTypeGO95{
    name:String
	description:String
	size:String
	data:String
   
}
input postRequestItemGen{	
    PO_NUM:String	
    PM_TYPE:String	
    SITE_ID:String	
    MDG_ID:String
    PO_LINE_NUM:String
    PS_LOCATION_ID:String	
    manufacturer:String
    ac_voltage:String
    ac_current:String
    model:String
    serialnum:String
    oil_level:String
    fuel_type1:String
    fuel_tank1:String
    fuel_level1:String
    fuel_total1:String
    	
}	
input postRequestItem{	
  HVAC_CONTROLLER_TYPE:String
    HVAC_CONTROLLER_MODEL:String
  PO_NUM:String	
    PM_TYPE:String	
    SITE_ID:String	
    MDG_ID : String
    PO_LINE_NUM : String
    PS_LOCATION_ID:String	
    MODEL_1:String	
    SERIAL_1:String	
    SIZE_1:String	
    TYPE_1:String	
    REFRIGERENT_1:String	
    MODEL_2:String	
    SERIAL_2:String	
    SIZE_2:String	
    TYPE_2:String	
    REFRIGERENT_2:String
      MODEL_3:String	
    SERIAL_3:String	
    SIZE_3:String	
    TYPE_3:String	
    REFRIGERENT_3:String
    MODEL_4:String	
    SERIAL_4:String	
    SIZE_4:String	
    TYPE_4:String	
    REFRIGERENT_4:String
    MODEL_5:String	
    SERIAL_5:String	
    SIZE_5:String	
    TYPE_5:String	
    REFRIGERENT_5:String
    PS_LOCATION_NAME:String    	
}	

input postRequestGen{	
  postRequestItems: [postRequestItemGen]	
    	
}
input postRequest{	
  postRequestItems: [postRequestItem]	
    	
}
input submitFPInvoiceInp{
  updateReqBody: updateReqBodyInputFPInvoice
  
}
input updateReqBodyInputFPInvoice{
  data: FPInvoiceDataInp
}
input submitFPQuoteInvoiceInp{
  updateReqBody: updateReqBodyInputFP
  
}
input linkExistingVendorToNewCompanyInp{
  data: dataLinkedUser
}
input dataLinkedUser{
        email:String
        to_link_vendor_id:String
        to_link_vendor_name:String
        to_link_vendor_region:String
        to_link_vendor_sponser_email:String
        created_by:String
        ivr_status:String
}
input saveDeviceToEnodebInp{
  data: [dataCband]
}
input dataCband{
      SITE_UNID:String
      SITE_ID:String
      SITE_NAME:String
      PROJECT_NUMBER:String
      PROJECT_TYPE:String
      PROJECT_STATUS:String
      PS_LOCATION_ID:String
      SECTOR_ID:String
      ENODEB_ID:String
      SERIAL_NUMBER:String
      USER_ID:String
      COMMENTS:String
      VENDOR_ID:String
      VENDOR_NAME:String
      LAST_UPDATED_BY:String
      SOURCE:String
}
input updateReqBodyInputFP{
  data: FPQuoteDataInp
}
input FPInvoiceDataInp{
  invoicetotal:Float
    invoicematerials:Float
    invoicelabor:Float
    invoicegenfuel:Float
    invoicerental:Float
    invoicecomments:String
    vendor_invoice_num:String
    disaster_recovery:String
    product_code : String
    event_name : String
    minormaterial_supplier: [materialSupplier]
    lineitems:[FPQuoteslineItemInp]
}

input materialSupplier{
  bid_unit: String
  supplier: String
}

input FPQuoteDataInp{
  quotetotal:Float
  materialssubtotal:Float
  laborsubtotal:Float
  genfuelsubtotal:Float
  rentalsubtotal:Float
  quotecomments:String
  disaster_recovery: String
  event_name : String
  product_code : String
    lineitems:[FPQuoteslineItemInp]
}
input FPQuoteslineItemInp{
            unid:String
            cost_type:String
            ps_item_id:String
            bid_unit:String
            work_type:String
            cost_cat:String
            service_type:String
            unit:String
            ppu:String
            long_desc:String
            fixed:String
            qty:String
            total:String
            notes:String
            deleteme:String
            mmid:String
            fuze_line_id : String
            fuze_line_num : String
            is_matrix:String
            supplier:String
            vp_line_num :String 
}
input PMDetailsInputType{
    PM_LIST_ID:Int
    PM_LIST_ITEM_ID:Int
    PM_TEMPLATE_ID:Int
    PM_TMPLT_ATTR_ID:Int
    PM_TMPLT_ATTR_NAME:String
    PM_TMPLT_ATTR_UNID:String
    PM_TMPLT_ATTR_OLD_VALUE:String
    PM_TMPLT_ATTR_NEW_VALUE:String
    PM_TMPLT_ATTR_NEW_VALUE_SENT:String
    PM_TMPLT_ATTR_ACTION:String
    LAST_UPDATED_BY:String

    
}
input InvoiceInput{
    vendor_id:String
    invoicetotal:String
    invoicematerials:String
    invoicelabor:String
    invoicegenfuel:String
    invoicecomments:String
    vendor_invoice_num:String
    meta_universalid:String
}
input VendorInput {
  email : String
  fname : String
  lname : String
  phone : String
  title : String
  vendor_id : Int
  vendor_role : String
  contact_unid:String
  created_by:String
}
input UpdateInput {
  vendorCompanyUniqueIDS:JSON
  auto_vp_Status:String
  updated_by:String
}
input ElogFileInput{
  file_Id:Int
  file_data: String
  file_name: String
  file_size: String
  file_type: String
  last_modified: String,
  preview: String
}
input ELogInput{
  eLogInfoId:Int
  oprtnType : String
  shift : String
  contenttext : String
  subject : String
  sendemail : String
  privacyflag : String
  emailid : String
  red_flag : String
  element : String
  oncall : String
  isAddToReport : String
  files : [ElogFileInput]
  elogtype : String
  login_id : String
  universalid : String
  unvalue : String
  meta_createdname : String
  recorded_on : String
  subtype : String
  subtypename : String
  subtypeid : String
  worktype : String
  fromsystem : String
  vendor : String
  enodeb : String
  carrier : String
  cellid : String
}

input ELogComment{
  eLogCommentsId: Int
  eLogInfoId: Int
  comments: String
  meta_createdby: String
  meta_lastupdatedate: String
  meta_createdname: String
  from_system : String
  fileData :[ElogFileInput]
}
input quote_file{
    filename:String
    filetype:String
    file_size:String
    content:String
    category:String
    preview:String
    last_modified:String
    vendorWorkorderLineItemId:String
}
input file_input{
  files:[quote_file]
  quote_unid:String
}



input file_inputvwrs{
    files: fileType
    quote_unid:String
}
input fileType{
  files: [quote_file]
}
input schedfileinput{
  file_name: String
  file_type: String
  last_modified: String
  file_size: String
  file_data: String
  file_Id: Int
  preview: String
  filename: String
}
input submitupdateschedfileinput{
  file_name: String
  file_type: String
  last_modified: String
  file_size: String
  file_data: String
  file_Id: Int
  preview: String
  filename: String
}
input IVRLoginInput{
  loginId:String
  state_switch_cd:String
  generate_alarms:String
  cell_num:String
  login_reason:String
  login_reason_id:String
  login_description:String
}
input IVRLogoutInput{
  loginId:String
  state_switch_cd:String
  generate_alarms:String
  cell_num:String
}
input IVRLogin{
  ivr_login:IVRLoginInput
}
input IVRLogout{
  ivr_logout:IVRLogoutInput
}
input wo_status_change_input{
  vendor_status:String
  vendor_status_comments:String
  vendor_grade_comments:String
  userid:String
  vendor_wo_unid:String
  site_unid:String
  work_completed:String
  work_completed_comments:String
}
input ivr_request_input{
  sponsor:String
  userId:String
  phone: String
  subMarketList:[String]
  userLastName:String
  vendorId:String
  userFirstName:String
  accountLocked:Boolean
  email:String
  login:String
  managerName: String
  managerPhone: String
}
input vendor_comp_input{
  companyName:String
  vendorId:String
  login:String
}
input ivr_request_mulMarket{
  vendorId: String
  submarkets: [String]
  login: String
}
input ivr_email_request{
  attachments:[Attachment_schema]
  body: String
  from: String
  recipients: [String]
  sourceName: String
  subject: String
  transactionId: String
}
input Attachment_schema {
  fileExtension: String
  fileIn64Form: String
  fileName: String
}
input wo_request_input{
  requested_by:String
  requested_date:String
  requestor_title:String
  company_code:String
  requestor_email:String
  requestor_phone:String
  disaster_recovery : String
  event_name : String
  wbs_id: String
  product_code: String
  acct_contact:String
  acct_email:String
  exp_market_proj_id:String
  mgr_email:String
  site_type:String
  site_key:String
  priority:String
  work_type:String
  work_scope:String
  eng_review_required:String
  bypass_approval:String
  cfd_workorder_lines: Int
  cfd_quote_vendorid_1:String
  cfd_quote_vendorname_1:String
  cfd_quote_vendoremail_1:String,
  cfd_quote_fueltotal_1: String,
  cfd_quote_labortotal_1: String,
  cfd_quote_materialstotal_1: String,
  cfd_quote_total_1: String,
  cfd_quote_vendorcomments_1: String,
  cfd_quote_replydate_1: String,
  cfd_quote_status_1:String
  work_award_date:String
  work_due_date:String
  finance_type:String
  peoplesoft_proj_id:String
  po_number:String
  pricing_matrix_eligible:Boolean
  pricing_matrix_cost_type:String
  created_by_vendor_userid:String
  created_by_vendor_id:Int
  work_order_status:String
  fuel_type:String
  source_system:String
  current_fuel_level:String
  files:[quote_file]
  police_report_filed:String
  leak_present:String
  evn_hotline_called:String
}
input schedule_request_input{
  category:String
  start:String
  end:String
  workId:String
  description:String
  workType:String
  submarket:String
  market:String
  siteNo:JSON
  siteName:String
  siteUnid:String
  switchUnid:String
  switchName:String
  vendorCompanyName:String
  vendorTechName:String
  status:String
  vendorId:Int
  loginId:String
  loginName:String
  files:[schedfileinput]
  comments:String
  woDevices : [JSON]
  engineerLoginId :String
  ticketNo : String
  ticketSource : String
  projectType : String
  fieldEngineer : String
  mop : [schedfileinput]
}
input update_schedule_request_input{
  newData:updateNewData
  oldData:updateOldData
}
input updateNewData{
  category:String
  start:String
  end:String
  eventId:String
  workId:String
  createdById:String
  description:String
  workType:String
  submarket:String
  market:String
  siteNumber:JSON
  siteNo:JSON  
  switchUnid:String
  title:String
  siteName:String
  siteUnid:String
  switchName:String
  vendorCompanyName:String
  vendorTechName:String
  status:String
  vendorId:Int
  loginId:String
  loginName:String
  files:[submitupdateschedfileinput]
  newcomment:String
  woDevices : [JSON]
  scheduleExtend:String
  kirkeId:String
  engineerLogin:String
  autoCreatedKirkeRequest:String
}
input updateOldData{
  title:String
  eventId:String
  switchUnid:String
  switchName:String
  category:String
  createdById:String
  start:String
  end:String
  workId:String
  description:String
  workType:String
  submarket:String
  market:String
  siteNumber:JSON
  siteName:String
  siteUnid:String
  vendorCompanyName:String
  vendorTechName:String
  status:String
  vendorId:Int
  loginId:String
  loginName:String
  files:[submitupdateschedfileinput]
  comments:[inputschedcomment]
  autoCreatedKirkeRequest:String
}
input inputschedcomment{
  comments: String
  loginId: String
  postedDate: String
  loginName: String
  fromSystem: String
}
input createSpectrumBody{
  request : JSON
}


input gen_reading_request{
  source_sys:String
  source_unid:String
  readings:[GenReadings]
}
input GenReadings{
  reading_unid:String
  gen_meta_universalid:String
  gen_emis_id:String
  ac_voltage:String
  ac_current:String
  oil_level:String
  fuel_level1:String
  fuel_gallonsadded1:String
  fuel_level2:String
  fuel_gallonsadded2:String
  fuel_level3:String
  fuel_gallonsadded3:String
  fuel_level4:String
  fuel_gallonsadded4:String
  totalruntime:String

}

input updateEquipmentInput {
  Body: updateEquipReq
}

input updateEquipReq {
  equipment : [equipData]
}

input equipData {
    equipment_id : String
    is_replaced: String
    user_id : String
    project_id : String
    miscEquipInfo : [miscEquipInfo]
    gnodeb_id: String
	du_id: String
    sector_id: String
    vendorName: String
}
input miscEquipInfo {
    azimuth: String
    downtilt: String
    elog_comment: String
    image: String
    image_lat: String
    image_long: String
}
input getNokeDeviceInfoInput {
  Body: nokeDeviceInfoReq
}
input nokeDeviceInfoReq {
  noke_lock:noke_lock_getInfo
}
input noke_lock_getInfo {
  serial_no: String
  mac: String
}


input getNokeCommandsInput {
  Body: getNokeCommandsReq
}

input getNokeCommandsReq {
  noke_lock:noke_lock
  ivr_info:ivr_info
}

input noke_lock {
  session: String
  mac: String 
  site_unid: String  
}
input ivr_info {
  ivr_techid: String
  pin: String
}
input nestModelDetailsObjInput{
  work_activities: String
  user_id: String
  vendor_details_id : String
  nest_removal_permit_req : String
  expiration_date :String
  evaluation_date : String
  rstr_follow_up: String
  rstr_locked:String
  updated_on:String
    alt_email_address: String
    alt_mobile_number: String
    alt_name: String
    alt_office_number: String
    biologist_birdtype: String
    biologist_follow_up: String
    is_biologist_determined: String
    rstr_biologist_name: String
    rstr_birdtype: String
    rstr_comments: String
    rstr_groundaccess: String
    rstr_isrestricted: String
    rstr_toweraccess: String
    meta_universalid: String
    cfd_ps_loc: String
    address: String
    cfd_sitearea: String
    city: String
    county : String
    region: String
    site_name: String
    site_number: String
    state: String
    site_unid: String
    zip: String
    switch: String
    field_email_address: String
    field_mobile_number: String
    field_contact_name: String
    field_office_number: String
    antenna_site_support: String
    current_bird_activity: String
    nest_distance: String
    disturbance_constant_noises: String
    disturbance_ground_vibration: String
    disturbance_noise: String
    disturbance_human_activity: String
    reported_by: String
    reported_on: String
    type_of_ground_work: String
    current_land_use: String
    lat: String
    long: String
    userid: String
    created_on: String
    is_owned: String
    owner_comment: String
    rstr_log: String
    structure_type: String
    other_structure_type: String
    status: String
    status_ack_by: String
    status_ack_date: String
    status_closed_by: String
    status_closed_date: String
    status_in_progress_by: String
    status_in_progress_date: String
    status_po_req_by: String
    status_po_req_date: String
    is_vapp_permission: String
    structure_height: String
    duration_of_time: String
    vendor_email: String
    vendor_id: String
    vendor_name: String
    work_desc: String
    work_delayed: String
    work_type: String
    files : JSON
}

input questionnaireInput{
  bird_type: String
  biologist_name: String
  restricted: String
  user_id: String
  tower_access: String
  ground_access: String
  comments: String
  updated: String
  rstr_follow_up:String
  status: String
  bna_metauniversal_id: String
  expiration_date: String
  evaluation_date: String
}

input quesDataObj{
  po_number: String
  status: String
  nepa_locked: String
  biologist_follow_up: String
  rstr_isrestricted: String
  rstr_toweraccess: String
  rstr_groundaccess: String
  rstr_comments: String
  rstr_birdtype: String
  rstr_biologist_name: String
  po_scope_of_work: String
  po_comments: String
  po_amount: String
  cfd_updatesite: String
}
input siteEquipmentInfoInput {
  siteEquipmentInfo:[siteEquipmentInfo]
}
input resolutionInput{
  RESOLUTION_TYPE: String
  RESOLUTION_TYPE_OTHER: String
  RESOLUTION_COMMENTS: String
  MODIFIED_BY: String
}
input inputResol{
  customer_impact : String
  resolution_type : String
  resolution_comments : String
}
input accessRestrictionInput{
  data : accessRestrictionObj
}
input accessRestrictionObj{
  RESTRICTION : String
}
input resetIvr{
  ivr_profile : resetIVRBody
}
input resetIVRBody{
  ivr_techid : String
  pin : String
  next_pin : String
  pin_expired : String
  ani : String

}
input updVendorStatus{
  data : JSON
}
input updVendorStatusComments{
  vendor_status:String
  vendor_status_comments:String
  vendor_grade_comments:String
  userid:String
  vendor_wo_unid:String
  site_unid:String
  work_completed:String
  work_completed_comments:String
}
input hvac_controller_input{
  data : hvac_controller_type_inputs
}
input hvac_controller_type_inputs{
  hvac_controller_model : String
  hvac_controller_type : String

}
input submitIssueReportInput {
  source: String
  component: String
  task_id: String
  summary: String
  description: String
  vendor_id: String
  vendor_email: String
  created_by: String
}
input siteEquipmentInfo {
  SITE_UNID:String
  EQUIPMENT_UNID:String
  EQUIPMENT_ATTR_NAME:String
  EQUIPMENT_ATTR_VALUE:String
  LAST_UPDATED_BY:String
}
type submit_issue_report_response {
  status: String
}
type submit_user_activity {
  status: String
}
input postUserActivity {
  opstracker_userid: String,
}
input SubMarket_Input {
  subMarketInfo: Sub_Market_Info
}
input Sub_Market_Info {
  FAVORITE_SUBMARKET: String, 		    
	LAST_ACCESSED_SUBMARKET: String,
	OPSTRACKER_USERID: String
}
type saveFavoriteSubMarketResp {
  saveFavoriteSubMarket: String
}
type ivr_res_obj{
  ivr_profile:ivr_profile
}
type ivr_profile{
  ivr_techid: String 
  pin: String
  ani: String
  pin_expired: String
}
type noke_device_info_resp{
  result: String
  message: String
  error_code: Int
  noke_lock:noke_lock_response
}
type noke_lock_response{
  serial_no: String
	mac: String
	lock_name: String
	site_unid: String
	siteid: String
	sitename: String
}
type noke_get_commands_resp{
  result:String
  message:String
  error_code:Int
  noke_lock:noke_lock_cmd
}

type noke_lock_cmd{
   mac:String
   session:String
   payload:payload
}

type payload{
    commands:String
}

type equipmentFormat{
  expected_format:[expected_format]
}

type expected_format{
  vendor:String
  encoded_image:String
  regex_format:regex_format
}

type CountyListForSubMarket{
  countyList: [String]
}

type result{
  code: Int
  message: String
}
type Response{
  code: Int
  message: String
  data:Vendor
}
type getSectorCarriers{
  nodes : [NodeData]
}
type NodeData{
  node : String
  vendor : String
}
type getSpectrumReponse{
  spectrum_requests : JSON
}
type getResultSpectrum{
  spectrum_result : JSON
}
type getResultDownload{
  download : JSON
}
 type UpdateResponse{
  updateAutoVpPermission:String
 }

 type userinfoforcompanies{
           VDR_UNQ_ID:Int
            USER_UUID: String
            CONTACT_UNID:String
            OPSTRACKER_USERID:String
            VENDOR_ID: String
            FIRST_NAME:String
            LAST_NAME: String
            EMAIL_ADDRESS: String
            PHONE_NUMBER: String
            VENDOR_ROLE: String
            IS_ISSO_REG: String
            ISSO_USERID: String
            LAST_UPDATED_BY: String
            LAST_UPDATED_DATE: String
            MARKET: String
            SUB_MARKET: String
            FAVORITE_SUBMARKET: String
            LAST_ACCESSED_SUBMARKET: String
            IS_VENDOR_TRAINED: String
 }

 input CompaniesVendorId {
  vendorIDS:JSON
}

 type CompanyUserInformation{
     result:[userinfoforcompanies]
 }

 input CfgRequestInput {
  test_type: String
  project_id: String
}

input LoadCqDataTypeInput {
  user_id: String
  cfg_request: CfgRequestInput
}

 type SelConfig {
  vdu_id: String
  site_name: String
  fuze_site_id: Int
  ilo_hostname: String
  ilo_ip: String
  oam_gw_ip: String
  f1c1_nexthop: String
  crs_hostname: String
}

type CfgRequest {
  test_type: String
  project_id: String
  sel_config: [SelConfig]
}

type loadCqConfigResult {
  cfg_request: CfgRequest
}

 type testResultHistory {
  request_id: String
  enodeb_num: String
  server_id: String
  enodeb_name: String
  request_date: String
  request_user_id: String
  request_user: String
  config_txt: String
  file_name: String
  test_status: String
 }

 type historyForProjectResult {
  req_details: [testResultHistory]
 }

 type pm_templt_resp{	
  templateName: String	
  templateType: String	
  templateData: String	
}	

type site_response {
  sitedetails:Site
}

type quote_response{
  code: Int
  message: String
  fields:quoteitems
}
type insRespType 
  {
    RESULT_MSG: String
  }
type cfd_deviations_insp_input{
	inspection_unid:String
}
type opsapiResp{
	cfd_deviations: [cfd_deviations_insp_input]
	meta_universalid:String
}
type opsapiRespTower{
	
	meta_universalid:String
}
type generate_pdf_resp{
  output:pdfOutput
}
type generate_pdf_resp_gen{
  output:pdfOutputGen
}
type generate_pdf_resp_hvac{
  output:pdfOutputGen
}

type pdfOutputGen{
  pdfFiles:pdfFilesGenType
}
type pdfFilesGenType{
  result:String
}

type pdfOutput{
  pdfFiles:[pdfResp]
}
type pdfResp{
  title: String
  status: String
  response: String
}
type inspection_info_resp_tower{
   
  opstrackerResponse: opsapiRespTower
  vpInsertResponse: insRespType

}
type inspection_info_resp{
   
  opstrackerResponse: opsapiResp
  vpInsertResponse: insRespType

}
type pm_quote_response{

  RESULT_MSG: String

}
type rowsEffectedType {
  rowsAffected:String
}
type errType{
  status:String
      title:String
      detail:String
      lock_unlock_request_id:String
}
type deviceErrType{
  status:String
  title:String
  detail:String
}
type lock_req_response {
createRequestData: unlock_req_response
 insertLockDataToVP:rowsEffectedType
 LockRequest: JSON
  errors: [errType]
}
type notes_response{
  message: String
}

type atts_response{
  message: String
}

type unlock_req_response {

  message: String
  lock_unlock_request_id: String
  kirke_start_stop_res: kirke_response
}

type kirke_response {
  success: String
  message: String
}
type submitFPQuoteInvoiceResp{
  woInfo: FPQuoteWotype
}
type saveDeviceToEnodebResp{
  output: outputCband
}
type linkExistingVendorToNewCompanyResp{
  output: outputLinkedUser
}
type outputLinkedUser{
  linkStatus:String
}
type outputCband{
  iop_data:iop_data_cband
  vp_insert_data:String
  vp_update_data:[vp_update_data_cband]
}
type iop_data_cband{
  message:String
}
type vp_update_data_cband{
  SERIAL:String
  STATUS:String
}
type FPQuoteWotype{
  workorder_quote_id:String
}

type create_PMList_response{
  RESULT_MSG: [String]
  }
  type update_ques_resp{
    message : String
  }
  type updateResolution_resp{
    meta_universalid: String
    message: String
    errors: [JSON]
  }
  type accessRestResp{
    updated_access_restriction : [JSON]
  }
  type updateAcknowledgeResponse{
    woInfo : JSON
  }
  type updateStatusComments{
    vendor_wo : JSON
  }
  type opsResponse{
    updatedData : [JSON]
  }
  type quesDataResp{
    resultcode: Int
    resultmessage: String
    fields: nestModelDetailsObj
  }
  type updateschedResponse{
    RESULT_MSG: String
  }
type upload_files{

  result: String

}
type upload_files_wo_response {
  fileResp: [upload_files_wo]
}
type upload_files_wo{
    title: String
    status: String
    response: String
  }
type upload_files_go95_response {
  fileResp: [upload_files_go95]
}
type upload_files_go95{
    title: String
    status: String
    response: String
  }

type file_upload_response{
  message: String
  uploaded:[file_uploaded]
  failed: [file_upload_error]
}
type login_reason_ivr{
    login_reason:String
    login_reason_id:String
}
type get_ivr_reason_response{
  login_reasons:[login_reason_ivr]
}
type elog_submit_response{
  code: Int
  message: String
  eLogInfoId: Int
}
type get_elog_response{
  code:Int
  message:String
  listItems:[ELog]
}
type get_elogcomment_response{
  code:Int
  message:String
  listItems:[WorkRequestComment]
}
type get_generator_response{
  code:Int
  message:String
  generators:[Generator]
}
type get_hvac_response{
  code:Int
  message:String
  hvacs:[Hvac]
}
type get_managers_response{
  code:Int
  message:String
  users:[User]
}
type wo_status_response{
  code:Int
  message:String
}
type spectrumAnalysis{
  errors : JSON
  result : String
  requestId : String
}
type response_file{
  file_data: String
  file_name: String
}
type sector_response_file{
  attachmentData: String
}
type wo_request_response{
  code:String
  message:String
  workorder_id:String
  quote_unid:String
}
type vendor_wo_response{
  code: Int
  message: String
  vendor_wo_details:wo_details
}
type wo_details{
  acct_contact: String
  acct_email: String
  actual_fuel_total: String
  actual_labor_total: String
  actual_materials_total: String
  actual_total: String
  approved_quoteid: String
  approved_vendor_email: String
  approved_vendor_id: String
  cfd_approved_vendor_name: String
  cfd_area: String
  cfd_market: String
  cfd_quote_vendorid_1: String
  cfd_quote_vendorname_1 : String
  cfd_vwrs_nodes:[JSON]
  cfd_quote_fueltotal_1: String
  cfd_quote_labortotal_1: String
  cfd_quote_materialstotal_1: String
  cfd_quote_status_1: String
  cfd_quote_decline_reason_1: String
  cfd_quote_declined_by_1: String
  cfd_quote_decline_datetime_1: String
  cfd_quote_decline_history_json_1: String
  cfd_quote_total_1: String
  cfd_quote_vendorcomments_1: String
  cfd_region: String
  cfd_requested_by: String
  cfd_site_tower_managed_by: String
  cfd_site_towertypeid: String
  cfd_workorder_quote_id_1: String
  created_by_vendor_id: String
  disaster_recovery: String
  fuel_level: String
  meta_createddate: String
  meta_lastupdatedate: String
  meta_universalid: String
  mgr_email: String
  po_due_date: String
  po_number: String
  po_status: String
  po_received_status: String
  pricing_matrix_eligible: String
  pricing_matrix_cost_type: String
  priority: String
  requested_by: String
  requested_date: String
  requestor_email: String
  requestor_phone: String
  requestor_title: String
  site_key: String
  site_name: String
  site_type: String
  covid19_restricted: String
  root_drive: Boolean
  vendor_grade_comments: String
  vendor_invoice_num: String
  vendor_status: String
  vendor_status_by: String
  vendor_status_date: String
  work_accepted: String
  work_accepted_by: String
  work_accepted_comments: String
  work_accepted_date: String
  work_award_date: String
  work_completed_comments: String
  work_completed_date: String
  work_due_date: String
  work_marked_completed: String
  work_scope: String
  work_type: String
  workorder_id: String
  workorder_status: String
  workorder_status_by: String
  workorder_status_date: String
  s4_doc_num: String
  s4_po_num: String
  s4_po_status: String
  s4_po_status_date: String
  s4_pr_num: String
  s4_releasecode: String
  device_uts_id : JSON
  wb360_id : JSON
  invoicing_oos : String
  work_completed_timestamp: String
  work_pending_timestamp: String
  source_system: String
}
type schedule_request_response{
  code:String
  message:String
  autoCreatedKirkeRequestID : String
}
type ivr_request_response{
  code:String
  message:String
  techId:Int
}
type vendor_comp_response{
  code:String
  message:String
}
type tech_info{
  userid:String
  name:String
  phone:String
  role:String
  email:String
}
type site_cunk{
  site_id:String
  site_unid:String
  site_name:String
  switch:String
  tech_name:String
  mgr_name:String
}
type switch_chunk{
  switch_unid: String
  switch_name: String
  latitude: String
  longitude: String
  switch_clli: String
  switch_callout_zone: String
  area: String
  region: String
  market: String
  remedy_switch: String
  remedy_switch2: String
  remedy_switch3: String
  remedy_switch4: String
  switch_xing_id: String
  switch_emis_id: String
  switch_network_id: String
  emis_lastverifiedon: String
  emis_nextverification: String
  emis_verification: String
  emis_tooltip: String
  emis_lastverifiedby: String
  env_alarm_icon: String
  techs: [tech_info]
  mgrs: [tech_info]
}
type site_by_submarket{
  sites:[site_cunk]
  techs:[tech_info]
}
type gcInfoType {
        gc_tech_id: String
        gc_user_id: String
        name: String
        company: String
        phone: String
        email: String
      }
type workInfoType {
        work_type: String
        work_id: String
        work_info: String
      }
type lock_data_resp{
  lockRequest: lockReqType
}
type lockReqType {
    
  request_detail: reqDetType
  nsa : String
  postCheckCount : String
  isWorkComplete : String
  isReminderAcknowledged : String
  sectorlockdata : [sectorlockdataType]
  notes: [
    notesType
  ]
  attachments: [
    attachmentType
  ]
  replace_antenna_work: String

}
  type sectorlockdataType{
    LOCK_UNLOCK_ACTION_SEQ_ID: String
    SECTOR_LOCK_UNLOCK_REQ_ID: String
    LOCK_UNLOCK_ACTION_REQ_ID: String
    ISACTIVE: String
    ENODEB_ID: String
    RADIO_UNIT: String
    LINKED_VENDOR_ID: String
    EMAIL_ADDRESS: String
    VENDOR: String
    SECTOR: String
    ACTION: String
    ACTION_STATUS: String
    TIMEZONE: String
    REASON: String
    SOURCE: String
    CELL_LIST: String
    RADIO_UNIT_LOCK_STATUS: String
    CREATED_BY: String
    LAST_UPDATED_BY: String
    LAST_UPDATED_DATE: String
   
}

type reqDetType {
      lock_unlock_request_id: String
      stay_as_auto : String
      comment: String
      site_id: String
      site_unid: String
      site_name: String
      switch: String
      switch_unid: String
      site_priority: String
      ps_loc: String
      tech_id: String
      tech_name: String
      mgr_id: String
      mgr_name: String
      is_edit_detail: String
      pmd_tasks_id: String
      type_id: String
      type: String
      category_id: String
      category_name: String
      description: String
      gc_info: gcInfoType
      source: String
      request_type: String
      include_work_info: String
      work_info: workInfoType
      status: String
      display_status: String
      available_status: [
         String
      ]
      available_display_status: [
         String
      ]
      created_by: String
      created_by_name: String
      created_on: String
      closed_on: String
      updated_on: String
      notify_email_address: [
         String
      ]
      assigned_to: String
      assigned_to_name: String
      assigned_on: String
      auto_reply_sent: String
      allow_ivr_logout: String
    }
type attachmentType {
        lock_unlock_attachment_id: String
        lock_unlock_request_id: String
        vendor_portal_attachment_id: String
        file_name: String
        file_size: String
        uploaded_by: String
        uploaded_by_name: String
        uploaded_on: String
        file_url: String
        source: String
      }
type notesType{
        lock_unlock_note_id: String
        lock_unlock_request_id: String
        vp_req_id: String
        source: String
        text: String
        created_by: String
        created_by_name: String
        created_on: String
      }
type switch_by_submarket{
  switches:[switch_chunk]
}
type schedcomment{
  comments: String
  loginId: String
  postedDate: String
  loginName: String
  fromSystem: String
}

type Project{
  projects:[projects]
}

type projects {
  siteid:String,
  fuze_site_id:String,
  fuze_sitetype:String,
  sitetype:String,
  ps_loc_code:String,
  site_unid:String,
  sitename:String,
  switch_name:String,
  switch_unid:String,
  market:String,
  sub_market:String,
  proj_number:String,
  project_name:String,
  project_type:String,
  project_status:String,
  vendor:String,
  distance:Float,
  distance_text:String,
  address:String,
  city:String,
  state:String,
  county:String,
  zip:String,
  latitude:String,
  longitude:String,
  nodes:[nodes],
  equipmentList:[equipmentList],
  regex_format:regex_format
}

type regex_format{
  serial_number:String,
  part_number:String
}

type nodes{
  gnodeb_id:String,
  gnodeb_name:String,
  du_id:String,
  du_name:String,
  azimuth:String,
  sector_id:String,
  downtilt:String,
  is_restartable:String
}
type equipmentList{
  equipmentId:String,
  payload:String,
  gnodebid:String,
  du_id:String,
  sector_id:String
}

type update_equipment_resp {
  result_code: Int
  result_message: String
}

type pmModelAttDetails{
  PM_TMPLT_ATTR_NAME:String
  PM_TMPLT_ATTR_ID: Int
  PM_TMPLT_ATTR_FLD_VALUE: String
  BACKEND_SYS_UPD:String
  PM_TMPLT_ATTR_FLD_TYPE:String
  PM_TEMPLATE_ID: Int
  IS_MANDATORY:String  
  PM_TMPLT_ATTR_FLD_GROUP: String   
  PM_TMPLT_ATTR_FLD_LBLMAP:String
}

type pmEvents{
  PM_LOCATION_NAME:String
  PM_ITEM_STATUS:String
  PM_ITEM_DUE_DATE:String
  PM_ITEM_COMPLETED_DATE:String
  COMPLETED_BY:String
  PM_TYPE_NAME:String
  PM_TYPE_ID:Int
}

type listcountResponse{
  listcount : Int
  filteredList : [filteredListdata]
}
type filteredListdata{
   company_code : String
   equipmentinfo : [equipmentinfodata]        
   manager_id :String        
   manager_name :String  
   mdg_id : String
   locus_id : String
   meta_universalid :String        
   ps_loc :String       
   shelter_vendor  :String       
   site_callout_zone :String        
   site_id   :String     
   site_name :String       
   site_priority :String       
   site_status  :String     
   site_type  :String      
   soa  :String       
   switch  :String       
   switch_manager_id_1  :String      
   switch_manager_id_2   :String     
   switch_manager_name_1 :String       
   switch_manager_name_2 :String        
   tech_id :String  
   tech_name :String         
   vendorassignments : [String]    
   lastPMCompletedDate :String   
}
type equipmentinfodata{
             install_date :String         
             install_date_type :Int        
             serialnum   :String       
             meta_universalid   :String       
             emis_id  :String        
             manufacturer    :String      
             model   :String       
             gen_status  :Int      
             ac_voltage   :String       
             ac_current    :String       
             oil_level     :String     
             fuel_tank1    :Int    
             fuel_level1    :String       
             fuel_type1       :String   
             fuel_total1     :String     
             fuel_tank2      :Int    
             fuel_level2     :String     
             fuel_type2     :String     
             fuel_total2     :String     
             fuel_tank3      :Int    
             fuel_level3    :String      
             fuel_type3      :String    
             fuel_total3     :String    
             fuel_tank4      :Int    
             fuel_level4     :String     
             fuel_type4      :String    
             fuel_total4     :String     
             fuel_tank5        :Int  
             fuel_level5       :String   
             fuel_type5       :String   
             fuel_total5       :String   
             fuel_tank6        :Int 
             fuel_level6       :String  
             fuel_type6       :String 
             fuel_total6       :String 
             fuel_tank7        :Int  
             fuel_level7       :String 
             fuel_type7         :String 
             fuel_total7        :String 
             fuel_tank8        :Int 
             fuel_level8        :String 
             fuel_type8         :String 
             fuel_total8  :String 
}
type expenseProjIdDataRes{
  expenseProjIdData : [String]
  wbscodes : [String]
}

type fieldsListObject{
  fieldsList: fieldsListData
}
type fieldsListData{
  feandmgrs: [fieldfeandmgrs]
  po_info: fieldpo_info
}
type fieldfeandmgrs{
         userid: String
       fname: String
        lname: String
        title: String
        contact:String
        empid: String
        email: String
        alt_phone: String
        area: String
        region: String
        market: String
        managerid: String
        enterprise_id: String
}
type fieldpo_info{
  poEmailDetails: [poEmailDetail]
  poBusinessDetails: [poBusinessDetail]
}
type poEmailDetail{
  po_emails: String
  po_business_units: String
}
type poBusinessDetail{
  po_emails: String
  po_business_units: String
}
type syncedSitesInfo{
  siteinfo : [syncedSiteData]
}
type syncedSiteData{
	   SITE_UNID : String 
     SITE_ID : String 
     SITE_NAME  : String
     PS_LOCATION_ID  : String
     SITE_PRIORITY : String 
     SITE_STATUS  : String
     SITE_TYPE  : String 
     SITE_ONAIR_DATE : String 
     SITE_LATITUDE  : String
     SITE_LONGITITUDE  : String 
     SITE_ADDRESS  : String
     SITE_CITY  : String
     SITE_STATE  : String
     SITE_COUNTY  : String
     SITE_ZIPCODE  : String
     SWITCH  : String
     SITE_MANAGER_ID : String 
     SITE_MANAGER_NAME  : String
     SWITCH_MANAGER_ID  : String
     SWITCH_MANAGER_NAME  : String
     SITE_TECHID  : String
     SITE_TECH_NAME : String
     LAST_ACTIVITY_TRACKER  : String
     LAST_UPDATED_BY  : String
     LAST_UPDATED_DATE  : String
     MARKET   : String
     SUB_MARKET  : String
     COMPANY_CODE : String
     EQUIPMENT_TYPE   : String 
     EQUIPMENT_INFO: [siteEquipInfo]
}
type siteEquipInfo{
  refrigerant: String
  serial_number: String
          economizer_type: String
          unit_type: String
          unit_size: String
          hvac_controller_type:String
          hvac_controller_model:String
     pole_unid:String
     psloc: String
     structure_type: String
     structure_owner:String
     pole_type:String
     structure_height:String
     pole_row_private: String
     structure_material:String
     last_pole_patrol_insp:String
     next_pole_patrol_insp: String
     last_pole_detailed_insp: String
     next_pole_detailed_insp: String
     emis_id: String
          manufacturer: String
          model: String
          gen_status: String
          ac_voltage: String
          ac_current: String
          oil_level: String
          fuel_tank1: String
          fuel_level1: String
          fuel_type1: String
          fuel_total1: String
          fuel_tank2: String
          fuel_level2: String
          fuel_type2: String
          fuel_total2: String
          fuel_tank3: String
          fuel_level3: String
          fuel_type3: String
          fuel_total3: String
          fuel_tank4: String
          fuel_level4: String
          fuel_type4: String
          fuel_total4: String
          fuel_tank5: String
          fuel_level5: String
          fuel_type5: String
          fuel_total5: String
          fuel_tank6: String
          fuel_level6: String
          fuel_type6: String
          fuel_total6: String
          fuel_tank7: String
          fuel_level7: String
          fuel_type7: String
          fuel_total7: String
          fuel_tank8: String
          fuel_level8: String
          fuel_type8: String
          fuel_total8: String
          install_date: String
          install_date_type: String
          serialnum: String
          meta_universalid: String
}
type Output {
  siteid: String
  site_unid: String
  sitename: String
  proj_number: String
  project_name: String
  project_type: String
  project_status: String
  project_desc: String
  ps_loc_code: String
  address: String
  city: String
  zip: String
  state: String
  county: String
  latitude: String
  longitude: String
  manager: String
  field_engineer: String
  manager_id:String
  project_initiative:String
  model:String
  

}
type cbandsnapProjectsList{
  output: [Output]
}
type snapProjectsList {
  output: [Output]
}
type cbandProjDetResp{
  project_details: project_details_type_cband
}
type project_details_type_cband{
  project_name: String
		project_num: String
		siteid: String
		sitename: String
    devices:[devices_cband_type]
}
type devices_cband_type{
  sector_id: String
		enodeb_id: String
		serial_num: String
		scanned_by: String
		scanned_on: String
		comments: String
		vendor_id: String
	  vendor_name: String
}
type updateSerialNumber_response {
  updatedAtollInfo: String
  mesage: String
}
type fiveGRepeaterProjDetResp {
  atoll_info: [atoll_info_5g_repeater]
  expected_format: expected_format_5g_repeater
}
type expected_format_5g_repeater {
  vendor: String
  encoded_image: String
  regex_format: regex_format_5g_repeater
}
type regex_format_5g_repeater {
  serial_number: String
  part_number: String
}
type atoll_info_5g_repeater {
  SI_ATOLL_INFO_5GR_ID: String
  FUZE_SITE_ID: String
  PROJECT_NUMBER: String
  SITENAME: String
  SECTOR: String
  ISREPEATER: String
  DONORCELLRAT: String
  DONORGNODEBID: String
  DONORENODEBID: String
  DONORGNBENBID: String
  DONORGNBDUID: String
  DONORGNBDUNUMBER: String
  UNITTYPE: String
  UNITSERIALNUMBER: String
  UNITIPADDRESS: String
  SERVINGDONORSERIALNO: String
  UNITHEIGHT: String
  UNITMECHAZIMUTH: String
  UNITMECHTILT: String
  DONORCELLARFCN: String
  DONORTXID: String
  DONOR_SECTOR: String
  DONORENODEBVENDOR: String
  DONORBANDINFO: String
  DONORBANDCLASS: String
  MODIFIED_ON: String
  DONORSITENAME: String
  DONORLINKTYPE: String
  REPEATERMANUFACTURER: String
  REPEATERMODEL: String
}

type ActiveSite {
  PM_LOCATION_NAME:String
  PM_SITE_ID:String
  PM_LIST_ID:String
  PM_LIST_NAME:String
  PM_LOCATION_UNID:String
  PS_LOCATION_ID:String
  PO_ITEM_DESCRIPTION:String
}
type createListSite {
  PO_STATUS:String
  PM_LIST_NAME:String
  BUYER:String
  BUYER_ID:String
  PS_ITEM_ID:String
  MMID : String
  MDG_ID : String
  SUB_MARKET:String
  PO_NUM:String
  MANAGER_ID:String
  MANAGER:String
  BUYER_EMAIL:String
  MANAGER_EMAIL:String
  PM_ITEM_RESULT_ID:String
  PM_LIST_ITEM_ID_PS:String
  PM_LIST_ITEM_ID:String
  PM_LIST_ID:String
  PM_LOCATION_NAME:String
  PM_LOCATION_STATUS:String
  PM_LOCATION_UNID:String
  PS_LOCATION_ID:String
  PM_LOCATIONGRP:String
  PM_EQUIPMENT_MAKER:String
  PM_LOCATION_CALLOUTZONE:String
  PM_LOCATION_ONAIR_DATE:String
  SWITCH_NAME:String
  LOCATION_MANAGER:String
  LOCATION_MANAGER_ID:String
  FIELDENGINEER:String
  FIELDENGINEER_ID:String
  PM_COST:String
  PM_ITEM_START_DATE:String
  PM_ITEM_DUE_DATE:String
  PM_ITEM_STATUS:String
  PM_ITEM_COMPLETED_DATE:String
  COMPLETED_BY:String
  DEFAULT_PM_VENDOR_ID:String
  DEFAULT_PM_VENDOR_NAME:String
  INCLUDED_IN_PMLIST:String
  PM_ITEM_ACTION:String
  LAST_UPDATED_BY:String
  LAST_UPDATED_DATE:String
  LOCATION_PRIORITY:String
  EQUIPMENT_STATUS:String
  ACTIVTY_TRACKER:String
  PO_ITEM_ID:String
  DESCRIPTION:String
  TOTAL_COST:String
  SCHEDULED_DATE:String
  PM_LIST_ITEM_UUID:String
  PM_TEMPLATE_ID:String
  PM_TMPLT_ATTR_NEW_VALUE_SENT:String
  PM_TMPLT_ATTR_ID:String
  PM_TMPLT_ATTR_NAME:String
  PM_TMPLT_ATTR_OLD_VALUE:String
  PM_TMPLT_ATTR_NEW_VALUE:String
  PM_TMPLT_ATTR_FLD_LBLMAP:String
  IS_MANDATORY:String
  PM_TMPLT_ATTR_FLD_TYPE:String
}
type inspectionDetailsItem{
  
    PO_STATUS:String
    PM_LIST_NAME:String
    BUYER:String
    BUYER_ID:String
    PS_ITEM_ID:String
    MMID : String
    MDG_ID : String
    SUB_MARKET:String
    PO_NUM:String
    MANAGER_ID:String
    MANAGER:String
    BUYER_EMAIL:String
    MANAGER_EMAIL:String
    PM_LIST_ITEM_ID: Int
    PO_ITEM_ID :String
    PM_LIST_ID: Int
    LINE:String
    SCHEDULE:String
    PM_LOCATION_NAME:String
    PM_SITE_ID:String
    PM_LOCATION_UNID:String
    PS_LOCATION_ID:String
    LOCATION_MANAGER:String
    LOCATION_MANAGER_ID:String
    FIELDENGINEER:String
    FIELDENGINEER_ID:String
    PM_COST:String
    PM_ITEM_START_DATE:String
    PM_ITEM_DUE_DATE:String
    PM_ITEM_STATUS:String
    PM_ITEM_COMPLETED_DATE:String
    COMPLETED_BY:String
    EQUIPMENT_UNID:String
    SCHEDULED_DATE:String
    EQUIPMENT_TYPE:String
    OPSTRACKER_UNID:String
    INSP_COMMENTS:String
    INSP_STATUS:String
    INSP_COMPLETED_BY:String
    INSPECTION_UNID:String
    ATTRIBUTE_ID:Int
    ATTRIBUTE_NAME:String
    ATTRIBUTE_VALUE:String
    ATTRIBUTE_CATEGORY:String
    ATTRIBUTE_SUBCATEGORY:String
    ATTRIBUTE_FIELDS:String
    ATTRIBUTE_COMMENTS:String
    LAST_UPDATED_BY:String
    LAST_UPDATED_TIME:String
  
}
type createListSitesObject{
  listItems: [createListSite]
  inspectionDetailsItems:[inspectionDetailsItem]
}
type ActiveSitesObject{
  listItems: [ActiveSite]
}
type searchSitesObject{
  searchResults:[searchResult]
}
type validatePONumObj{
  po_info: String
}
type getNestEvaluationQsObj{
  data: [getNestEvaluationQsList]
}
type getNestEvaluationQsList
  {
    site_unid:String
    area:String
    region:String
    market:String
    switch:String
    site_name:String
    id:Int
    reported_on:String
    reported_by:String
    bna_metauniversal_id:String
    status:String
    site_number:String
    state:String
    city:String
  }

type getAttachmentContentObj{
    data: [attachmentContent]
  }

type attachmentContent{
   BIRD_NEST_DETAILS_ID : String
   ATTACHMENT_NAME: String
   ATTACHMENT_SIZE: String
   ATTACHMENT_TYPE: String
   CREATED_ON: String
   MODIFIED_ON: String
   FILE_CONTENT: String
   BNA_ATTACHMENTS_ID: String
   BNA_METAUNIVERSAL_ID: String
  }
type getNestModelDetailsObj{
  data: nestModelDetailsObj
}  
type nestModelDetailsObj{
  work_activities: String
  vendor_details_id : String
  user_id: String
  expiration_date :String
  evaluation_date : String
  nest_removal_permit_req:String
  rstr_follow_up: String
  rstr_locked:String
  updated_on:String
    alt_email_address: String
    alt_mobile_number: String
    alt_name: String
    alt_office_number: String
    biologist_birdtype: String
    biologist_follow_up: String
    is_biologist_determined: String
    rstr_biologist_name: String
    rstr_birdtype: String
    rstr_comments: String
    rstr_groundaccess: String
    rstr_isrestricted: String
    rstr_toweraccess: String
    meta_universalid: String
    cfd_ps_loc: String
    address: String
    cfd_sitearea: String
    city: String
    county : String
    region: String
    site_name: String
    site_number: String
    state: String
    site_unid: String
    zip: String
    switch: String
    field_email_address: String
    field_mobile_number: String
    field_contact_name: String
    field_office_number: String
    antenna_site_support: String
    current_bird_activity: String
    nest_distance: String
    disturbance_constant_noises: String
    disturbance_ground_vibration: String
    disturbance_noise: String
    disturbance_human_activity: String
    reported_by: String
    reported_on: String
    type_of_ground_work: String
    current_land_use: String
    lat: String
    long: String
    userid: String
    created_on: String
    is_owned: String
    owner_comment: String
    rstr_log: String
    structure_type: String
    other_structure_type: String
    status: String
    status_ack_by: String
    status_ack_date: String
    status_closed_by: String
    status_closed_date: String
    status_in_progress_by: String
    status_in_progress_date: String
    status_po_req_by: String
    status_po_req_date: String
    is_vapp_permission: String
    structure_height: String
    duration_of_time: String
    vendor_email: String
    vendor_id: String
    vendor_name: String
    work_desc: String
    work_delayed: String
    work_type: String
    files : JSON
}
type getAttachmentsListOpsTrackerObj{
  attachmentsList: attachmentsListObj
}
type attachmentsListObj{
  listcount: Int
  listitems: [attachmentListtypego95]
}

type searchResult{
   PM_LIST_ITEM_ID:Int
   PM_LIST_ID:Int
   PM_LOCATION_NAME:String
   SITE_ID:String
   PS_LOCATION_ID:String
   PM_ITEM_UNID:String
   PM_COST:String
   PRICE:Int
   LINE:String
   SCHEDULE:String
   ITEM_LINE_STATUS:String
   LINE_SCH_MATCH_STATUS:String
   LINE_RECV_STATUS:String
   PM_ITEM_START_DATE:String
   PM_ITEM_DUE_DATE:String
   PM_ITEM_STATUS:String
   PM_ITEM_COMPLETED_DATE:String
   COMPLETED_BY:String
   UPDATE_ACTION:String
   LAST_UPDATED_BY:String
   LAST_UPDATED_DATE:String
   PO_NUM:String
   PM_TYPE_NAME:String
   PM_LIST_NAME:String
   COMMENTS:String
   PO_ITEM_ID:String
   DESCRIPTION:String
   IS_VENDOR_REQUESTED: String
   IS_COMPLETED: String
   EQUIPMENT_UNID:String
   INSPECTION_TYPE:String
   FIRE_ZONE_SECTOR:String
}
type trainingMaterialData{
  trainingList: [trainingMaterial]
}
type trainingMaterial{
  UNQ_SEQ_ID: Int
  TRAINING_NAME: String
  TRAINING_CATEGORY: String
  TRAINING_TYPE: String
  TRAINING_FILENAME: String
  TRAINING_FILETYPE: String
  TRAINING_FILELOCATION: String
  TRAINING_MATERIALENABLED: String
  LAST_UPDATED_BY: String
  LAST_UPDATED_DATE: String
}
type fileDataResponse{
  result: [files]
}
type fileDataResponsego95{
	data: String
}
type submarketunidtype{
  PM_LIST_ID:Int
  MARKET:String
  MANAGER_ID:String
  SUB_MARKET:String
  PM_ITEM_UNID:String
}
type compltdAttResponse{
  attributeData:[attributeList]
  attachmentsData:[attachmentList]
  sitesInfo: [sitesInfocmpltResp]
  submarketUnidData:submarketunidtype
}
type pdfquiptype{
  manufacturer:String
  install_date:String
  serial_number:String
  economizer_type:String
  unit_type:String
  unit_size:String
  model:String
  refrigerant:String
  hvac_unit_id:String
}
type vendorassntype{
  vendor_id:Int
  vendor_name:String
  peoplesoft_id:String
  pm_category:String
}
type sitesInfocmpltResp{
  address:String
  city:String
  county:String
  equipmentinfo:[pdfquiptype]
  hvac_contact_phone:String
  hvac_controller_mfr:String
  hvac_controller_model:String
  hvac_controller_type:String
  latitude_decimal:String
  longitude_decimal:String
  manager_id:String
  manager_name:String
  meta_universalid:String
  mdg_id:String
  network_id:Int
  ps_loc:String
  shelter_vendor:String
  site_callout_zone:String
  site_id:String
  site_name:String
  site_priority:Int
  site_status:String
  site_type:String
  soa:String
  st:String
  switch:String
  switch_manager_id_1:String
  switch_manager_id_2:String
  switch_manager_name_1:String
  switch_manager_name_2:String
  tech_id:String
  tech_name:String
  vendorassignments: [vendorassntype]
  zip:String
}
type pendingWOResponse{
  listItems:[pendingLIst]
}
type pendingLIst{

  PM_LIST_ID:Int
  PM_LOCATION_NAME:String
  PM_SITE_ID:JSON   
  PM_LOCATION_UNID:String
  PM_ITEM_STATUS:String
  
}
type attributeList{
PM_ITEM_RESULT_ID:Int
PM_TEMPLATE_ID:Int
PM_TMPLT_ATTR_NEW_VALUE_SENT:String
PM_TMPLT_ATTR_ID:Int
PM_TMPLT_ATTR_NAME:String
PM_TMPLT_ATTR_OLD_VALUE:String
PM_TMPLT_ATTR_NEW_VALUE:String

PM_TMPLT_ATTR_FLD_TYPE:String
PM_TMPLT_ATTR_FLD_LBLMAP:String
}
type attachmentList{
  PM_LIST_ID:Int
  PM_LIST_ITEM_ID:Int
  PM_ATTACHMENTS_ID:Int   
  PM_FILE_CATEGORY:String
  PM_FILE_NAME:String
  PM_FILE_TYPE:String
}

type files {
  PM_ATTACHMENTS_ID:Int
  PM_LIST_ID:Int
  PM_LIST_ITEM_ID:Int
  PM_LOCATION_UNID:String
  PM_FILE_CATEGORY:String
  PM_FILE_NAME:String
  PM_FILE_TYPE:String
  PM_FILE_SIZE:String
  PM_FILE_DATA:String
  LAST_UPDATED_BY:String
  LAST_UPDATED_DATE:String
}

type pmListItems{
  pmlistitems:[listItemsGrid]
}
type pmListItemsByMdgId{
  pmListItemsByMdgId:[listItemsGridByMdgId]
}
type pmTypesRefConfigDataType{
        PM_TYPE_ID:String
        ATTRIBUTE_TYPE:String
        ATTRIBUTE_CATEGORY:String
        ATTRIBUTE_NAME:String
        ATTRIBUTE_VALUE:String
}
type towerAttchType{
  recordtype:String
  source_universalid:String
  meta_universalid:String
  file_name:String
  file_size:String
  file_modifieddate:String
  category:String
  description:String
}
type towerOpType {
  
    towerAttributeData:[towerAttType]
    towerAttributeDataFromOpstracker:towerDataOpstracker
    attachmentList: [towerAttchType]
    towerinspectionsRefData: [towerinspectionsRefDataType]
    towerData: [towerDataType]
    
}
type towerDataOpstracker{
  cfd_gam_currentdoc_description: String
  comments: String
  crit_items_found: String
  impacting_items_found: String
  inspection_date: String
  inspection_tech_name: String
  meta_createdby: String
  meta_createddate: String
  meta_lastupdateby: String
  meta_lastupdatedate: String
  meta_universalid: String
  obs_non_impacting: String
  obs_pot_impacting: String
  po_number: String
  remediation_required: String
  safety_climb_mfr: String
  safety_climb_safe: String
  site_universalid: String
  status: String
  struct_manufacturer: String
  struct_model: String
  tower_highest_point:String
  vendor_id: String
}
type towerAttType{
  PM_LIST_ITEM_ID:String
  PM_LIST_ID:String
  LINE:String
  MDG_ID : String
  SCHEDULE:String
  PM_LOCATION_NAME:String
  PM_LOCATION_UNID:String
  PS_LOCATION_ID:String
  LOCATION_MANAGER:String
  LOCATION_MANAGER_ID:String
  FIELDENGINEER:String
  FIELDENGINEER_ID:String
  PM_COST:String
  PM_ITEM_START_DATE:String
  PM_ITEM_DUE_DATE:String
  PM_ITEM_STATUS:String
  PM_ITEM_COMPLETED_DATE:String
  COMPLETED_BY:String
  EQUIPMENT_UNID:String
  SCHEDULED_DATE:String
  EQUIPMENT_TYPE:String
  OPSTRACKER_UNID:String
  INSP_COMMENTS:String
  INSP_STATUS:String
  INSP_COMPLETED_BY:String
  INSPECTION_UNID:String
  ATTRIBUTE_ID:String
  ATTRIBUTE_NAME:String
  ATTRIBUTE_VALUE:String
  ATTRIBUTE_CATEGORY:String
  ATTRIBUTE_SUBCATEGORY:String
  ATTRIBUTE_FIELDS:String
  ATTRIBUTE_COMMENTS:String
  LAST_UPDATED_BY:String
  LAST_UPDATED_TIME:String
  }
type towerDataType{
  
SITE_UNID:String
SITE_ID:String
SITE_NAME:String
PS_LOCATION_ID:String
SITE_PRIORITY:String
SITE_STATUS:String
SITE_TYPE:String
SITE_ONAIR_DATE:String
SITE_LATITUDE:String
SITE_LONGITITUDE:String
SITE_ADDRESS:String
SITE_CITY:String
SITE_STATE:String
SITE_COUNTY:String
SITE_ZIPCODE:String
SWITCH:String
SITE_MANAGER_ID:String
SITE_MANAGER_NAME:String
SWITCH_MANAGER_ID:String
SWITCH_MANAGER_NAME:String
SITE_TECHID:String
SITE_TECH_NAME:String
LAST_ACTIVITY_TRACKER:String
LAST_UPDATED_BY:String
LAST_UPDATED_DATE:String
MARKET:String
SUB_MARKET:String
EQUIPMENT_TYPE:String
EQUIPMENT_INFO: [
  equipInfoTower
]
}
type equipInfoTower{
  
    tower_managed_by:String
    tower_struct_last_inspection:String
    tower_struct_inspect_by:String
    tower_struct_next_inspection:String
    towertype:String
    
}
type towerinspectionsRefDataType{
  
    PM_TYPE_ID:String
    ATTRIBUTE_TYPE:String
    ATTRIBUTE_CATEGORY:String
    ATTRIBUTE_NAME:String
    ATTRIBUTE_VALUE:String

}


type towerInspItems{
  output: towerOpType
}
type pmDraftListItems {
  listItems:[listItemsDraftGrid]
}
type pmDraftListItemsPending {
  listItems:[listItemsDraftGridPending]
}
type listItemsDraftGridPending{
  INSP_STATUS:String
  PO_NUM:String
  PM_LIST_ITEM_ID:Int
                        PM_LIST_ID:Int
                        PM_LOCATION_NAME:String
                        PM_SITE_ID:String
                        SITE_CITY:String
                        SITE_COUNTY:String
                        FIRE_ZONE_SECTOR: String
                        PO_ITEM_DESCRIPTION:String
                        PM_LOCATION_STATUS:String
                        PM_LOCATION_UNID:String
                        PS_LOCATION_ID:String
                        PM_LOCATIONGRP:String
                        SWITCH_NAME:String
                        LOCATION_MANAGER:String
                        FIELDENGINEER:String
                        PM_COST:String
                        PM_ITEM_START_DATE:String
                        PM_ITEM_DUE_DATE:String
                        PM_ITEM_STATUS:String
                        PM_ITEM_COMPLETED_DATE:String
                        COMPLETED_BY:String
                        DEFAULT_PM_VENDOR_ID:String
                        DEFAULT_PM_VENDOR_NAME:String
                        INCLUDED_IN_PMLIST:String
                        LAST_UPDATED_BY:String
                        LAST_UPDATED_DATE:String
                        LOCATION_MANAGER_ID:String
                        FIELDENGINEER_ID:String
                        PM_EQUIPMENT_MAKER:String
                        PM_LOCATION_ONAIR_DATE:String
                        LOCATION_PRIORITY:String
                        EQUIPMENT_STATUS:String
                        PM_ITEM_ACTION:String
                        PM_LOCATION_CALLOUTZONE:String
                        DESCRIPTION:String
                        SCHEDULED_DATE:String
                        TOTAL_COST:String
                        PO_ITEM_ID:String
                        EQUIPMENT_UNID:String,
                        MDG_ID:String
}
type listItemsDraftGrid {
  PM_LIST_ITEM_ID_PS:String
  INSP_STATUS:String
                        PM_LIST_ITEM_ID:Int
                        PM_LIST_ID:Int
                        PM_LOCATION_NAME:String
                        PM_SITE_ID:String
                        PM_LOCATION_STATUS:String
                        PM_LOCATION_UNID:String
                        PS_LOCATION_ID:String
                        PM_LOCATIONGRP:String
                        SWITCH_NAME:String
                        LOCATION_MANAGER:String
                        FIELDENGINEER:String
                        PM_COST:String
                        PM_ITEM_START_DATE:String
                        PM_ITEM_DUE_DATE:String
                        PM_ITEM_STATUS:String
                        PM_ITEM_COMPLETED_DATE:String
                        COMPLETED_BY:String
                        DEFAULT_PM_VENDOR_ID:String
                        DEFAULT_PM_VENDOR_NAME:String
                        INCLUDED_IN_PMLIST:String
                        LAST_UPDATED_BY:String
                        LAST_UPDATED_DATE:String
                        LOCATION_MANAGER_ID:String
                        FIELDENGINEER_ID:String
                        PM_EQUIPMENT_MAKER:String
                        PM_LOCATION_ONAIR_DATE:String
                        LOCATION_PRIORITY:String
                        EQUIPMENT_STATUS:String
                        PM_ITEM_ACTION:String
                        PM_LOCATION_CALLOUTZONE:String
                        DESCRIPTION:String
                        SCHEDULED_DATE:String
                        TOTAL_COST:String
                        PO_ITEM_ID:String
                        PO_ITEM_DESCRIPTION:String
                        EQUIPMENT_UNID:String
                        FIRE_ZONE_SECTOR:String
                        INSPECTION_TYPE: String
}

type listItemsGrid{
    PM_LIST_ITEM_ID:Int
    PM_LIST_ID:Int
    PM_LOCATION_NAME:String
    PO_ITEM_ID:String
    DESCRIPTION:String
    SITE_ID: String
    PS_LOCATION_ID:String
    PM_COST:String
    PRICE:Int
    MDG_ID:String
    MMID:String
    LINE_ID:String
    LINE_NUMBER:String
    LINE:String
    SCHEDULE:String
    ITEM_LINE_STATUS:String
    LINE_SCH_MATCH_STATUS:String
    LINE_RECV_STATUS:String
    PM_ITEM_START_DATE:String
    PM_ITEM_DUE_DATE:String
    SCHEDULED_DATE:String
    PM_ITEM_STATUS:String
    PM_ITEM_COMPLETED_DATE:String
    COMPLETED_BY:String
    LAST_UPDATED_BY:String
    LAST_UPDATED_DATE:String
    UPDATE_ACTION:String
    PM_ITEM_UNID:String                
    COMMENTS:String                                          
    INVOICINGOOS : String
}

type Event_Data{
  eventId: String
  start: String
  end: String
  market: String
  switchName: String
  status: String
  createdById: String
  siteUnid: String
  siteName: String
  description: String
  submarket: String
  switchUnid: String
  title: String
  workId: String
  workType: String
  vendorCompanyName: String
  vendorTechName: String
  category: String
  createdOn: String
  modifiedOn: String
  modifiedById: String
  modifiedByName: String
  siteNumber: String
  vendorId: String
  autoCreatedKirkeRequest: String
  files: JSON
  comments: JSON
  source : String
  conflictKirkeData : ConflictData
  businessEventId : String
  name: String
}
type ConflictData{
  uniqueElementsForRequestId : uniqueElements
  kirkeType : String
  categoryName: String
  category: String
  eventId: String
  requestId: String
  start: String
  end : String
  status: String
}
type uniqueElements{
  ITEM_ID: String
  NUMBER_OF_ITEMS_IN_CONFLICT: String
  ITEM_STATUS: String
}
type Calender_Response{
status:Int
message:String
data:[Event_Data]
}

type listItemsGridByMdgId{
    SUBMARKET:String
    PO_NUM:String
    PM_LIST_NAME:String
    MANAGER:String
    BUYER:String
    PM_TYPE: String
    PEOPLESOFT_LOCATION_ID:String
    VENDOR_MDGID:String
    VENDOR_ID:String
    PM_LIST_STATUS:String
    PO_STATUS:String
    SITE_NAME:String
    SITEID:String
    MDGLC:String
    COST:String
    LINE:Int
    LINE_STATUS:String
    DUE_DATE:String
    COMPLETED_DATE:String
    COMPLETED_BY:String
    INVOICINGOOS : String
}

type events{
  eventId:Int
  start:String
  end:String
  market:String
  switchName:String
  status:String
  createdById:String
  siteUnid:String
  siteName:String
  description:String
  submarket:String
  switchUnid:String
  title:String
  vendorId:Int
  workId:String
  workType:String
  vendorCompanyName:String
  vendorTechName:String
  category:String
  siteNumber:JSON
  files: [schedfile]
  comments: [schedcomment]
}
type workorder_status_searchData {
  listItems: [workorder]
}
type workOrder_search_data {
  vendor_wo_details: workorder
}
type filteredListItem {	
equipmentinfo : [equipmentinfoItem]	
ps_loc: String	
}	
type filteredListItemGen {	
equipmentinfo : [equipmentinfoItemGen]	
ps_loc: String
site_id:String	
}	
type attachmentListtypego95{
				recordtype: String
				source_universalid: String
				meta_universalid: String
				file_name: String
				file_size: String
				file_modifieddate: String
				category: String
				description: String
}
type GO95PoleInfo {
  poleAttributeData: [poleAttributeDataType]
  go95DeviationsRefData: [GO95RefDataType]
  poleData:[poleDataType]
  attachmentList:[attachmentListtypego95]
  
}
type poleAttributeDataType {
         INSP_UNQ_ID:String
        PM_LIST_ID:String
        PM_LIST_ITEM_ID:String
        POLE_UNID:String
        INSPECTION_UNID:String
        INSP_TYPE:String
        INSP_STATUS:String
        INSP_COMPLETION_DATE:String
        INSP_TECH:String
        INSP_VENDOR_ID:String
        INSP_COMMENTS:String
        DEVIATION_FOUND:String
        LAST_UPDATED_BY:String
        LAST_UPDATED_DATE:String
        OPSTRCK_INSP_UNID:String
        DEVIATION_ID:String
        DEVIATION_NAME:String
        DEVIATION_OWNBYVZ:String
        DEVIATION_STATUS:String
        OTHER_DEVIATION_OWNERS:String
        DEVIATION_COMMENTS:String
        REMEDIATION:String
        REMEDIATION_LEVEL:String
        REMEDIATION_STATUS:String
        REMEDIATION_COMMENTS:String
        REMEDIATION_ACCPT:String
        REMEDIATION_ACCPT_BY:String
        REMEDIATION_ACCPT_DATE:String
        OPSTRCK_DEVIATION_UNID:String
        OPSTRCK_REMEDIATION_UNID:String
        EQUIPMENT_UNID:String
        ATTRIBUTE_ID:Int
        ATTRIBUTE_NAME:String
        ATTRIBUTE_VALUE:String
        ATTRIBUTE_CATEGORY:String
        ATTRIBUTE_SUBCATEGORY:String
        ATTRIBUTE_FIELDS:String
        ATTRIBUTE_COMMENTS:String
}
type equipmentInfoType{
            pole_unid: String
            structure_type: String
            structure_owner: String
            pole_type:String
            structure_height:String
            pole_row_private: String
            last_pole_patrol_insp: String
            next_pole_patrol_insp: String
            last_pole_detailed_insp: String
            next_pole_detailed_insp: String
          }
type GO95RefDataType{
        DEVIATION_ID: String
        DEVIATION_DESC: String
        DEVIATION_LABEL: String
        INSP_GROUP: String
        REMEDIATION_LEVEL: String
        REMEDIATION: String
        LAST_UPDATED_BY: String
        LAST_UPDATED_DATE: String
}
type poleDataType{
        SITE_UNID: String
        SITE_ID: String
        SITE_NAME: String
        PS_LOCATION_ID: String
        SITE_PRIORITY: String
        SITE_STATUS: String
        SITE_TYPE: String
        SITE_ONAIR_DATE: String
        SITE_LATITUDE: String
        SITE_LONGITITUDE: String
        SITE_ADDRESS: String
        SITE_CITY: String
        SITE_STATE: String
        SITE_COUNTY: String
        SITE_ZIPCODE: String
        SWITCH: String
        SITE_MANAGER_ID: String
        SITE_MANAGER_NAME: String
        SWITCH_MANAGER_ID: String
        SWITCH_MANAGER_NAME: String
        SITE_TECHID: String
        SITE_TECH_NAME: String
        LAST_ACTIVITY_TRACKER: String
        LAST_UPDATED_BY: String
        LAST_UPDATED_DATE: String
        MARKET: String
        SUB_MARKET: String
        EQUIPMENT_TYPE: String
        EQUIPMENT_INFO: [
          equipmentInfoType
    ]
}
type equipmentinfoItemGen {	
  manufacturer:String
   meta_universalid:String
   emis_id:String
   ac_voltage:String
   ac_current:String
   model:String
   serialnum:String
   oil_level:String
   fuel_type1:String
   fuel_tank1:String
   fuel_level1:String
   fuel_total1:String	
}	
type equipmentinfoItem {	
  manufacturer:String	
  install_date:String	
  serial_number:String	
  economizer_type:String	
  unit_type:String	
  unit_size:String	
}	
type currentSystemRecords {	
            listcount:Int	
            filteredList : [filteredListItem]       	
}
type currentSystemRecordsGen {	
            listcount:Int	
            filteredList : [filteredListItemGen]       	
}
type getNotification{
  notifications:[notificationDetail]
}
type notificationDetail{
  NOTIFY_ID:String
  NOTIFY_TYPE:String
  NOTIFY_MESSAGE:String
  NOTIFY_DISPLAY:String
}
type getAuditDetailsType{
	auditLogs: [auditLogsType]
}
type auditLogsType{
	INSP_HISTORY_ID:String
      PM_LIST_ID:String
      PM_LIST_ITEM_ID:String
      INSP_UNID:String
      FIELD_NAME:String
      OLD_VALUE:String
      NEW_VALUE:String
      ACTION:String
      LAST_UPDATED_BY:String
      LAST_UPDATED_DATE:String
}
type hvacattributeResult{
  PM_TMPLT_ATTR_NAME:String
  PM_TYPE_ID:String
  IS_MANDATORY:String
  PM_TMPLT_ATTR_ID:String
  PM_TMPLT_ATTR_FLD_VALUE:String
  BACKEND_SYS_UPD:String
  PM_TMPLT_ATTR_FLD_LBLMAP:String
  PM_TMPLT_ATTR_FLD_TYPE:String
  PM_TEMPLATE_ID:String
  PM_TMPLT_ATTR_FLD_GROUP:String
}
type dynamicHvacType{
  hvac_unit_id:String
  unit_size:String
  refrigerant:String
  quantity:String
  quantity_units:String
  model:String
  comments:String
  unit_type:String
  serial_no:String
  eco_installed:String
  no_eco_reason:String
  
}
type pmInspectionDataType{
  hvacs: [dynamicHvacType]
  attributeResult:[hvacattributeResult]
}
type HVACpmModelAttDetails{
  pmInspectionData: pmInspectionDataType
}
type fixedPriceMatrixExistDataType {
  woInfo:fpwoInfoType
  choices:[choicesType]
}
type choicesType{
  name:String
  value:String
  alias:String
}
type fpcfd_lineitemsType {
  name:String
  value:String
}
type fpwoInfoType {
  cfd_exp_proj_choices:String
  cfd_gam_currentdoc_description:String
  pricing_matrix_cost_type:String
  cfd_lineitems:[fpcfd_lineitemsType]
  cfd_market:String
  cfd_mgr_empid:String
  cfd_mgr_userid:String
  cfd_numlineitems:String
  cfd_orig_meta_lastupdatedate:String
  cfd_po_business_unit_choices:JSON
  cfd_quotes:[fpcfd_lineitemsType]
   cfd_workorder_quotes:[fpcfd_lineitemsType]
   cfd_vwrs_nodes:[JSON]
  cfd_region:String
    cfd_requested_by:String
    cfd_requested_date:String
    cfd_requested_time:String
    cfd_requestor_empid:String
    cfd_site_acceptance_date:String
    cfd_site_address:String
    cfd_site_antenna_access:String
    cfd_site_city:String
    cfd_site_county:String
    cfd_site_directions :String
    cfd_site_function:String
    cfd_site_gate_combo:String
    cfd_site_gate_combo2:String
    cfd_site_groundskeeping_by_vzw:String
    cfd_site_isrecentsite:String
    cfd_site_latitude:String
    cfd_site_longitude:String
    cfd_site_man_lift_requirements:String
    cfd_site_owned:String
    cfd_site_ps_loc:String
    cfd_site_soa:String
    cfd_site_st:String
    cfd_site_tower_managed_by:String
    cfd_site_towertypeid:String
    cfd_site_zip:String
    disaster_recovery:String
    work_declined_history_json: String
    device_uts_id : JSON
}
type fixedPriceMatrixDataType {
  fixedPriceMatrixData: [fixedPricingServObj]
}
type fixedPricingServObj{
  meta_universalid:String
  market:String
  submarket:String
  listname:String
  cost_type:String
  site_type:String
  ps_item_id:String
  bid_unit:String
  work_type:String
  cost_category:String
  service_type:String
  unit:String
  price_per_unit:String
  long_description:String
  is_matrix:String
  pricing_fixed:Int
  service_cat:String
  service_cat_sort:Int
  line_item_sort:Int
  zipcodes:String
  mmid:String
}

type choice{
  name:String,
  value:String,
  alias: String
}
type workTypesResponse{
  types: [choice]
}
type workScopeResponse{
workScope: String
}

type vendorListType{
  vendors:[vendorEssoType]
}
type vendorEssoType{
  peoplesoft_id: String
phone: String
service_email: String
vendor_category: String
vendor_id: Int
vendor_name: String
vendor_portal: Int
vendor_sponsor_id: String
meta_universalid : String
}

type resendUserActivationInviteResponse{
  message: String
}

type getUserInfoLinkedResp{
  userinfo:userinfoType
}
type getWorkOrderDistanceDetailsResp{
  createWODistanceDetails: createWODistanceDetailsType
}
type unlinkResp{
  output:outputunlinkType
}
type outputunlinkType{
 
  unlink_status:unlink_statusType
}
type unlink_statusType{
      status: String
      rowsAffected: Int
}
type userinfoType{
    VDR_UNQ_ID: String
    USER_UUID: String
    CONTACT_UNID: String
    OPSTRACKER_USERID: String
    VENDOR_ID: String
    FIRST_NAME: String
    LAST_NAME: String
    EMAIL_ADDRESS: String
    PHONE_NUMBER: String
    VENDOR_ROLE: String
    IS_ISSO_REG: String
    ISSO_USERID: String
    LAST_UPDATED_BY: String
    LAST_UPDATED_DATE: String
    VENDOR_AREA: String
    VENDOR_REGION: String
    VENDOR_NAME:String
}
type createWODistanceDetailsType{
  acct_email: String
  cfd_area: String
  cfd_created_by_vendor_mdg_id : String
  cfd_created_by_vendor_name : String
  cfd_created_by_vendor_nearest_dispatch_address : String
  cfd_created_by_vendor_nearest_dispatch_distance : String
  cfd_created_by_vendor_username : String
  cfd_exp_proj_choices : String
  cfd_market : String
  cfd_mgr_userid : String
  cfd_region : String
  cfd_requested_date : String
  cfd_requested_time : String
  cfd_site_city : String
  cfd_site_county : String
  cfd_site_mdg_id : String
  cfd_site_ps_loc : String
  cfd_wbs_choices : String
  mgr_email : String
  site_id : String
  site_key : String
  site_name : String
  site_type : String
  work_accepted : String
  workorder_status: String
}
type dangerous{
  bSiteHazard : String
  SiteHazardComments :String
  dCreated :String
  SITE_UNID :String
}
type dangerousSiteDetails{
  dangerousSite : [dangerous]
}
type rooftopSafetyRes {
  safety_des_area_eqp_type: String 
  safety_equip_light_required: String 
  safety_fall_prot_req : String 
  safety_ladder_sclimb_type: String 
  safety_ladder_sclimb_type_oth: String 
  safety_night_lighting: String 
  safety_rooftop_emp_access : String 
  safety_rooftop_notes : String 
  safety_travel_restr_type: String 
}
type VendorProfile{
  data : JSON
}

type RelatedVendors{
  data : [matchedVendors]
}
type RelatedUsers{
  data : [matchedVendors]
}
type matchedVendors{
  display : String
  value : String
}

type holidayEvents{
  holidayEvents : [Holidays]
}
type Issues{
  qissue_details : [JSON]
}
type problemData{
  resolution_type : [JSON]
}
type GetOffHours{
  offhours : [OffHours]
}
type OffHours{
  NAME : String
  SWITCH_UNID: String
  MARKET: String
  SUB_MARKET: String
  STATUS: String
  TIMEZONE: String
  START_TIME: String
  END_TIME: String
  EXCEPTION_START_TIME:String 
  EXCEPTION_END_TIME:String 
  IS_WORK_DAY: String
  EXCEPTION_CREATED_DATE:String
  EXCEPTION_TIMEZONE: String
}

type Holidays{
  OPS_HOLIDAY_EVENTS_ID : String
  TITLE : String
  DESCRIPTION : String
  HOLIDAY_DATE : String
  CREATED_BY_LOGINID : String
}
type stepStatus{
 stepStatus : StepSts
}
type StepSts{
  step_status : StatusStep
  updateResponse : String
}
type StatusStep{
  refresh_list : String
  request_id : String
  job_desc : String
  vdu_id : String
  exec_info : [JSON]
 }
type validateResp{
  results:JSON
}
type vendorDomains{
  userId: String
  subMarket: [String]
}
type sectorInfo{
  enodeb_sector_info : EnodebSectorInfo
}
type EnodebSectorInfo{
  sectors:[SectorObj]
  errors : String
}
type SectorObj{
  sector: String
  sector_status: String
  lock_status: String
  enodeb_id: String
  vendor: String
  enodeb_name: String
}
input lockUnlockInput{
  SECTOR_LOCK_UNLOCK_REQ_ID: String
  ENODEB_ID: [String]
  RADIO_UNIT: String
  LINKED_VENDOR_ID: String  
  EMAIL_ADDRESS: [String] 
  VENDOR: String
  SECTOR: [String]
  ACTION: String
  ACTION_STATUS: String
  TIMEZONE: String
  REASON: String  
  SOURCE :String
  CELL_LIST: String 
  RADIO_UNIT_LOCK_STATUS: String  
  CREATED_BY: String
  LAST_UPDATED_BY: String
}

input unlockInput{
    request_id: [String] 
    enodeb_id: [String]
    created_by: String 
    radio_unit: String 
    sector: [String] 
    linked_vendor_id: String 
    reason: String 
    email_ids: [String] 
    timezone: String 
    lock_type: String 
    status: String 
    vendor: String 
    osw_request_id: String
    optionValues: String
}



type unlockResp{
  iopResponse: [notes_response]
  vpActiveUpdate : rowsEffectedType
  vpInsert : iop_data_cband
}

type lockUnlockResp{
  iopResponse: [iopResp]
  vpActiveUpdate : rowsEffectedType
  vpInsert : iop_data_cband
}
type iopResp{
  message: String
  lock_request_id: String
  enodeb_radio_lock: radioLock
}
type radioLock{
  created_by: String
  enodeb_id: [String]
  radio_unit: String
  email_list: [String]
  timezone: String
  reason: String
  source: String
  vendor: String
  sector_list:[String]
  slrId: String
}
input updateBodyLock{
  status: String
  updated_by: String
  work_task_notes: [String]
  isReminderAcknowledged: String
}

  
type updateLockStatusRes{
  vpUpdate : rowsEffectedType
  iopUpdate : unlock_req_response
}

input ManualOswRsnInput {
  manualoswrsn_comments: String
  manualoswrsn: String
  user_id: String
}

type ManualOswUpdateResponse {
  message: String
  lock_unlock_request_id: String
}

type autoReplyMessagesResponse {
  data: [AutoReplyMessage]
}

type AutoReplyMessage {
  BROADCAST_NOTIF_ID: String
  SELECTED_GROUP: String
  NOTIF_TYPE: String
  NOTIF_DATE: String
  NOTIF_TIME: String
  BROADCAST_TYPE: String
  MESSAGE: String
  IS_SCHEDULED: String
  CREATED_BY: String
  MODIFIED_BY: String
  CREATED_ON: String
  MODIFIED_ON: String
  IS_DELETED: String
  IS_ONETIME: String
  START_TIME: String
  END_TIME: String
  MESSAGE_TIMEZONE: String
  START_TIME_GUI: String
  END_TIME_GUI: String
  NOTIFY_MESSAGE_TYPE: String
}

input ericssionCfgRequestInput {
  project_id: String
  test_type: String
  vdu_id: String
  vendorportal: String
}
input ericssionServerTestInput {
  user_id: String
  cfg_request: ericssionCfgRequestInput
}
type ericssionServerTestResponse {
  message: String
  request_id: Int
  atlas_job_id: Int
}


  type radioData {
    radioInfo: [radioResult]
  }

  type radioResult {
    siteUnid: String
    nodeId: String
    sector: String
    duid: String
    ruName: String
    technology: String
    vendor: String
    productName: String
    partCode: String
    serialNumber: String
    softwareVersion: String
  
  }
  type deleteResponse {
    message: String
    successfulDeletes : JSON
    failedDeletes : JSON
    }
  input deleteUserInput{
    contactUnid: [String]
  }
input updateUserInput{
  opstrackerUserId: [String]
  updatedBy : String
}
type Query {
  getUserAuth(input:getUserAuthInput):auth_response
  getDispatchLocations(unid: String!, mdgId: String!):Fields
  getVduStepStatus(projectId: String!, vduId: String!, siteunid: String, siteName: String, vendorId: String, vendorName: String) : stepStatus
  validateAddress(location:String):validateResp
  deviceTestDetails(project_num: String!):DeviceTestDetailsResponse
  getHolidayEvents : holidayEvents
  getIssues(unid: String!) : Issues
  getProblemData(problemType : String) : problemData
  generatePDFData : [JSON]
  getOffHours(id : String, submarket: String) : GetOffHours
  getRelatedVendors(keyword : String) : RelatedVendors
  getRelatedUsers(keyword : String) : RelatedUsers
  getVendorProfile(vendorId: String!) : VendorProfile
  getProjectInfoSlr(projectNumber: String!):detailsProject
  deviceConfigView(request_id: String!):DeviceConfigViewResponse
  getDeviceTestHistory(project_num: String!, test_type: String!, vdu_type: String!):DeviceTestHistory
  getVendorList(vendor_id: Int! ):[Vendor]
  getSiteSectorCarriers(siteunid:String!): getSectorCarriers
  getSpectrumHistory(siteunid:String!) : getSpectrumReponse
  getSpectrumResult(request_id:String!):getResultSpectrum
  getSpectrumDownload(request_id:String!):getResultDownload
  getVendorUserAuth(vendorEmail:String!):getVendorUserAuthResp
  getUserInfoLinked(vendorEmail:String!):getUserInfoLinkedResp
  getWorkOrderDistanceDetails(siteUnid:String!, userId:String!): getWorkOrderDistanceDetailsResp
  unLinkVendor(id:String!, name:String!):unlinkResp
  getUserInfoVendorLinked(vendorId:Int!):getUserInfoVendorLinkedResp
  getVendorContactRecord(contact_unid: String!):Vendor
  getNotifications(category:String):getNotification
  getVendorWorkOrder(loginId: String!, startdate: String!, enddate: String!, mdgId:String):wo_response
  getConfigData(vendorId: Int!): configData
  getSnapProjects(market: String!, submarket: String!): snapProjectsList
  getCbandSnapProjects(market: String!, submarket: String!): cbandsnapProjectsList
  getCbandProjDetails(projectNum: String!): cbandProjDetResp
 
  getPmListDetails(vendorId:Int!, pmType:String!, year:String!): pmListObject
  getSyncedSitesInfo( submarket:String!,managerId:String!, pmType:String!): syncedSitesInfo
  getSectorLockData(unid:String!): sectorLockData
  getEnodebData(unid:String!): enodebData
  getNestEvaluationQs(vendorId: Int!): getNestEvaluationQsObj
  validatePONum(poId: String!,submarket: String!, psLocId: String! ): validatePONumObj
  getNestModelDetails(unid: String!): getNestModelDetailsObj
  getAttachmentContent(unid: String!) : getAttachmentContentObj
  getAttachmentsListOpsTracker(unid: String!): getAttachmentsListOpsTrackerObj
  getRmaPartCodes(text: String!): rmaPartCodes
  getRmaPrepops(site_unid: String!, manager_id: String!): rmaPrepops
  getDefectiveSerialNumber(site_unid: String!, partcode: String!): defectiveSerialNumber

  getSearchedSites(vendorId: Int!, search:String!, year:String!): searchSitesObject
  getFixedPricingServ(loginId:String!,market:String!, submarket:String!, national:String!, listname:String!, worktype:String!, costtype:String!, sitetype:String!, fixed:String!, nonfixed:String!, zipcode:String!, matrix:String!, nonmatrix:String!, matrixeligible:String!) : fixedPriceMatrixDataType
  getFixedPricingExistServ(loginId: String!,unid:String!) : fixedPriceMatrixExistDataType
  getCreateListSites(vendorId: Int,year:String!): createListSitesObject
  getActiveSites(vendorId: Int!, submarket:String!,managerId:String!,poItemIds:String!): ActiveSitesObject
  getFileDataForPmlist(pmListId:Int!,pmListItemId:Int!, updateType:String!, name:String!, isCommonFile:String!): fileDataResponse
  getTrainingMaterial: trainingMaterialData
  getFileDataForGO95(loginId:String!, unid:String!, name:String!): fileDataResponsego95
  getPendingWorkOrderDetails(vendorId:Int!):pendingWOResponse
  getBuyerList(loginId:String!, market:String!,submarket:String!,source:String!): fieldsListObject
  getExpenseProjIdData(loginId:String!, submarket:String!,managerId:String!) : expenseProjIdDataRes
  getSiteListDetails(market:String!, submarket:String!,managerId:String!,pmType:String!,location:String!) : listcountResponse
  getCompletedAttDetails(pmListId:Int!):compltdAttResponse
  getSiteDetails(siteunid: String!):site_response
  fetchSiteData(siteunid: String!):site_data_response
  getDownloadHealthcheck (requestid : String!) : DownloadHC
  getEventsBySiteUnid (siteunid : String!) : eventsBySite
  getProjectDetails(projectNumber: String!, market: String!, submarket: String!):project_details
  getProjectsList(mdg_id:String!, startDate:String!,endDate:String!,submarket:String!):project_list
  getHealthRequestDetails(requestid : String!) : healthrequest_response
  getHealthCheckDetails(siteunid : String!) : healthcheckdetails
  getRETScanDetails(oswId : Int!) : RETScanDetails
  getMMURequests(project_id: String!) :cbandtools
  viewMMUDownload(request_id : String!) : downloadMMU
  getFastHistory(siteunid : String!) : fastHistorydetails
  getOpenOswForUser(user_id : String!) : openOsw
  getLatestOswDate(work_order_id : String!) : oswDates
  getSwitchDetails(switch_unid: String!):switch_response
  getEventDetails(vendorId: String!, loginId: String!, type: String):[events]
  getPmDetails(vendorId:Int!, pmType:String!):[pmEvents]
  
  getHVACPmModelAttDetails(pmType:String,unid:String):HVACpmModelAttDetails
  getPmModelAttDetails(pmType:String,po_item_id:String):[pmModelAttDetails]
  getTowerInspItems(pmTypeId: String,submarket: String,pmListItemId: String,unid: String,pmListId: String):towerInspItems
  getPmGridDetails(pmListIds: String!):pmListItems
  getPmListDetailsByVendorId(vendorId: String!, year: String!):pmListItemsByMdgId
  getGO95PoleInfo(subMarket: String!,poleUnid: String!,pmListItemId: String!, pmListId: String!):GO95PoleInfo
  getAuditDetails(pmListItemId: String!):getAuditDetailsType
  getDraftGridDetails(pmListIds: String!, isGo95:Boolean!, isTower:Boolean!):pmDraftListItems
  getCurrentSystemRecords(unids:String!,pmType:String!):currentSystemRecords
  getCurrentSystemRecordsGen(unids:String!,pmType:String!):currentSystemRecordsGen
  getElogForWorkorder(workorder_id: String!, vendor: String!):get_elog_response
  getGeneratorInfoForUnid(unid: String!,type: String!):get_generator_response
  getHvacInfoForUnid(unid: String!,type: String!):get_hvac_response
  getManagersForSubmarket(submarket: String!):get_managers_response
  getVendorTechForVendorId(login: String!,vendorId: String!):get_vendorTech_response
  getElogCommentForInfoId(userId: String!,eloginfoid: String!,fromsystem: String!):get_elogcomment_response
  logout:result
  getIVRLoginReason:get_ivr_reason_response
  siteLogin(input:IVRLogin):IVRLoginResponse
  checkFastUser(vzid: String!):FastUserCheckResponse
  getUserIVRDetails(userId: String!):UserIVRDetailsResponse
  getCompanyInfoForVendor(vendor_mdg_id: String!):companyinfoforvendorResponse
  getCountforVPAutomation(vendor_id: String!):CountforVPAutomation
  getCompaniesInfoForAllVendors:getCompaniesInfoForAllVendorsResponse
  getMarketsforGenRunReport:getMarketsforGenRunReportResponse
  getAnteenaInformation(siteUnid:String!):getAnteenaInformationResponse
  getSubMarketsforGenRunReport(market:String!):getSubMarketsforGenRunReportResponse
  getSwitchesforGenRunReport(market:String!,submarket:String!):getSwitchesforGenRunReportResponse
  getDevicesforGenRunReport(market:String!,submarket:String!,switchName:String!):getDevicesforGenRunReportResponse
  getGenRunResult(deviceName:String!,startDate:String!,endDate:String!):getGenRunResultResponse
  generatorFuelReport(market:String!, subMarket:String!):generatorFuelReportResponse
  getGroupsforOpenAlarmsReport(market:String!, subMarket:String!):getGroupsforOpenAlarmsResponse
  getSwitchesForOpenAlarmReport(market:String!, subMarket:String!, group:String!):getSwitchesForOpenAlarmReportResponse
  getOpenAlarmsDataReport(switchName:[String!], startDate:String!, stopDate:String!):getOpenAlarmsDataReportResponse
  siteLogout(input:IVRLogout):IVRLogoutResponse
  getAlarm(site_unid: String!):AlarmResponse
  session:result
  getAttachmentsList(loginId:String!, unid: String, attachment_type: String):list_of_files
  downloadFile(loginId:String!, unid: String,file_name: String, attachment_id: String, category: String):response_file
  downloadVSFile(file_Id: String):response_file
  downloadElogFile(file_Id: String):response_file
  downloadLockUnlockAttachment(file_Id: String):sector_response_file
  getSitesBySubmarket(site_region: String):site_by_submarket
  getLockData(lockReqId:String): lock_data_resp
  getRecentActivity(userId:String): recentActivity
  getSectorInfo(enodeb_id:String!, site_unid: String!) : sectorInfo
  getSamsungRadioUpdateDetails(osw_request_id:String!) : samsung_radio_update_details
  checkSocketAndDisconnect(login_id:String!) : check_socket_and_disconnect
  getSwitchesBySubmarket(switch_region: String):switch_by_submarket
  delIvrTechUser(login:String!,userId:String!):vendor_comp_response
  getGenTanknfoForUnid(unid: String!):get_genTank_response
  getVendorWoByUnid(loginId:String!,unid:String!):vendor_wo_response
  getRMAInformation(vwrs_id: String, rma_id: String):getRMAInformation_response
  getRMADetails(vendorID: String!): getRMADetails_response
  getVendorWoByWorkOrderId(loginId: String!,workOrderId:String!, vendorId:String):workOrder_search_data
  fetchBucketCraneSiteDetails(siteunid: String!): fetchBucketCraneSiteDetails_response
  vwrsIDSerachQuery(vwrsID:String!):vwrsIDSerachQueryResponse
  getVendorDataByStatusFilter(loginId:String!, vendorId:String, startdt:String, enddt:String, statusList:String):workorder_status_searchData
  getProjectsBySubMarket(submarket: String!,project_name: String!):Project
  getProjects(latitude: String!,longitude: String!,proximity: String!,user_id: String!,gnodeb_id: String!,sector_id: String!,du_id: String!):Project
  getCurrentPinByUserId(login:String!,userId:String!):result
  getVendorDomains(userId:String!):vendorDomains
  logAction(user_id: String!, email:String, vendor_id:String, workorder_id:String, market:String, sub_market:String, action:String, action_name:String, action_option:String, osw_id:String):JSON
  IVRProfileInfo(login_id:String!):ivr_res_obj
  getPendingItemsForUpdate(pmListIds:String!,pmType:String):pmDraftListItemsPending
  getEquipmentFormat:equipmentFormat
  getCountyListForSubMarket(subMarket: String!): CountyListForSubMarket
  getWorkTypes(loginId:String!,workType: String!):workTypesResponse
  getWorkScope(serviceType: String!):workScopeResponse
  resendUserActivationInvite(userId: String!): resendUserActivationInviteResponse
  getMarketListEsso:marketListType
  getVendorsListEsso(market:String!, submarket:String!):vendorListType
  getDangerousSite(siteUnid:String!):dangerousSiteDetails
  getRoofTopInfo(metaId: String!): rooftopSafetyRes
  getReceivedSitesVendor(vendorId:Int!):PORemainder
  get5gRepeaterProjectDetails(projectNum: String!): fiveGRepeaterProjDetResp
  checkForValidSession:result
  getCalenderEventsForSite(startDate: String!, endDate: String!,siteUnid: String!):Calender_Response
  getConflictEventDetails(startDate: String!, endDate: String!,siteUnid: String!):Calender_Response
  getUserInfoForCompanies(input:CompaniesVendorId):CompanyUserInformation
  getLoadCqData(input:LoadCqDataTypeInput):loadCqConfigResult
  getvduHistoryForProject(vdu_id: String!): historyForProjectResult
  getOSWAutoReplyMessagesByUnid(siteUnid:String): autoReplyMessagesResponse
  getRMApictures(loginId: String!,category: String!, attachmentId: Int!, includeLinkedAttachments: String!): getRMApicturesResp
  getRMApicturesPreview(loginId: String!,categoryID: String!, attachmentId: Int!): getRMApicturesPreviewResp
  bulkUpdatePendingAckFromRedis(userId: String, vendorId: Int): ackFromRedisResponse
  getRMAattachmentPreview(attachmentId: String!, preview: String!): getRMAattachmentResponse
  getBidUnitRules(userId: String!): bidUnitRulesResponse
  getLineItemsByWorkOrderId(workOrderId: String!, userId: String!): lineItemsByWorkOrderIdResponse
  getVendorWorkOrderByWorkOrderId(workOrderId: String!, userId: String!): vendorWorkOrderByWorkOrderIdResponse
  getAuditByWorkOrderByWorkOrderId(workOrderId: String!, userId: String!): auditByWorkOrderByWorkOrderIdResponse
  getAuditInvoiceByWorkOrderId(workOrderId: String!, userId: String!): auditInvoiceByWorkOrderIdResponse
  getOSWInfo(workOrderId: String!): oswInfoResponse
  getAPRadioDeviceDetails(fuzeSiteId: String!, managerId: String!): [JSON]
  getHostnameMapping(method: String!, site: String!): HostnameMappingResponse
  searchHpovServer(method: String!, proc: String!, reqBody: JSON): HpovServerResponse
  pingHost(method: String!, host: String!): PingResponse
  getTestInfo(siteUnid: String!): TestInfoResponse
  getOpenTest(siteUnid: String!): OpenTestResponse
  getTestHistory(siteUnid: String!): TestHistoryResponse
  getTestStatus(eatTestId: Int!): TestStatusResponse
  getOswIssueTypes: getOswIssueTypesResponse
  getTestAuditDetails(eatTestId: Int!): TestAuditDetailsResponse
  getMetroRootSchedules(caId: String!): [JSON]
  getWorkOrderForSite(loginId: String!, startdate: String!, enddate: String!, mdgId: String, siteId: String!): WorkOrderForSiteResponse
  getSiteTypes: SiteTypesResponse
  getNodes(siteUnid: String!): NodesResponse
  getHeatMap(node: String!): HeatMapResponse
  getTaskType(loginId: String): TaskTypeResponse
  recalculateDistance(workOrderId : String!,loginId : String!) : DistanceRepsonse
  getRadioInfo(siteUnid: String!): radioData
  getDashboardConfig: DashboardConfigResponse
  getWorkUrgency : WorkUrgencyResponse
  }
type Mutation {
  createDeviceTestRequest(input:deviceReqBody): DeviceTestResponse
  ericssionServerTest(input:ericssionServerTestInput) : ericssionServerTestResponse
  requestHealthCheck(input: healthReqBody, siteunid: String) : HealthCheckResponse
  requestRETScan(payload: retScanReqBody) : RetScanResponse
  loadCqData(input : cqData) : cqDataResponse
  generateValidationMMU(input : validateData) : MMUResponse
  updateLockStatus(input : updateBodyLock, lockReqId : String!) : updateLockStatusRes
  updateManualOswReason(input : ManualOswRsnInput, lockReqId : String!) : ManualOswUpdateResponse
  createLockUnlock(input : lockUnlockInput,siteUnid : String!) : lockUnlockResp
  unlockSector(input : unlockInput, siteUnid : String!) : unlockResp
  issoResetAccount(issoUserId : String!,opstrackerUserId:String!) : issoResponse
  createDispatchAddress(input: addressPayload) : DispatchAddressResponse
  vduReplacement(input : vduReplace, siteunid :String, siteName:String, vendorId:String, vendorName:String) : stepStatus
  updateDispatchAddress(input: addressPayload,locationUnid: String!) : DispatchAddressResponse
  deleteDispatchAddress(locationUnid:String!):DispatchAddressResponse
  createContact(input:VendorInput):Response
  updateAutoVpPermission(input:UpdateInput):UpdateResponse
  updateContact(input:VendorInput):Response
  deleteContact(contact_unid: String):result
  deleteUsers(input:deleteUserInput):deleteResponse
  submitLockRequest(input:createReqBodyInput):lock_req_response
  submitNotes(input:submitNotesInput, lockReqId:String):notes_response
  submitAttachment(input:submitAttachmentInput, lockReqId:String):atts_response
  createDraftRMA(input: createDraftRMAInput, manager_id: String): createDraftRMAResponse
  resubmitRMA(rmaId: String!,input: resubmitRMAInput): resubmitRMAResponse
  submitTowerInsp(input:TowerInspectionInfoInput):inspection_info_resp_tower
  generateInspPDF(input:towerInspItemsInput, type:String):generate_pdf_resp
  generateInspPDFGen(input:genInspItemsInput, type:String):generate_pdf_resp_gen
  generateInspPDFHvac(input:hvacInspItemsInput, type:String):generate_pdf_resp_hvac
  generateInspPDFGO95(input:go95InspItemsInput, type:String):generate_pdf_resp_hvac
  submitInspectionInfo(input:InspectionInfoInput):inspection_info_resp
  submitPMDetails(input:PMDetailsInput):pm_quote_response
  submitFPQuoteInvoice(loginId:String!, input:submitFPQuoteInvoiceInp,quoteUnid:String,quoteAction:String): submitFPQuoteInvoiceResp
  submitFPInvoice(loginId:String!, input:submitFPInvoiceInp,quoteUnid:String,quoteAction:String): submitFPQuoteInvoiceResp
  saveDeviceToEnodeb(input:saveDeviceToEnodebInp):saveDeviceToEnodebResp
  linkExistingVendorToNewCompany(input:linkExistingVendorToNewCompanyInp):linkExistingVendorToNewCompanyResp
  createPMList(input:createPMListInput, refName:String, feGrouped:Boolean):create_PMList_response
 updateScheduleDate(input:updateScheduleDatereq, refName:String): updateschedResponse
  getTemplateData(input:postRequest):pm_templt_resp
  getTemplateDataGen(input:postRequestGen):pm_templt_resp
  uploadFiles(input:uploadFilesInput):upload_files
  uploadFilesGO95(input:uploadFilesInputGO95, unid:String):upload_files_go95_response
  uploadFilesWO(input:uploadFilesInputWO, unid:String, category:String):upload_files_wo_response
  submitFilesvwrs(loginId:String!,input:file_inputvwrs):file_upload_response
  submitElog(input:ELogInput):elog_submit_response
  submitElogComment(input:ELogComment):wo_status_response
  updateWOStatus(loginId:String!,input:wo_status_change_input):wo_status_response
  updateScheduleRequest(input:update_schedule_request_input):schedule_request_response
  submitWORequest(loginId:String!,input:wo_request_input):wo_request_response
  submitScheduleRequest(input:schedule_request_input):schedule_request_response
  createUpdIvrUser(input:ivr_request_input):ivr_request_response
  createUpdVendorCompany(input:vendor_comp_input):vendor_comp_response
  ivrEmailNotification(input:ivr_email_request):vendor_comp_response
  submitGenReadings(input:gen_reading_request):wo_status_response
  createSpectrumAnalyzer(input:createSpectrumBody!):spectrumAnalysis
  updateMultipleMarketIvr(input:ivr_request_mulMarket):wo_status_response
  updateEquipment(input: updateEquipmentInput):update_equipment_resp
  getNokeDeviceInfo(input: getNokeDeviceInfoInput):noke_device_info_resp
  getNokeCommands(input: getNokeCommandsInput):noke_get_commands_resp
  updateSiteEquipmentInfo(input: siteEquipmentInfoInput): updateschedResponse
  updateQuestionnaire(loginId:String!,input:questionnaireInput, siteUnid: String ):update_ques_resp
  updateQuestionnaireAttachments(loginId:String!,input:nestModelDetailsObjInput!, siteUnid: String ):update_ques_resp
  updateResolution(unid: String, input: resolutionInput) : updateResolution_resp
  updateAccessRestrictions(loginId: String!,fuzeSiteId: String, unid:String, input:accessRestrictionInput) : accessRestResp
  resetIvrPin(input : resetIvr) : JSON
  updateVendorStatus(loginId: String!, input : updVendorStatus, quoteId: String, status:String) : updateAcknowledgeResponse
  bulkUpdatePendingAck(input : bulkUpdatePendingAckInput) : bulkUpdatePendingAckResp
  updateVendorStatusComments(input : updVendorStatusComments) : updateStatusComments
  hvacInfoToOpstracker(unid:String!, input:hvac_controller_input) : opsResponse
  submitIssueReport(input: submitIssueReportInput): submit_issue_report_response
  serialNumberUpdate(input: atoll_info_input): updateSerialNumber_response
  saveUserActivity(input:postUserActivity):submit_user_activity
  saveFavoriteSubMarket(input: SubMarket_Input):saveFavoriteSubMarketResp
  updateUserStatus(input:updateUserInput!):notes_response
  updateSamsungSN(input :updateSamsungSNinput,site_unid : String!) : updateSamsungSNresp
  updateStayAutoFlag(osw_request_id: String!): updateStayAutoResp
  uploadRMApictires(loginId:String!,input :upload_RMA_pictures_input) : upload_RMA_pictures_Resp
  updateVendorTrained(input: OSWTrained_Input):vendor_trained_resp
  deleteAvianAttachment(attachmentId:String!):deleteAvianAttachment
  postInvoiceSubmit(input: postInvoiceSubmitInput): postInvoiceSubmitResponse
  postAuditSubmit(vwrsInfo: JSON, input: JSON): postAuditSubmitResponse
  completeInvoiceTransaction(auditId: Int!, input: InvoiceCompletionTransactionInput!, userId: String!): InvoiceCompletionTransactionResponse
  createHPOVRegistration(input: HPOVRegistrationInput!): HPOVRegistrationResponse
  createEatTestRequest(input: EatTestRequestInput!): EatTestRequestResponse
  cancelEatTest(input: CancelEatTestInput!): CancelEatTestResponse
  startEatTest(input: StartEatTestInput!): StartEatTestResponse
  stopEatTest(input: StopEatTestInput!): StopEatTestResponse
  completeEatTest(input: CompleteEatTestInput!): CompleteEatTestResponse
  postTaskType(input: postTaskTypeInput!): postTaskTypeResponse
  uploadAvianAttachment(input: uploadAvianAttachmentInput!): uploadAvianAttachmentResponse
  sendEmailNotificationForAvianUpdate(meta_universalid: String!, input: nestModelDetailsObjInput!): sendEmailNotificationForAvianUpdateRes
}`;
const mergedSchemas = [typeDefs, loginSchema, bulkPOManagementSchema, capitalProjectSchema, companyProfileSchema, recentActivitySchema, reportManagementSchema, vendorWorkOrderSchema, oswSchema, rmaSchema, nestEvaluationSchema, invoiceAuditSchema, rmuSchema, siteToolsSchema]
const schema = process.env.MOCKSERVER === "true" ? makeExecutableSchema({ typeDefs }) : makeExecutableSchema({ typeDefs: mergedSchemas, resolvers });
if (process.env.MOCKSERVER === "true") {
  addMockFunctionsToSchema({ schema, mocks });
} else {
  addSchemaLevelResolveFunction(schema, (root, args, { req }, { fieldName }) => {
    let allUserAction = [
      "createDeviceTestRequest",
            "ericssionServerTest",
      "checkSocketAndDisconnect",
      "updateResolution",
      "updateAccessRestrictions",
      "getRmaPartCodes",
      "getRmaPrepops",
      "createDraftRMA",
      "resubmitRMA",
      "resetIvrPin",
      "updateVendorStatus",
      "updateVendorStatusComments",
      "hvacInfoToOpstracker",
      "requestHealthCheck",
      "requestRETScan",
      "loadCqData",
      "getVendorDomains",
      "logAction",
      "generateValidationMMU",
      "updateLockStatus",
      "updateManualOswReason",
      "createLockUnlock",
      "unlockSector",
      "issoResetAccount",
      "getDispatchLocations",
      "getVduStepStatus",
      "getHolidayEvents",
      "getIssues",
      "generatePDFData",
      "getOffHours",
      "getRelatedVendors",
      "getProjectInfoSlr",
      "getRelatedUsers",
      "getVendorProfile",
      "createDispatchAddress",
      "vduReplacement",
      "updateDispatchAddress",
      "deleteDispatchAddress",
      "deviceTestDetails",
      "getFastHistory",
      "fetchBucketCraneSiteDetails",
      "getOpenOswForUser",
      "getLatestOswDate",
      "getSectorInfo",
      "getHealthCheckDetails",
      "getRETScanDetails",
      "getMMURequests",
      "viewMMUDownload",
      "getHealthRequestDetails",
      "getVendorList",
      "getVendorContactRecord",
      "getProjectDetails",
      "getNotifications",
      "getVendorWorkOrder",
      "getSiteDetails",
      "getDownloadHealthcheck",
      "getEventsBySiteUnid",
      "getEventDetails",
      "getPmDetails",
      "getPmGridDetails",
      "getTowerInspItems",
      "getGO95PoleInfo",
      "getDraftGridDetails",
      "getCurrentSystemRecords",
      "getCurrentSystemRecordsGen",
      "getConfigData",
      "getSnapProjects",
      "getCbandProjDetails",
      "getPmListDetails",
      "getSyncedSitesInfo",
      "getSectorLockData",
      "getEnodebData",
      "getBuyerList",
      "getExpenseProjIdData",
      "getPendingItemsForUpdate",
      "getSiteListDetails",
      "getSearchedSites",
      "getFixedPricingServ",
      "getFixedPricingExistServ",
      "getNestEvaluationQs",
      "validatePONum",
      "getNestModelDetails",
      "getAttachmentContent",
      "getCreateListSites",
      "getActiveSites",
      "getWorkOrderDistanceDetails",
      "getFileDataForPmlist",
      "getTrainingMaterial",
      "getFileDataForGO95",
      "getCompletedAttDetails",
      "getPendingWorkOrderDetails",
      "getElogForWorkorder",
      "getElogCommentForInfoId",
      "logout",
      "getIVRLoginReason",
      "siteLogin",
      "checkFastUser",
      "getCompanyInfoForVendor",
      "getCountforVPAutomation",
      "getCompaniesInfoForAllVendors",
      "updateAutoVpPermission",
      "getMarketsforGenRunReport",
      "getUserInfoForCompanies",
      "getLoadCqData",
      "getvduHistoryForProject",
      "getSubMarketsforGenRunReport",
      "getAnteenaInformation",
      "getSwitchesforGenRunReport",
      "getDevicesforGenRunReport",
      "getGenRunResult",
      "generatorFuelReport",
      "getGroupsforOpenAlarmsReport",
      "getSwitchesForOpenAlarmReport",
      "getOpenAlarmsDataReport",
      "getUserIVRDetails",
      "siteLogout",
      "getAlarm",
      "session",
      "createContact",
      "updateContact",
      "deleteContact",
      "submitPMDetails",
      "submitFPQuoteInvoice",
      "saveDeviceToEnodeb",
      "submitInspectionInfo",
      "submitTowerInsp",
      "generateInspPDF",
      "submitLockRequest",
      "submitNotes",
      "submitAttachment",
      "createPMList",
      "updateScheduleDate",
      "getTemplateData",
      "getTemplateDataGen",
      "uploadFiles",
      "submitElog",
      "submitElogComment",
      "updateWOStatus",
      "updateScheduleRequest",
      "getAttachmentsList",
      "downloadFile",
      "downloadVSFile",
      "downloadElogFile",
      "downloadLockUnlockAttachment",
      "getSitesBySubmarket",
      "getLockData",
      "getRecentActivity",
      "submitWORequest",
      "getGeneratorInfoForUnid",
      "getHvacInfoForUnid",
      "getManagersForSubmarket",
      "getVendorTechForVendorId",
      "getVendorList",
      "getSiteSectorCarriers",
      "getSpectrumHistory",
      "getSpectrumResult",
      "getSpectrumDownload",
      "submitWORequest",
      "submitScheduleRequest",
      "getGenTanknfoForUnid",
      "submitGenReadings",
      "createSpectrumAnalyzer",
      "getVendorWoByUnid",
      "getSwitchDetails",
      "ivrEmailNotification",
      "submitPMDetails",
      "submitInspectionInfo",
      "submitLockRequest",
      "submitNotes",
      "submitAttachment",
      "getTemplateData",
      "uploadFiles",
      "getWorkTypes",
      "getWorkScope",
      "resendUserActivationInvite",
      "getMarketListEsso",
      "getVendorsListEsso",
      "getDangerousSite",
      "getRoofTopInfo",
      "getReceivedSitesVendor",
      "get5gRepeaterProjectDetails",
      "serialNumberUpdate",
      "checkForValidSession",
      "saveUserActivity"
    ]
  });
}
export default schema;
