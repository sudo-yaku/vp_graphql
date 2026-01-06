export const typeDefs = `
type Fields {
    vendorlocations:[locationDis]
}
type locationDis{
    meta_universalid : String
    meta_createddate: String
    meta_createdby: String
    meta_lastupdatedate: String
    meta_lastupdateby: String
    vendor_name: String
    ps_loc: String
    mdg_id: String
    address: String
    latitude: String
    longitude: String
}
type get_vendorTech_response{
    code:Int
    message:String
    data:[IvrTech]
}
type IvrTech{
    USERID: String
    TECHID: Int
    ACCTLOCKEDIND: Int
    VENDOR_ID: Int
    SUBMARKET_COUNT: Int
    PIN_EXPIRED: String
}`