export const typeDefs = `
type site_data_response {
  sitedetails:SiteData
}

type SiteData{
  enodebs: [enodebs]
  callOutZones: [callout_zones_data]
  node_details: [site_node_deatils]
  siteid: String
  site_unid: String
  name: String
  sitename: String
  area: String
  region: String
  market: String
  switch: String
  site_type: String
  opstracker_url: String
  security_lock: String
  security_lock_noc_int: String
  tower_type: String
  tower_managed_by: String
  tower_manager_phone: String
  tower_noc_monitored: String
  tower_vzw_owned: String
  site_function: String
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
  managername: String
  managerid: String
  mdg_id: String
  locus_id: String
  direction: JSON
  restriction: JSON
  gatecombo1: String
  gatecombo2: String
  accessrestriction: String
  type: String
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
  site_status: String
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
  rstr_birdtype: String
  biologist_name: String
  rstr_isrestricted: String
  bird_restriction: String
  rstr_toweraccess: String
  rstr_groundaccess: String
  rstr_comments: String
  rstr_log: String
  rstr_lastupdatedate: String
  emis_verification: String
  local_fire_dept: String
  local_fire_dept_phone: String
  local_police_dept_phone: String
  contact: [contacts]
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
  antenna_access:String
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
}
type callout_zones_data{
  cz_unid: String
  name: String
  num: String
  period: String
  start_time: String
  stop_time: String
  manager: String
  mgr_phone: String
  phone_no_2: String
  sms: String
  notes: String
  instructions: String
}
type deleteAvianAttachment {
  message: String
}
type uploadAvianAttachmentResponse {
  success: Boolean
  message: String
}
input uploadAvianAttachmentInput {
  bnaMetaUniversalId: String
  attachmentName: String
  fileContent: String
}
type sendEmailNotificationForAvianUpdateRes {
  success: Boolean
  status: Int
}
`;