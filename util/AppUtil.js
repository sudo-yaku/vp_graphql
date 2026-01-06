const httpContext = require('express-http-context');

export const WORKPENDING = "WORKPENDING"
export const WORKACCEPTED = "WORKACCEPTED"
export const APPROVED = "APPROVED"
export const QUOTEPENDING = "QUOTEPENDING"
export const QUOTEAPPROVED = "QUOTEAPPROVED"
export const QUOTERECEIVED = "QUOTERECEIVED"
export const COMPLETED = "COMPLETED"
export const AWAITING_PO = "AWAITING_PO"
export const PO_REQUEST = "PO_REQUEST"
export const WORKORDERPANEL = "workorder"
export const WORKAWAITEDPANEL = "closed"
export const WORKCOMPLETEDPANEL = "completed"
export const PORTALADMIN = 'PORTALADMIN'
export const WORKCOMPLETE = "WORKCOMPLETE"
export const QUOTEDECLINED = "QUOTEDECLINED"

export const STATUS_QUOTEPENDING = "QUOTEPENDING"

export const STATUS_QUOTERECEIVED = "QUOTERECEIVED"
export const STATUS_QUOTEAPPROVED = "QUOTEAPPROVED"
export const STATUS_POREQUESTED = "POREQUESTED"
export const STATUS_WORKPENDING = "WORKPENDING"
export const STATUS_WORKCOMPLETED = "WORKCOMPLETED"
export const STATUS_WORKACCEPTED = "WORKACCEPTED"
export const STATUS_COMPLETED = "COMPLETED"
export const STATUS_QUOTEDECLINED = "QUOTEDECLINED"

export const STATUS_AWAITING_PO = "AWAITING_PO"

export const getStatus = function (QuoteStatus, WOStatus) {
  if (QuoteStatus === QUOTEDECLINED && WOStatus === APPROVED) { return STATUS_QUOTEPENDING }
  if (QuoteStatus === QUOTEPENDING && WOStatus === APPROVED) { return STATUS_QUOTEPENDING }
  if (QuoteStatus === QUOTERECEIVED && WOStatus === APPROVED) { return STATUS_QUOTERECEIVED }
  if (QuoteStatus === QUOTEAPPROVED && WOStatus === APPROVED) { return STATUS_QUOTEAPPROVED }
  if (QuoteStatus === QUOTEAPPROVED && WOStatus === WORKPENDING) { return STATUS_WORKPENDING }
  if (QuoteStatus === QUOTEAPPROVED && WOStatus === WORKACCEPTED) { return STATUS_WORKACCEPTED }
  if (QuoteStatus === COMPLETED && WOStatus === PO_REQUEST) { return STATUS_POREQUESTED }
  if (QuoteStatus === COMPLETED && WOStatus === WORKPENDING) { return STATUS_WORKPENDING }
  if (QuoteStatus === COMPLETED && WOStatus === WORKCOMPLETE) { return STATUS_COMPLETED }
  if (QuoteStatus === COMPLETED && WOStatus === WORKACCEPTED) { return STATUS_WORKACCEPTED }
  if (QuoteStatus === COMPLETED && WOStatus === COMPLETED) { return STATUS_COMPLETED }
  if (QuoteStatus === AWAITING_PO && WOStatus === WORKPENDING) { return STATUS_AWAITING_PO }
}

export const SSO_EXPIRE_SESSION = "SSO_EXPIRE_SESSION"

export function constructSessionExpireResponse(session) {
  const url = setURLInContext(session);
  const ssoUser = isSSOUser(session);
  let responseData = { code: '200', message: "Success" };
  if (ssoUser) {
    responseData['message'] = SSO_EXPIRE_SESSION;
  }
  return responseData
}
export function setURLInContext(session) {
  const userdata = session && session.userdata ? session.userdata : null;
  const issouser = (!userdata || !userdata["isssouser"]) ? false : userdata["isssouser"];
  const logouturl = issouser ? userdata['ssoLogoutURL'] : null;
  const url = logouturl ? logouturl : null;
  if (url) {
    httpContext.set('logouturl', logouturl);
  }
  return url;
}
export function isSSOUser(session) {
  const userdata = session && session.userdata ? session.userdata : null;
  const issouser = (!userdata || !userdata["isssouser"]) ? false : userdata["isssouser"];
  return issouser;
}

const WORK_STATUS_APPROVED = "APPROVED"
const WORK_STATUS_CANCELLED = "CANCELLED"
const WORK_STATUS_PO_REQUEST = "PO_REQUEST"
const WORK_STATUS_WORKACCEPTED = "WORKACCEPTED"
const WORK_STATUS_WORKCOMPLETE = "WORKCOMPLETE"
const WORK_STATUS_WORKDECLINED = "WORKDECLINED"
const WORK_STATUS_WORKPENDING = "WORKPENDING"
const WORK_STATUS_PENDINGAPPROVAL = "PENDINGAPPROVAL"
const WORK_STATUS_WORKFUNDING = "WORKFUNDINGAPPROVAL"
const WORK_STATUS_UPFUNDEDREQUEST = "UPFUNDED_PO_REQUEST"

