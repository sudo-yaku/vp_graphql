let vendorWOFilterWithStatus  = function(data)
{
      this.workorder_id=data["workorder_id"] ? data["workorder_id"] : null
      this.work_type=data["work_type"] ? data["work_type"] : null
      this.work_scope=data["work_scope"] ? data["work_scope"] : null
      this.requested_by= null
      this.requested_by_name= null
      this.requested_date= null
      this.work_order_appr_status= null
      this.work_order_appr_by= null
      this.work_order_appr_date= null
      this.approved_by_name= null
      this.vendor_name= null
      this.workorder_status=data["workorder_status"] ? data["workorder_status"] : null
      this.next_step= null
      this.po_number=data["po_number"] ? data["po_number"] : null
      this.po_status= null
      this.po_rcpt_status= null
      this.approved_total= null
      this.bypass_approval= null
      this.bypass_quotes= null
      this.work_due_date=data["work_due_date"] ? data["work_due_date"] : null
      this.vendor_status= null
      this.vendor_status_by= null
      this.vendor_status_date= null
      this.work_award_date= null
      this.priority= data['priority'] ? data['priority'] : null
      this.meta_universalid=data["meta_universalid"] ? data["meta_universalid"] : null
      this.site_type=data["site_type"] ? data["site_type"] : null
      this.work_accepted_date=data["work_accepted_date"] ? data["work_accepted_date"] : null
      this.work_completed_date=data["work_completed_date"] ? data["work_completed_date"] : null
      this.quote_statuses=data["quote_statuses"] ? data["quote_statuses"] : null
      this.site_id=data["site_id"] ? data["site_id"] : null
      this.site_name=data["site_name"] ? data["site_name"] : null
      this.switch=data["switch"] ? data["switch"] : null
      this.site_unid=data["site_unid"] ? data["site_unid"] : null
      this.tech_id=data["tech_id"] ? data["tech_id"] : null
      this.techmanager_id=data["techmanager_id"] ? data["techmanager_id"] : null
      this.techdirector_id=data["techdirector_id"] ? data["techdirector_id"] : null
      this.techmanager_name=data["techmanager_name"] ? data["techmanager_name"] : null
      this.sitemanager_name=data["sitemanager_name"] ? data["sitemanager_name"] : null
      this.quoteitems = []
}

let vendorWOFilterWithWorkOrderId  = function(data, quoteNum='1')
{
      this.workorder_id=data["workorder_id"] ? data["workorder_id"] : null
      this.work_type=data["work_type"] ? data["work_type"] : null
      this.work_scope=data["work_scope"] ? data["work_scope"] : null
      this.requested_by=data["requested_by"] ? data["requested_by"] : null
      this.requested_by_name=data["cfd_requested_by"] ? data["cfd_requested_by"] : null
      this.requested_date=data["requested_date"] ? data["requested_date"] : null
      this.work_order_appr_status=data["work_order_appr_status"] ? data["work_order_appr_status"] : null
      this.work_order_appr_by=data["work_order_appr_by"] ? data["work_order_appr_by"] : null
      this.work_order_appr_date=data["work_order_appr_date"] ? data["work_order_appr_date"] : null
      this.approved_by_name= null
      this.vendor_name=data["cfd_approved_vendor_name"] ? data["cfd_approved_vendor_name"] : null
      this.workorder_status=data["workorder_status"] ? data["workorder_status"] : null
      this.next_step= null
      this.po_number=data["po_number"] ? data["po_number"] : null
      this.po_status= null
      this.po_rcpt_status= null
      this.approved_total=data["approved_total"] ? data["approved_total"] : null
      this.bypass_approval=data["bypass_approval"] ? data["bypass_approval"] : null
      this.bypass_quotes=data["bypass_quotes"] ? data["bypass_quotes"] : null
      this.work_due_date=data["work_due_date"] ? data["work_due_date"] : null
      this.vendor_status=data["vendor_status"] ? data["vendor_status"] : null
      this.vendor_status_by=data["vendor_status_by"] ? data["vendor_status_by"] : null
      this.vendor_status_date=data["vendor_status_date"] ? data["vendor_status_date"] : null
      this.work_award_date=data["work_award_date"] ? data["work_award_date"] : null
      this.priority=data["priority"] ? data["priority"] : null
      this.meta_universalid=data["meta_universalid"] ? data["meta_universalid"] : null
      this.site_type=data["site_type"] ? data["site_type"] : null
      this.work_accepted_date=data["work_accepted_date"] ? data["work_accepted_date"] : null
      this.work_completed_date=data["work_completed_date"] ? data["work_completed_date"] : null
      this.quote_statuses=data["cfd_quote_status_"+quoteNum] ? data["cfd_quote_status_"+quoteNum] : null
      this.site_id=data["site_id"] ? data["site_id"] : null
      this.site_name=data["site_name"] ? data["site_name"] : null
      this.switch=(data["site_type"]=="SWITCH") ? data["site_name"] : null
      this.site_unid=data["site_key"] ? data["site_key"] : null
      this.tech_id=data["work_accepted_by"] ? data["work_accepted_by"] : null
      this.techmanager_id=data["cfd_mgr_userid"] ? data["cfd_mgr_userid"] : null
      this.techdirector_id= null
      this.techmanager_name=data["mgr_email"] ? data["mgr_email"] : null
      this.sitemanager_name=data["mgr_email"] ? data["mgr_email"] : null
      this.quoteitems = [new QuoteItems(data, quoteNum)]
      this.trouble_ticket_details = data["trouble_ticket_details"] ? data["trouble_ticket_details"] : []
      this.is_vip_site = data["is_vip_site"] ? data["is_vip_site"] : null
}

