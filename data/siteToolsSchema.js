export const typeDefs = `
  type WorkOrderForSiteResponse{
    statusCode: Int
    message: String
    data: JSON
  }
  type NodesResponse{
    statusCode: Int
    message: String
    data: [JSON]
  }
  type HeatMapResponse{
    statusCode: Int
    message: String
    data: [JSON]
  }
  input postTaskTypeInput {
    payload: JSON
  }

  type postTaskTypeResponse {
    statusCode: Int
    message: String
    data: JSON
  }

  type TaskTypeResponse {
    statusCode: Int
    message: String
    data: JSON
  }
`
