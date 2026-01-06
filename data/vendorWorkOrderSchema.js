export const typeDefs = `
type wo_response {
    errors: JSON
    vendor_wo_details:[workorder]
    dashboard:dashboard
    user_dashboard:user_dashboard
    WorkType:[WorkType]
    rma_data: [rmaData]
}
type WorkType{
    label:String
    value:String
}
type workorder{
    workorder_id : Int
    work_type : String
    work_scope : String
    requested_by : String
    requested_by_name : String
    requested_date : String
    work_order_appr_status : String
    work_order_appr_by : String
    work_order_appr_date : String
    approved_by_name : String
    area: String
    region: String
    market: String
    vendor_name : String
    workorder_status : String
    vendor_portal_status:String
    next_step : String
    po_number : String
    po_status : String
    po_rcpt_status : String
    approved_total : String
    bypass_approval : Int
    bypass_quotes : Int
    work_due_date : String
    work_award_date : String
    priority : String
    meta_universalid : String
    site_type : String
    work_accepted_date : String
    work_completed_date : String
    quote_statuses : String
    site_id : String
    site_name : String
    switch : String
    site_unid : String
    tech_id : String
    techmanager_id : String
    techdirector_id : String
    techmanager_name: String
    sitemanager_name: String
    covid19_restricted: String
    root_drive: Boolean
    vendor_status : String
    vendor_status_by : String
    vendor_status_date : String
    quoteitems : [quoteitems]
    work_declined_count: Int
    device_uts_id :JSON
    events : JSON
    is_donor: Boolean
    is_hazardous_site: Boolean
    hazard_type: String
    hazard_justification: String
    quote_decline_count: Int
    trouble_ticket_details: [trouble_ticket_details]
    work_urgency: String
  }
    type trouble_ticket_details {
  wo_id: String
  ticket_trouble_type: String
  ticket_created_on: String
}
  type vwrsIDSerachQueryResponse{
    cfd_lineitems: [cfd_lineitems]
  }

  type cfd_lineitems {
    name:String
    value:JSON
  }
  type quoteitems{
    workorder_quote_id : Int
    vendor_id : Int
    workorder_id : Int
    vendor_email : String
    status : String
    status_date : String
    status_by : String
    decline_history_json: String
    quote_request_email_date : String
    quote_reply_recv_date : String
    quote_total : String
    quote_labor_total : String
    quote_materials_total : String
    quote_vendor_comments : String
    quote_vzw_comments : String
    quote_log: String
    meta_universalid : String
    meta_createddate : String
    meta_createdby : String
    meta_lastupdatedate : String
    meta_lastupdateby : String
    actual_fuel_total : String
    actual_labor_total : String
    actual_materials_total : String
    actual_total : String
    quote_fuel_total : String
    quote_marked_completed : String
  }
  type user_dashboard{
    requested:[_splitedData]
    quote:[_splitedData]
    work:[_splitedData]
    mdurequested:[_splitedData]
    mduquote:[_splitedData]
    mduwork:[_splitedData]
    rma:[_splitedData]
    history:[_splitedData]
  }
  type _splitedData{
    name:String
    data:[String]
    color:String
    woType:[String]
  }
  type fetchBucketCraneSiteDetails_response{
    result: BucketCrane_res       
  }
  type BucketCrane_res{
    bucket_required: String
    vendor_comments: String
    crane_required: String
    bucket_required_height: String
    is_tower_climable: String
  }
  input bulkUpdatePendingAckInput {
    data: JSON
  }
  type bulkUpdatePendingAckResp{
    message : String
  }
  type ackFromRedisResponse{
    redisData : String
  }
  type DistanceRepsonse {
    workOrderId: String
    distance: Float
    updated: Boolean
    closestDispatch: closestDispatchType
  }
  type closestDispatchType {
    address: String
    latitude: Float
    longitude: Float
    distance: Float
  }
  type rmaData{
    RMA_DETAILS_ID: String
    SITE_UNID: String
    STATUS: String
    ENODEB_SEC_CAR: String
    OEM_VENDOR: String
    TAC_INTERNAL_REF: String
    TAC_INTERNAL_REF_NO: String
    CATS_RMA: String
    PART_CODE: String
    ASSET_CODE: String
    TRACKING_NO: String
    VENDOR_RA_NO: String
    ALT_SHIPPING_ADDR: String
    LDC_ADDR: String
    BU_LOCATION: String
    RMA_RETURN_REASON_ID: String
    RMA_TROUBLE_DESCRIPTION_ID: String
    OEM_FAILURE_CODE: String
    SOFTWARE_RELEASE: String
    FAILURE_DATE: String
    REPLACEMENT_DATE: String
    FAILURE_MODE_ANALYSIS_REQ: String
    WO_ID: String
    VWRS_ID: String
    ACTIVATION_DATE: String
    RMA_SLA_OPTIONS: String
    REQUIRED_DELIVERY_DATE: String
    WARRANTY: String
    RMA_SWAP_DATE: String
    REPLACEMENT_SERIAL_NO: String
    RETURN_SHIP_DATE: String
    TIMEZONE: String
    CREATED_BY: String
    CREATED_ON: String
    MODIFIED_ON: String
    COMMENTS: String
    UPDATED_BY: String
    CANCELLED_BY: String
    PS_LOCATION_CODE: String
    SHIP_LOCATION_ADDR: String
    REQUESTED_DELIVERY_DATE: String
    REQUESTED_SHIP_DATE: String
    TECH_PHONE: String
    ALT_STREET_ADDR: String
    ALT_CITY: String
    ALT_ZIP_CODE: String
    FUZE_PROJECT_ID: String
    ALT_STATE: String
    HC_REQUEST_ID: String
    MDG_ID: String
    LOCUS_ID: String
    UUID: String
    IS_DRAFT: String
    SWITCH_UNID: String
    IS_DEFAULT_ADDRESS: String
    RMA_PART_CODE: String
    PART_CODE_DESCRIPTION: String
    FUZE_RETURN_REQUEST_NUMBER: String
    FUZE_CREATED: String
    PS_LOCATION_NAME: String
    REPLENISHMENT_REQUIRED: String
    FUZE_STATUS_CODE: String
    FUZE_STATUS: String
    ALTERNATE_EMAIL: String
    FUZE_ERRORS: String
    RMA_SOURCE: String
    VP_USER_ID: String
    VP_USER_NAME: String
    VP_USER_EMAIL: String
    VP_FAILURE_TYPE: String
    S4_ERRORS: String
    ERRORS_LOG: String
    SUCCESS_LOG: String
    S4_OEM_APPROVAL_STATUS: String
    S4_FORWARD_RMA_STATUS: String
    S4_OVERALL_RMA_STATUS: String
    S4_FORWARD_TRACKING_ID: String
    S4_REVERSE_TRACKING_ID: String
    S4_FORWARD_DISPOSITION: String
    S4_SAP_RETURN_REQUEST: String
    S4_ESA_SENT_TIME: String
    S4_CREATED: String
    ALT_STREET_ADDR2: String
    NOWOID_REASON: String
    DELIVERY_SCANNED_ON_TIME: String
    LAST_BUSINESS_DAY_TO_RECEIVE: String
    DELIVERY_TEXT_MSG_SENT: String
    IS_5GHR_RMA: String
    LASTBUSINESSDAY: String
  }
type WorkUrgencyResponse {
  data: [JSON]
}
  type DashboardConfigResponse {
    dashboardConfig: [JSON]
  }

`