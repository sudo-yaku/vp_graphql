export const typeDefs = `

type recentActivity{
    recent_activities : [RecentActivity]
}
type RecentActivity{
    SECTOR_REQ_UNQ_ID: String
    SECTOR_REQUEST_TYPE: String
    WORK_REQUEST_TYPE: String
    SITE_TYPE: String
    SITE_NAME: String
    WORK_ORDER_ID: String
    WORK_TYPE: String
    WORK_INFO : String
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
    LOCK_UNLOCK_REQUEST_ID: String
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
    WORK_COMPLETE_NOTES: String,
    VENDOR_ID: String
}`