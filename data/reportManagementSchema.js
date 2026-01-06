export const typeDefs = `
type marketListType{
    marketRefData: [marketRefDataType]
}

type marketRefDataType{
    MARKET:String
    SUB_MARKET:String
    FAST_GROUP:String
}

type generatorFuelReportResponse {
    genFuelData: [generatorFuelReport]
   }
   type generatorFuelReport {
    EQUIP_UNQ_ID:String
    SITE_UNID:String
    SITE_NAME:String
    SITE_STATUS:String
    SWITCH:String
    GEN_STATUS:String
    GEN_REMAINING_HOURS:String
    MARKET:String
    SUB_MARKET:String
    MDG_ID:String
    LATITUDE_DECIMAL:String
    LONGITUDE_DECIMAL:String
    ZIP:String
    ADDRESS:String
    EMIS_HAS_GENERATOR:String
    FUZE_GAS_DIESEL_RESTR:String
    DIESEL_RESTRICTED:String
    GEN_PORTABLE_COMPATIBLE:String
    GEN_PORTABLE_PLUG:String
    GEN_PORTABLE_PLUG_TYPE:String
    DIRECTION:String
    GEN_PORTABLE_PLUG_DESC:String
    GEN_SITE_UNID:String
    ATTRIBUTE_NAME:String
    ATTRIBUTE_VALUE:String
    GEN_ATTRIBUTES:String
}

type getGroupsforOpenAlarmsResponse {
    groupsOpenAlarmData: [getGroupsforOpenAlarmsReport]
   }
   type getGroupsforOpenAlarmsReport {
    value:String
    text:String
}
type getSwitchesForOpenAlarmReportResponse {
    switchOpenAlarmData: [getSwitchesForOpenAlarmReport]
   }
   type getSwitchesForOpenAlarmReport {
    value:String
    text:String
}
type getOpenAlarmsDataReportResponse {
    data: [getOpenAlarmsDataReport]
   }
   type getOpenAlarmsDataReport {
    cellNumber:String
    siteName:String
    techName:String
    managerName:String
    mdgId:String
    alarms:[alarmDetails]
    }
    type alarmDetails {
    startTime:String
    eocAlarmGroup:String
    alarmCount:Int
}`
