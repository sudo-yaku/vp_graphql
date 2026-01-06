export const typeDefs = `
type HostnameMappingResponse {
  data: JSON
}

type HpovServerResponse {
  data: JSON
}

type PingResponse {
  data: JSON
}
input HPOVRegistrationInput{
  spmProjectId: String
  siteUnid: String
  hpovDeviceRegistration: JSON
}
type HPOVRegistrationResponse {
  statusCode: Int
  message: String
  data: JSON
}
type TestInfoResponse {
  statusCode: Int
  message: String
  test_info: JSON
}
input EatTestRequestInput {
  siteUnid: String
  createdBy: String
  testTypeNames: [String]
  siteType: String
  isAdhocTest: Int
  spmId: Int
  rmuDeviceName: String
  sourceSystem: String
}
type EatTestRequestResponse {
  statusCode: Int
  message: String
  eat_tests: [JSON]
}
type OpenTestResponse {
  statusCode: Int
  message: String
  eat_test_status: JSON
}
input CancelEatTestInput {
  eatTestId: Int
  userId: String
}
type CancelEatTestResponse {
  statusCode: Int
  message: String
  user_id: String
}
type TestHistoryResponse {
  statusCode: Int
  message: String
  eat_tests: [JSON]
}
type TestStatusResponse {
  statusCode: Int
  message: String
  eat_test_status: JSON
}
input StartEatTestInput {
  eatTestId: Int
  userId: String
  indiv_tests: [JSON]
}
type StartEatTestResponse {
  statusCode: Int
  message: String
  eat_test_status: JSON
}
input StopEatTestInput {
  eatTestId: Int
  userId: String
}
type StopEatTestResponse {
  statusCode: Int
  message: String
  eat_test_status: JSON
}
input CompleteEatTestInput {
  eatTestId: Int
  userId: String
  source_system: String
  email_list: [String]
  vendor_fname: String
  vendor_lname: String
  company_name: String
}
type CompleteEatTestResponse {
  statusCode: Int
  message: String
  user_id: String
}
type TestAuditDetailsResponse{
  statusCode: Int
  message: String
  audit_info: JSON
}
type SiteTypesResponse{
  statusCode: Int
  message: String
  site_types: [JSON]
}
`