let QuoteItems = function(data, quoteNum='1') {
          this.workorder_quote_id= null
          this.vendor_id= data["cfd_quote_vendorid_"+quoteNum] ? data["cfd_quote_vendorid_"+quoteNum] : null
          this.workorder_id= data["workorder_id"] ? data["workorder_id"] : null
          this.vendor_email= data["cfd_quote_vendoremail_"+quoteNum] ? data["cfd_quote_vendoremail_"+quoteNum] : null
          this.status= data["cfd_quote_status_"+quoteNum] ? data["cfd_quote_status_"+quoteNum] : null
          this.status_date= data["cfd_quote_statusdate_"+quoteNum] ? data["cfd_quote_statusdate_"+quoteNum] : null
          this.status_by= data["cfd_quote_statusby_"+quoteNum] ? data["cfd_quote_statusby_"+quoteNum] : null
          this.quote_request_email_date= data["work_order_appr_date"] ? data["work_order_appr_date"] : null
          this.quote_reply_recv_date= data["cfd_quote_replydate_"+quoteNum] ? data["cfd_quote_replydate_"+quoteNum] : null
          this.quote_total= data["cfd_quote_total_"+quoteNum] ? data["cfd_quote_total_"+quoteNum] : null
          this.quote_labor_total= data["cfd_quote_labortotal_"+quoteNum] ? data["cfd_quote_labortotal_"+quoteNum] : null
          this.quote_materials_total= data["cfd_quote_materialstotal_"+quoteNum] ? data["cfd_quote_materialstotal_"+quoteNum] : null
          this.quote_vendor_comments= data["cfd_quote_vendorcomments_"+quoteNum] ? data["cfd_quote_vendorcomments_"+quoteNum] : null
          this.quote_vzw_comments= data["cfd_quote_vzwcomments_"+quoteNum] ? data["cfd_quote_vzwcomments_"+quoteNum] : null
          this.quote_log= data["cfd_quote_log_"+quoteNum] ? data["cfd_quote_log_"+quoteNum] : null
          this.meta_universalid= data["cfd_workorder_quote_id_"+quoteNum] ? data["cfd_workorder_quote_id_"+quoteNum] : null
          this.meta_createddate= data["meta_createddate"] ? data["meta_createddate"] : null
          this.meta_createdby= data["meta_createdby"] ? data["meta_createdby"] : null
          this.meta_lastupdatedate= data["meta_lastupdatedate"] ? data["meta_lastupdatedate"] : null
          this.meta_lastupdateby= data["meta_lastupdateby"] ? data["meta_lastupdateby"] : null
          this.actual_fuel_total= data["actual_fuel_total"] ? data["actual_fuel_total"] : null
          this.actual_labor_total= data["actual_labor_total"] ? data["actual_labor_total"] : null
          this.actual_materials_total= data["actual_materials_total"] ? data["actual_materials_total"] : null
          this.actual_total= data["actual_total"] ? data["actual_total"] : null
          this.quote_fuel_total= data["cfd_quote_fueltotal_"+quoteNum] ? data["cfd_quote_fueltotal_"+quoteNum] : null
          this.quote_marked_completed= data["cfd_quote_marked_completed_"+quoteNum] ? data["cfd_quote_marked_completed_"+quoteNum] : null
          this.source_system= null
        }


module.exports = {vendorWOFilterWithStatus, vendorWOFilterWithWorkOrderId};
