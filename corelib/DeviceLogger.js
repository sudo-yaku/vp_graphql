
import AppLogger from './AppLogger';
import moment from 'moment';
 const deviceLogger=(req,res,next) =>{
     try{
        let requestData = req.body?req.body:null
        let logs = requestData && requestData.lg? requestData.lg: []
        AppLogger.getLogger().info(requestData);
        let formatString= "";
        if(logs.length > 0){
            logs.forEach((log) =>{
                let message = ""
                try{
                    let parsedMessage = JSON.parse(log.m);
                    message = `${parsedMessage? parsedMessage.logData:""} : ${parsedMessage? parsedMessage.e: ""}`
                } catch(e){
                    console.error('error at json parse...not logging stack trace intentionally');
                    //console.log('error', e);
                    //AppLogger.getLogger().error("Error at parsing json",e);
                    message = log.m;
                }
                formatString += `\n ${moment(log.t).format('YYYY-MM-DD HH:mm:SS:SSS')} : ${message}`;
            });
        }
        AppLogger.getLogger().info(formatString);
        if (formatString && formatString !== "") {
            AppLogger.getLogger().deviceInfoLogs(formatString);
        }
        res.sendStatus(200);
     } catch(e){
         //console.log(e);
         console.error(e,e);
         AppLogger.getLogger().error('Error',e);
        res.sendStatus(200);
     }
     
   
}

export default deviceLogger;