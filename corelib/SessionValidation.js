import { UNAUTHORIZED_MESSAGE, FORCE_LOGOUT_MESSAGE } from "./utils";
import AppLogger from "./AppLogger";
import utils from "./utils";

export const ValidateSession = function (req, res, next) {
    const statusCode = req.originalUrl.indexOf('logs') > -1 ? 401 : 200
    try {
        let message = UNAUTHORIZED_MESSAGE
        let isUnauthorized = false
        if (!req.session.userdata || !req.session.userdata.userid || req.session.userdata.userid.length <= 0) {
            isUnauthorized = true;
        }
        // Maximum Active time validation
        else if (req.session.maxActiveTime && new Date(req.session.maxActiveTime) < new Date()) {
            AppLogger.getLogger().info(`User Forced Logout! User Id: ${req.session.userdata.login_id} Email : ${req.session.userdata.email} Maximum Active Time : ${req.session.maxActiveTime}`)
            req.session.destroy();
            isUnauthorized = true;
            message = FORCE_LOGOUT_MESSAGE
        }
        if (isUnauthorized) {
            const data = utils.getUnauthorizedErrorObj(message)
            res.status(statusCode).json(data)
            return;
        }
        next();
    } catch (e) {
        AppLogger.getLogger().error('Error at validate session request', e)
        const data = utils.getUnauthorizedErrorObj(UNAUTHORIZED_MESSAGE)
        res.status(statusCode).json(data)
        return;
    }
}

export default ValidateSession;