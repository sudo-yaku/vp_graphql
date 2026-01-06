let o  = function(data)
{
	this.DISASTER_RECOVERY = data["disaster_recovery"]
	this.PRODUCT_CODE = data["product_code"]
	this.EVENT_NAME = data["event_name"]
    this.REQUESTED_BY=data["requested_by"]
	this.REQUESTED_DATE=data["requested_date"]
	this.REQUESTOR_TITLE=data["requestor_title:"]
	this.REQUESTOR_EMAIL=data["requestor_email"]
	this.REQUESTOR_PHONE=data["requestor_phone"]
	this.ACCT_CONTACT=data["acct_contact"]
	this.ACCT_EMAIL=data["acct_email"]
	this.EXP_MARKET_PROJ_ID=data["exp_market_proj_id"]
	this.WBS=data["wbs_id"] ? data["wbs_id"] : data["exp_market_proj_id"]
	this.COMPANY_CODE=data["company_code"] ? data["company_code"] : ''
	this.MGR_EMAIL=data["mgr_email"]
	this.SITE_TYPE=data["site_type"]
	this.SITE_KEY=data["site_key"]
	this.PRIORITY=data["priority"]
	this.WORK_TYPE=data["work_type"]
	this.WORK_SCOPE=data["work_scope"]
	this.ENG_REVIEW_REQUIRED=data["eng_review_required"]
	this.BYPASS_APPROVAL=data["bypass_approval"]
	this.CFD_WORKORDER_LINES=data["cfd_workorder_lines"]
	this.CFD_QUOTE_VENDORID_1=data["cfd_quote_vendorid_1"]
	this.CFD_QUOTE_VENDORNAME_1=data["cfd_quote_vendorname_1"]
	this.CFD_QUOTE_VENDOREMAIL_1=data["cfd_quote_vendoremail_1"]
	this.CFD_QUOTE_STATUS_1=data["cfd_quote_status_1"]
	this.WORK_AWARD_DATE=data["work_award_date"]
	this.WORK_DUE_DATE=data["work_due_date"]
	this.FINANCE_TYPE=data["finance_type"]
	this.PEOPLESOFT_PROJ_ID=data["peoplesoft_proj_id"]
	this.PO_NUMBER=data["po_number"]
	this.PRICING_MATRIX_COST_TYPE = data["pricing_matrix_cost_type"]
	this.PRICING_MATRIX_ELIGIBLE = data["pricing_matrix_eligible"]
	this.CREATED_BY_VENDOR_ID =data["created_by_vendor_id"]
	this.CREATED_BY_VENDOR_USERID  =data["created_by_vendor_userid"]
	this.SOURCE_SYSTEM =data["iopvendorportal"]
	this.WORKORDER_STATUS = data["work_order_status"]
	this.SOURCE_SYSTEM = data["source_system"]
	this.FUEL_TYPE = data["fuel_type"]
	this.FUEL_LEVEL = data["current_fuel_level"]
	this.CFD_QUOTE_FUELTOTAL_1 = data["cfd_quote_fueltotal_1"] ? data["cfd_quote_fueltotal_1"] : ''
	this.CFD_QUOTE_LABORTOTAL_1 = data["cfd_quote_labortotal_1"] ? data["cfd_quote_labortotal_1"] : ''
	this.CFD_QUOTE_MATERIALSTOTAL_1 = data["cfd_quote_materialstotal_1"] ? data["cfd_quote_materialstotal_1"] : ''
	this.CFD_QUOTE_TOTAL_1 = data["cfd_quote_total_1"] ? data["cfd_quote_total_1"] : ''
	this.CFD_QUOTE_VENDORCOMMENTS_1 = data["cfd_quote_vendorcomments_1"] ? data["cfd_quote_vendorcomments_1"] : ''
	this.CFD_QUOTE_REPLYDATE_1 = data["cfd_quote_replydate_1"] ? data["cfd_quote_replydate_1"] : ''
	this.CFD_NOLINEITEMSREQUIRED = data["cfd_nolineitemsrequired"] ? data["cfd_nolineitemsrequired"] : 1
	if(data["work_type"] == 'Vandalism'){
		this.POLICE_REPORT_FILED = data["police_report_filed"] ? data["police_report_filed"] : null
		this.LEAK_PRESENT = data["leak_present"] ? data["leak_present"] : null
		this.ENV_HOTLINE_CALLED = data["evn_hotline_called"] ? data["evn_hotline_called"] : null
	}
	if(data["site_type"] == "SWITCH" && data["priority"] == "BID / AVAILABILITY"){
		this.FUEL_TYPE = 'N/A'
		this.FUEL_LEVEL = '0.1'
	}
}


module.exports = o;