const QUOTE_STATUS_AWAITING_PO = "AWAITING_PO"
const QUOTE_STATUS_COMPLETED = "COMPLETED"
const QUOTE_STATUS_QUOTEAPPROVED = "QUOTEAPPROVED"
const QUOTE_STATUS_QUOTECANCELLED = "QUOTECANCELLED"
const QUOTE_STATUS_QUOTEDECLINED = "QUOTEDECLINED"
const QUOTE_STATUS_QUOTEPENDING = "QUOTEPENDING"
const QUOTE_STATUS_QUOTERECEIVED = "QUOTERECEIVED"
const QUOTE_STATUS_PENDINGWOAPPROVAL = "PENDING_WOAPPROVAL"

export const VENDOR_STATUS_PENDING_APPROVAL = "Pending Approval"
export const VENDOR_STATUS_AWAITING_PO = "Awaiting PO"
export const VENDOR_STATUS_ACKNOWLEDGEMET_PENDING = "DA Acknowledgement Pending"
export const VENDOR_STATUS_WORK_PENDING = "Work Pending"
export const VENDOR_STATUS_QUOTE_DECLINED = "Quote Declined"
export const VENDOR_STATUS_QUOTE_PENDING = "Quote Pending"
export const VENDOR_STATUS_QUOTE_RECEIVED = "Quote Received"
export const VENDOR_STATUS_WORK_CANCELLED = "Work Cancelled"
export const VENDOR_STATUS_WORK_ACCEPTED = "Work Accepted"
export const VENDOR_STATUS_WORK_COMPLETED = "Work Completed"
export const VENDOR_STATUS_WORK_DECLINED = "Work Declined"


export const getVendorStatus = function (WOStatus, QuoteStatus, vendor_status, work_type, priority) {
  const validWorkTypes = ["Antenna / Tower"];
  const validWorkTypesUpper = ["SMALL CELL", "AP RADIO", "MDU"];

  if (WOStatus && WOStatus !== WORK_STATUS_CANCELLED && vendor_status === "Acknowledge Pending" && priority?.toUpperCase() === "DIRECT AWARD" && 
    work_type && (validWorkTypes.includes(work_type) || validWorkTypesUpper.includes(work_type?.toUpperCase()))) {
    return VENDOR_STATUS_ACKNOWLEDGEMET_PENDING;
  }
  else{
    switch (WOStatus) {
    case WORK_STATUS_APPROVED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_PENDING;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_PENDING
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_PENDING
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_QUOTE_PENDING
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_QUOTE_RECEIVED
        default:
          return;
      }
    case WORK_STATUS_CANCELLED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_CANCELLED;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_CANCELLED;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_CANCELLED;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_WORK_CANCELLED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_WORK_CANCELLED;
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_CANCELLED;
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_WORK_CANCELLED;
        default:
          return;
      }
    case WORK_STATUS_PO_REQUEST:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        default:
          return;
      }
    case WORK_STATUS_WORKFUNDING:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_AWAITING_PO;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        default:
          return;
      }
    case WORK_STATUS_UPFUNDEDREQUEST:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        default:
          return;

      }
    case WORK_STATUS_WORKACCEPTED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_ACCEPTED;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_ACCEPTED;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_ACCEPTED;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_ACCEPTED;
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_WORK_ACCEPTED;
        default:
          return;
      }
    case WORK_STATUS_WORKCOMPLETE:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_COMPLETED;
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_WORK_COMPLETED;
        default:
          return;

      }
    case WORK_STATUS_WORKDECLINED:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_DECLINED
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_DECLINED
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_DECLINED
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_DECLINED
        default:
          return;
      }
    case WORK_STATUS_WORKPENDING:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_WORK_PENDING;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_WORK_PENDING;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_WORK_PENDING;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_WORK_PENDING;
        default:
          return;
      }
    case WORK_STATUS_PENDINGAPPROVAL:
      switch (QuoteStatus) {
        case QUOTE_STATUS_AWAITING_PO:
          return VENDOR_STATUS_PENDING_APPROVAL;
        case QUOTE_STATUS_COMPLETED:
          return VENDOR_STATUS_PENDING_APPROVAL;
        case QUOTE_STATUS_QUOTEAPPROVED:
          return VENDOR_STATUS_PENDING_APPROVAL;
        case QUOTE_STATUS_QUOTECANCELLED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEDECLINED:
          return VENDOR_STATUS_QUOTE_DECLINED;
        case QUOTE_STATUS_QUOTEPENDING:
          return VENDOR_STATUS_PENDING_APPROVAL;
        case QUOTE_STATUS_QUOTERECEIVED:
          return VENDOR_STATUS_PENDING_APPROVAL;
        case QUOTE_STATUS_PENDINGWOAPPROVAL:
          return VENDOR_STATUS_PENDING_APPROVAL;
        default:
          return;
      }
    default:
      break;
  }
}
}