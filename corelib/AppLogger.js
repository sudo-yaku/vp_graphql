import * as winston from "winston";
import * as config from "config"
const DailyRotateFile = require('winston-daily-rotate-file');
const httpContext = require('express-http-context');
import mwUtils from "./utils";

let appLogger = null;

function getLogFormat(){
    return winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss:SSS'
        }),
        winston.format.simple(),
        winston.format.printf(info => `<${info.timestamp}>:<${info.logLevel?info.logLevel:info.level}>:<${mwUtils.getReqUserId()}>:<${mwUtils.getReqControlId()}><!-- ${info.message}${info.splat!==undefined?"/"+info.splat:""} -->`)
      )
}




function getMetaData(logLevel){
  return {logLevel:logLevel}
}

function getLogger(serviceName){
    const logger = winston.createLogger({
        format: getLogFormat(),
        levels: winston.config.syslog.levels,
        transports: [
          getDailyLogger(serviceName+'-info', 'debug'),
          getDailyLogger(serviceName+'-error', 'error'),
        ],
        exitOnError: false
      });
      
      const access_logger = winston.createLogger({
        format: winston.format.combine(         
          winston.format.simple(),
          winston.format.printf(info => `${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
        ),
        level: "info",
        transports: [
          getDailyLogger(serviceName+'-access', 'info')
        ],
        exitOnError: false
      });
      
      
      
      class AccessLoggerStream {
        write(message) {
            access_logger.info(message);
        }
      }
      
      
      const transport_logger = winston.createLogger({
        format: getLogFormat(),
        level: "info",
        transports: [
          getDailyLogger(serviceName+'-transport', 'info')
        ],
        exitOnError: false
      });
      const inbound_logger = winston.createLogger({
        format: getLogFormat(),
        level: "info",
        transports: [
          getDailyLogger(serviceName+'-inbound', 'info')
        ],
        exitOnError: false
      });
      const trace_logger = winston.createLogger({
        format: getLogFormat(),
        level: "info",
        transports: [
          getDailyLogger(serviceName+'-trace', 'info')
        ],
        exitOnError: false
      });

      
      
      if (process.env.NODE_ENV !== "production") {
        logger.add(new winston.transports.Console({
          format: winston.format.simple(),
        }));
        access_logger.add(new winston.transports.Console({
          format: winston.format.simple(),
        }));
      }
      
      return {
        inbound: function(msg){
            inbound_logger.info(" \n" +formatMessage(msg)+" \n",getMetaData('inbound'))
        },
        info: function(msg){
          logger.info(formatMessage(msg))
        },
        debug: function(msg, err){
          logger.debug(formatMessage(msg), err)
        },
        error: function(msg, err){
          logger.error(formatMessage(msg), err)
        },
        transport: function(msg){
          transport_logger.info(" \n" +formatMessage(msg)+" \n",getMetaData('transport'))
        },
        trace: function(msg){
          trace_logger.info(formatMessage(msg));
        },
        deviceInfoLogs: function(msg){
          device_logger.info(msg)
        },
        deviceDebugLogs: function(msg){
          device_logger.debug(msg)
        },
        deviceErrorLogs: function(msg){
          device_logger.error(msg)
        },
        AccessLoggerStream: AccessLoggerStream
      };
}

export default  {
  initialize: function(serviceName){
    if(appLogger == null) {
      appLogger = getLogger(serviceName);
    }
    return appLogger;
  },
  getLogger: function(){
    if(appLogger == null){
      throw new Error("Please initialize the logger with serviceName ");
    }
    return appLogger;
  }
}








function getDailyLogger(logName, level){
  // console.log("log file path " + config.log.filePath)
  return new (DailyRotateFile)({
    filename: config.log.filePath+logName+"-%DATE%.log",
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxsize: '1024m',
    level: level
  });
}

function formatMessage(message) {
  message = (httpContext.get('reqId') ? httpContext.get('reqId'): "") + " " + message;
  return message;
};

