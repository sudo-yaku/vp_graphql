export const typeDefs = `
type samsung_radio_update_details {
    data: [radio_update_details]
}
type radio_update_details {
    REQUEST_ID : String
    SITE_UNID : String
    CREATED_ON : String
    NODE_ID : String
    MODIFIED_ON : String
    SOURCE : String
    OSW_ID : String
    STATUS : String
    NOTE : String
    CREATED_BY : String
}

type check_socket_and_disconnect {
    message: String
}
type updateSamsungSNresp {
    result: String
    request_id: String
    errors : JSON
}
type updateStayAutoResp {
    message: String
    lock_unlock_request_id: String
}
type oswDates{
    Osw_Date : [String]
}

input updateSamsungSNinput {
    node_id: [String]
    source: String
    osw_id: String
    notes: String
    created_by: String
    sector: String
}
input OSWTrained_Input {
    oswTrainedInput: vendor_trained_input
}
input vendor_trained_input {
    vendor_trained: String,
    opstracker_userid: String
}
type vendor_trained_resp {
    updateVendorTrained: JSON
    errors : JSON
}
type getOswIssueTypesResponse {
  issue_type: [String]
}`