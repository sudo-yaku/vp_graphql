export const typeDefs = `
type pmListObject{
    pmLists: [pmList]
    pmListItemsStatusCount: [pmListItemsStatusCount]
    pmRefList : [pmRefListObject]
    vzReviewPMlists : [String]
    pmListYears: [String]
    erpFlag : String
}
type pmList{
    PM_LIST_ID:Int
    PM_LIST_NAME:String
    PO_STATUS:String
    BUYER:String
    BUYER_ID:String
    PM_TYPE_ID:Int
    PM_TYPE_NAME:String
    FREQUENCY:String
    PM_LIST_STATUS:String
    PERCENTAGE:Float
    PO_NUM:String
    IS_VENDOR_REQUESTED:String
    IS_COMPLETED:String
    MANAGER:String
    MANAGER_EMAIL:String
    VENDOR_EMAIL:String
    BUYER_EMAIL:String
    MANAGER_ID:String
    S4_PO_NUM : String
    VENDOR_MDGID: String
    VENDOR_ID:String
}
type pmListItemsStatusCount{
     STATUS_COUNT:Int
     PM_ITEM_STATUS:String
     PM_LIST_ID:Int
}
type pmRefListObject{
    PM_TYPE_ID: Int
    PO_GROUP: String
    PM_TYPE_NAME: String
    PO_ITEM_ID: String
    MMID: String
    PARTENT_ITEM_ID: String
    CHILD_PM_TYPE_ID: Int
    PO_DESCRIPTION:String
    PO_TYPE_SUB_CATEGORY:String
    CHILD_ITEM_ID: String
    SOURCE_SYSTEM: String
    COST_CENTER: String
    PROJECT_CODE: String
    EQUIPMENT_TYPE:String
}`