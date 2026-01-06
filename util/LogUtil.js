let winston = require('winston');                                                                                                          
let expressWinston = require('express-winston');                                                                                           
let config = require('config');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
const fileName = "graphQl.log";
// Logger initialized
// module.exports = new (winston.Logger)({
//     transports: [
//       new (winston.transports.Console)(),
//       new (winston.transports.DailyRotateFile)({
//                 filename: config.log.filePath+fileName,
//                 level : config.log.level,
//                 datePattern: '.yyyy-MM-dd', //Daily
//                 maxsize : 104857600 //100 MB   
//             }
//           )
//     ]
//   });

let logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.timestamp()
  ),
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.File({
      filename: config.get("log.filePath")+"vpgraphql-info.log",
      maxsize: 104857600,
      level: 'debug'
    }),
    new winston.transports.File({
      filename: config.get("log.filePath")+"vpgraphql-error.log",
      maxsize: 104857600,
      level: 'error'
    })
  ],
});

export const access_logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.simple()
  ),
  level: "info",
  transports: [
    new winston.transports.File({
      filename: config.get("log.filePath")+"vpgraphql-access.log",
      maxsize: 104857600,
    }),
  ],
});

export const inbound_logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
  ),
  level: "debug",
  transports: [
    new winston.transports.File({
      filename: config.get("log.filePath")+"vpgraphql-inbound.log",
      maxsize: 104857600,
    }),
  ],
});



export class AccessLoggerStream  {
  write(message) {
      access_logger.info(message);
  }
}


let transport_logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
    
  ),
  level: "info",
  transports: [
    new winston.transports.File({
      filename: config.get("log.filePath")+"vpgraphql-transport.log",
      maxsize: 104857600,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
  access_logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default {
  info: function(msg){
    logger.info(msg)
  },
  debug: function(msg, err){
    logger.debug(msg, err)
  },
  error: function(msg, err){
    logger.error(msg, err)
  },
  inbound: function(msg){
    inbound_logger.info(msg)
  },
  transport: function(msg){
    transport_logger.info(msg)
  },
  AccessLoggerStream: AccessLoggerStream
};