import request from 'request'
import logger from './AppLogger'
import httpContext from 'express-http-context'

export default function requestOverride(url, request, clientReq){
    let options = {uri:encodeValue(url), ...request,json:true}
    if(options && options.body && typeof options.body == 'string' ){
        try {
            options.body = JSON.parse(options.body)
        } catch (error) {
            return Promise.reject(new Error('Invalid JSON in request body: ' + error.message))
        }
    }
    
    return new Promise((resolve,reject)=>{
        httpRequest(options,(err,res,data)=>{
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        })
    })
}

function encodeValue (url){
    if(url.indexOf('%')>-1 || url.indexOf('?') <0){
        return url;
    }else{
        let splited  = url.split("?")
        if(splited.length  > 1)        {
            let pairs = splited[1].split("&")
            let encoded = ''
            for (let i = 0; i < pairs.length; i++) {
                const data = pairs[i] ? pairs[i].split("="):[pairs[i]];
                if(data.length > 0){
                    encoded+=`${data[0]}=${encodeURIComponent(data[1])}`
                    if(i < (pairs.length -1)){
                        encoded+='&'
                    }
                }
            }
            return `${splited[0]}?${encoded}`
        }else{
            return url
        }
    }

}

let httpRequest =  function httpApi(options, callback){
    logRequest(options)
    
    request(options, function(error, response, body){
        logResponse(error, response, body)
        callback(error, response, body)
    });
}






function logRequest(options){
    try{
        let str = "\n REQUEST \n";
        str+= ("HOST: " + options.uri + "\n")
        str += ("METHOD: " + options.method + "\n")
        if(options.headers){
            for(let k in options.headers){
                str += (k + ":" + options.headers[k])
                str+= "\n"
            }
        }
        //logger.getLogger().transport( (str += (options.body? options.body : "")) + "\n ");
        let body = "BODY: " + (options.body && typeof options.body == "object" ? JSON.stringify(options.body) : options.body)
        let form = "FORM: " + (options.form && typeof options.form == "object" ? JSON.stringify(options.form) : options.form)
        logger.getLogger().transport( (str += (body) + "\n " + (form) + "\n"));
    }catch(e){
        logger.getLogger().info('error logging  to transport  ' + e)
    }
}

function logResponse(error, response, body){
    try{
        if(error){
            logger.getLogger().transport(" \n RESPONSE \n " + error+ "\n ");
        }else if(response){
            let str = "\n RESPONSE \n HTTP" + response.httpVersion + " " + response.statusCode + " " + response.statusMessage + " \n";
            if(response.headers){
                for(let k in response.headers){
                    str += (k + ":" + response.headers[k])
                    str+= "\n"
                }
            }
            logger.getLogger().transport( (str += (body? JSON.stringify(body) : "")) + "\n ");
        }
    }catch(e){
        logger.getLogger().info('error logging to transport  ' + e)
    }
}
