export const typeDefs = `
type bidUnitRulesResponse{
    statusCode: Int
    message: String
    data: [bidUnitRulesData]
  }
  type bidUnitRulesData{
    id: String
    ruleType: String
    ruleName: String
    bidUnit: String
    description: String
    ruleCondition: JSON
    isEnabled: String
    createdOn: String
    createdBy: String
    modifiedOn: String
    modifiedBy: String
  }
  input postInvoiceSubmitInput {
    metadata: JSON
    body: JSON
}  
type postInvoiceSubmitResponse {
  status: String
  findings: JSON
  metadata: JSON
  auditData: JSON
},
type lineItemsByWorkOrderIdResponse {
  statusCode: Int
  message: String
  data: [JSON]
}
    type vendorWorkOrderByWorkOrderIdResponse {
  statusCode: Int
    message: String
    data: JSON
}
    type postAuditSubmitResponse {
  statusCode: Int
  message: String
  data: JSON
}
  type auditByWorkOrderByWorkOrderIdResponse{
  statusCode: Int
    message: String
    data: JSON
}
    input CatalogDetailsInput {
    metaUniversalId: String
    psItemId: String
    bidUnit: String
    serviceType: String
  }
  
  input InvoiceCompletionLineItemInput {
    auditLineItemId: Int
    bidUnitCatalogId: String
    catalogDetails: CatalogDetailsInput
    invoiceAuditLineNum: String
  }
  
  input InvoiceCompletionTransactionInput {
    workOrderId: Int
    isOverridden: Boolean
    overrideComments: String
    lineItems: [InvoiceCompletionLineItemInput]
  }
  
  type InvoiceCompletionTransactionResponse {
    statusCode: Int
    message: String
    data: JSON
  }
  type auditInvoiceByWorkOrderIdResponse{
  statusCode: Int
    message: String
    data: JSON
  }
    type oswInfoResponse{
    statusCode: Int
    message: String
    data: [JSON]
    }
`
