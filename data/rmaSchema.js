export const typeDefs = `
type partCodes {
  ASSET_CODE: String
  DESCRIPTION: String
  PART_CODE: String
  VENDOR: String
  DISPLAY_VALUE: String
}

type rmaPartCodes {
  part_codes: [partCodes]
}

type rmaPrepops {
  rma_prepops: prePops
}

type prePops {
  market: String
  submarket: [String]
  tech_name: String
  tech_email: String
  tech_phone_default: String
  tech_id: String
  return_reason: [returnReasons]
  trouble_desc: [troubleDesc]
}

type returnReasons {
  return_reason_id: String
  return_reason: String
  is_trouble_desc: String
}

type troubleDesc {
  trouble_desc_id: String
  trouble_product: String
  trouble_description: String
}

type defectiveSerialNumber {
  data: [String]
}

input filerma{
  file_name : String
  file_size: Int
  file_content: String
}
  
input createDraftRMAInput {
  is_draft: Boolean
  enodeb_sec_car: String
  OEM_vendor: String
  tac_internal_ref: String
  tac_internal_ref_no: String
  part_code: String
  asset_code: String
  LDC_address: String
  BU_location: String
  return_reason_id: String
  trouble_desc_id: String
  OEM_failure_code: String
  software_release: String
  failure_date: String
  failure_mode_analysis_req: String
  workorder_id: String
  vwrs_id: String
  activation_date: String
  ps_loc_code: String
  ship_loc_name: String
  locationAddress: String
  recommended_sla: String
  timezone: String
  replacement_serial_number: String
  siteId: String
  isSecCarAvailable: Boolean
  delivery_date: String
  is_default_address: Boolean
  alt_shipping_address: String
  alt_street_address: String
  alt_city: String
  alt_state: String
  alt_zip_code: String
  req_shipping_date: String
  tech_phone: String
  partcode_description: String
  files: [filerma]
  alt_email_address: String
  created_by: String
  site_unid: String
  site_id: String
  ps_loc_id: String
  locus_id: String
  mdg_id: String
  tech_id: String
  tech_name: String
  is_trouble_desc: String
  submarket: String
  rma_source: String
  vp_user_email: String
  vp_user_name: String
  vp_user_id: String
  vp_failure_type: String
  tech_manager_id: String
}

type createDraftRMAResponse {
  message: String
  rma_id: String
}

input resubmitRMAInput {
  is_draft: Boolean
  enodeb_sec_car: String
  OEM_vendor: String
  tac_internal_ref: String
  tac_internal_ref_no: String
  part_code: String
  asset_code: String
  LDC_address: String
  BU_location: String
  return_reason_id: String
  trouble_desc_id: String
  OEM_failure_code: String
  software_release: String
  failure_date: String
  failure_mode_analysis_req: String
  workorder_id: String
  vwrs_id: String
  activation_date: String
  ps_loc_code: String
  ship_loc_name: String
  locationAddress: String
  recommended_sla: String
  timezone: String
  delivery_date: String
  replacement_serial_number: String
  isSecCarAvailable: Boolean
  is_default_address: Boolean
  alt_shipping_address: String
  alt_street_address: String
  alt_city: String
  alt_state: String
  alt_zip_code: String
  req_shipping_date: String
  tech_phone: String
  fuze_project_id: String
  partcode_description: String
  files: [filerma]
  alt_email_address: String
  rma_id: String
  updated_by: String
  is_trouble_desc: String
  fuzeProjectId: String
  siteName: String
  vp_user_email: String
  vp_user_name: String
  vp_user_id: String
  vp_failure_type: String
  tech_manager_id: String
}

type resubmitRMAResponse {
  message: String
  rma_id: String
}

type getRMAInformation_response {
  result: [RMA_Information]
}
type RMA_Information {
  RMA_NUMBER : String
	IOP_RMA_ID : String
	PART_CODE: String
	PS_LOCATION_NAME: String
	ASSET_CODE: String
	STATUS: String
	RMA_TYPE: String
	TRACKING_NO: String
	WO_ID: String
	VWRS_ID: String
	ACTIVATION_DATE: String
	RETURN_SHIP_DATE: String
	TIMEZONE: String
	REPLACEMENT_SERIAL_NO: String
	SHIP_LOCATION_ADDR: String
	REQUESTED_DELIVERY_DATE: String
	REPLACEMENT_SHIPMENT_DATE: String
	REPLACEMENT_TRACKING_NUMBER: String
	REPLACEMENT_RETURN_STATUS: String
	DEFECTIVE_TRACKING_NUMBER: String
  VP_FAILURE_TYPE: String
  RMA_PART_CODE: String
  PART_CODE_DESCRIPTION: String
  OEM_VENDOR: String
  VP_CD_REASON: String
  ATTACHMENTS: [rmaAttachments]
}

type rmaAttachments {
  ATTACHMENT_NAME: String
  ATTACHMENT_ID: String
}

type getRMADetails_response {
  data: [RMADetails]
}
type RMADetails {
  vwrs_id: String
  rma_list: [RMAList]
}
type RMAList {
  rma_id: String
  rma_status: String
}

input upload_RMA_pictures_input {
  siteUnid: String
  attachmentId: String
  category: String
  uploadedBy: String
  vendorId: String
  attachments: [attachmentsList] 
}
input attachmentsList {
  name: String
  image: String
}

type upload_RMA_pictures_Resp {
  message: String
}

type getRMApicturesResp {
  data: Attachements
}

type Attachements {
  attachments: [RMApicturesData]
  linkedAttachments: [linkedAttachments]
}
type RMApicturesData {
  id: String
  siteUnid: String,
  vendorId: String,
  uploadedBy: String,
  uploadedOn: String,
  categoryId: String,
  category: String
  name: String
}
type linkedAttachments {
  id: String
  siteUnid: String,
  vendorId: String,
  uploadedBy: String,
  uploadedOn: String,
  categoryId: String,
  category: String
  name: String
}

type getRMApicturesPreviewResp {
  attachment: String
}

type getRMAattachmentResponse {
  name: String
  string: String
}

`