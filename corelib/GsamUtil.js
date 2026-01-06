let fs = require('fs');
let config = require('config')
import logger from '../util/LogUtil'

let GsamUtil = function () {
    logger.debug("Initializing Gsam util");
};
const gsamSensitiveDictionary = JSON.parse(fs.readFileSync(config.gsamDetailsFilePath, 'utf8'));
GsamUtil.prototype.restrictData = function (data, field) {
    outerBlock: {
        for (let i = data.length - 1; i >= 0; i--) {
            innerBlock: {
                for (let j = 0; j < field.length; j++) {
                    if (gsamSensitiveDictionary.some(substring => data[i][field[j]] && data[i][field[j]].toUpperCase().includes(substring))) {
                        data.splice(i, 1);
                        break innerBlock;
                    }
                }
            }
        }
    }
    return data;
}


GsamUtil.prototype.restrictObjectInObjects = function (data, fields) {
    let newObj = {};
    Object.keys(data) && Object.keys(data).forEach((key) => {
        let shouldRemove = [];
        shouldRemove = fields && fields.map((field) => {
            let value = data && data[key]&&data[key][field].toUpperCase();
            let isPresent = gsamSensitiveDictionary.some(item => value.includes(item))

            return isPresent;
        })
        let shouldObjBeRemoved = shouldRemove.some(i => i)
        if (!shouldObjBeRemoved) {
            newObj[key] = data[key]
        }
    })
    return newObj;
}

module.exports = new GsamUtil();
