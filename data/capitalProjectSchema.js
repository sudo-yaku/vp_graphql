export const typeDefs = `
type project_details{
    output: detailsProject
}
type detailsProject{
    siteid: String
    site_unid: String
    sitename: String
    proj_number: String
    project_name: String
    project_type: String
    project_status: String
    ps_loc_code: String
    manager: String
    field_engineer: String
    field_engineer_id : String
    manager_id:String
    project_initiative:[String]
    is_hazardous_site: Boolean
    hazard_type: String
    hazard_justification: String
}
type project_list {
    schedule_projects:[project]
    unschedule_projects:[project]
    totalprojects:String
}
type project{
    siteid: String
    site_unid: String
    sitename: String
    proj_number: String
    project_name: String
    project_type: String
    project_status: String
    ps_loc_code: String
    latitude: String
    longitude: String
    field_engineer_id : String
    field_engineer: String
    manager_id:String
    manager: String
    project_initiative: String
    market: String
    submarket: String
    ops_events: [opsEvents]
}

type opsEvents{
  eventId:String
  start:String
  end:String
  market:String
  switchName:String
  status:String
  createdById:String
  siteUnid:String
  siteName:String
  description:String
  submarket:String
  switchUnid:String
  title:String
  workId:String
  workType:String
  vendorCompanyName:String
  vendorTechName:String
  category:String
  createdOn: String
  siteNumber:String
  vendorId:String
  vp_engineerLoginId: String
  autoCreatedKirkeRequest: String
}

 
`