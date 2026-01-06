import { ConnectionRefuse, UnkonwnError, InputError, GateWayDown, NotFound, CustomErr, UnAuthorized } from '../data/errors'
import logger from '../util/LogUtil'
import { fetch } from './proxy'

let config = require('config')

function getAPRadiosList(fuzeSiteId, managerId, clientreq) {
    let url = `https://cnd-services.verizon.com/v1/api/ipallocation/getDeviceInfo?fuzeSiteId=${fuzeSiteId}`
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            "User": config.cndapiserviceaccount.length > 0 ? config.cndapiserviceaccount : managerId
        },
    }).then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#getAPRadiosList");
        }
        if (json.location && json.location.length > 0 && json.location[0].deviceInfo && json.location[0].deviceInfo.length > 0) {
            let deviceInfo = json.location[0].deviceInfo
            let filteredDevices = deviceInfo.filter(device => device.type == 'AP RADIO' || device.type == 'ENSE CSR')
            return filteredDevices
        } else if (json.errors && json.errors.length > 0) {
            switch (json.errors[0].status) {
                case "400":
                    return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
                default:
                    return new UnkonwnError({ data: json.errors[0] });
            }
        }
        else {
            return new InputError();
        }
    })
}
function getDeviceInfo(deviceId, deviceType, clientreq) {
    let url = `https://inam-services.verizon.com/wireless-interface-service/rest/wireless/interface/network/wireless/viewPendingMigrationIPs`
    let body = {
        "deviceInfo": [ { "hostName": deviceId } ]
    }

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            "Authorization": config.InamServicesAuth
        },
    }).then(json => {
        if (typeof json === 'string') {
            return errorHandler(json, "#getDeviceInfo");
        }
        if (json.deviceInfo && json.deviceInfo.length > 0) {
            let deviceInfo = json.deviceInfo.filter(device => device.hostName == deviceId);
            if (deviceInfo.length > 0) {
                if (deviceType === 'ENSE CSR') {
                    const subnetDetails = deviceInfo[0].subnetDetails;
                    const filteredSubnetDetails = {};
                    if (subnetDetails["VRF CELL_MGMT IRB IPV6"]) {
                        filteredSubnetDetails["apGatewayAddress"] = subnetDetails["VRF CELL_MGMT IRB IPV6"];
                    }
                    return filteredSubnetDetails;
                }
                return deviceInfo[0].subnetDetails
            } else {
                return new NotFound({ data: { code: 404, message: `Device with ID ${deviceId} not found.`, errorCode: "DEVICE_NOT_FOUND" } });
            }
        } else if (json.errors && json.errors.length > 0) {
            switch (json.errors[0].status) {
                case "400":
                    return new InputError({ data: { code: 400, message: `${json.errors[0].detail}` } });
                default:
                    return new UnkonwnError({ data: json.errors[0] });
            }
        }
        else {
            return new InputError();
        }
    })
}
export const apis = {
    async getAPRadioDeviceDetails(fuzeSiteId, managerId, clientreq) {
    try {
        const apRadios = await getAPRadiosList(fuzeSiteId, managerId, clientreq);
        if (apRadios instanceof Error) return apRadios;
        const deviceDetails = await Promise.all(apRadios.map(async (device) => {
            try {
                const deviceInfo = await getDeviceInfo(device.deviceId, device.type, clientreq);
                return deviceInfo instanceof Error ? null : { deviceId: device.deviceId, deviceType: device.type, deviceInfo: deviceInfo };
            } catch (err) {
                logger.error(`Error fetching details for deviceId: ${device.deviceId}`, err);
                return null;
            }
        }));
        return deviceDetails
    } catch (error) {
        logger.error("Error in getAPRadioDeviceDetails", error);
        return new UnkonwnError({ data: { message: "An error occurred while fetching combined AP Radio details." } });
    }}
}

function errorHandler(data, key) {
	logger.debug("#key");
	logger.debug(data);
	if (data.indexOf('404') > -1) {
		return new NotFound({ data: { code: 404, message: "Not Found.", errorCode: "NOTFOUND" } });
	} else if (data.indexOf('502') > -1) {
		return new GateWayDown({ data: { code: 502, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "GATEWAYDOWN" } });
	} else if (data.indexOf('405') > -1) {
		return new UnAuthorized({ data: { code: 405, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "NOTALLOWED" } });
	} else if (data.indexOf('Error') > -1) {
		return new InternalServerError({ data: { code: 500, message: "Oops! Something went wrong. Please try after sometime.", errorCode: "InternalServerError" } });
	} else {
		return new UnkonwnError();
	}
}
