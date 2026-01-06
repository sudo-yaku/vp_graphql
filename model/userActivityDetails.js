export function userActivity(req, clientreq) {
  let userData = clientreq.session && clientreq.session.userdata ? clientreq.session.userdata : ''
  const deviceInfo = req && req.Body ? req.Body:'';
  const output = {};
  output.login_id = userData && userData["login_id"] ? userData["login_id"] : ''
  output.login_email = userData && userData["email"] ? userData["email"] : '';
  output.origin = clientreq.headers['x-vpm-origin'] ? clientreq.headers['x-vpm-origin'] : '';
  output.user_id = userData && userData["issouserid"] ? userData["issouserid"] : '';
  output.device_name = deviceInfo && deviceInfo.userDeviceInfo && deviceInfo.userDeviceInfo.deviceName?deviceInfo.userDeviceInfo.deviceName:'';
  output.device_id = deviceInfo && deviceInfo.userDeviceInfo && deviceInfo.userDeviceInfo.deviceId?deviceInfo.userDeviceInfo.deviceId:'';
  output.os_version = deviceInfo && deviceInfo.userDeviceInfo && deviceInfo.userDeviceInfo.osVersion?deviceInfo.userDeviceInfo.osVersion:'';
  output.app_version = deviceInfo && deviceInfo.userDeviceInfo && deviceInfo.userDeviceInfo.appVersion ? deviceInfo.userDeviceInfo.appVersion:'';
  output.shell_version= deviceInfo && deviceInfo.userDeviceInfo && deviceInfo.userDeviceInfo.shellVersion ? deviceInfo.userDeviceInfo.shellVersion:'';
  output.serial_number= deviceInfo && deviceInfo.userDeviceInfo && deviceInfo.userDeviceInfo.deviceSerial? deviceInfo.userDeviceInfo.deviceSerial:'';
  output.app_name = deviceInfo && deviceInfo.appName? deviceInfo.appName:'';


  return output;
}
