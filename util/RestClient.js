let Client = require('node-rest-client').Client;
let constants = require('constants');
let util = require('util');

let RestClient = function(){
	this.client = new Client();
};

RestClient.prototype.get =  function(url, args, callback, errorHandler){
	
	let requestId = Math.floor(100000000 + Math.random() * 900000000);
	let metaInfo = {
		"GET_REQUEST_ID" : requestId,
		"GET_URL" : url,
		"GET_ARGS" : args
	};	
	// logger.debug(metaInfo);
	let req = this.client.get(url,args, function(data, response){
		metaInfo.GET_DATA = (data && data["0"]) ? data.toString('utf-8') : data; 
		// logger.debug(metaInfo);
		callback(data,response);
	});
	
	//Handle the error here
	req.on('error', function (err) {
        metaInfo.GET_ERROR = err;
		logger.info(metaInfo);
        if(errorHandler){
		    errorHandler(err);
        }
	});
};

RestClient.prototype.post = function(url, args, callback, errorHandler){

    let requestId = Math.floor(100000000 + Math.random() * 900000000);
	let metaInfo = {
		"POST_REQUEST_ID" : requestId,
		"POST_URL" : url,
		"POST_ARGS" : args
	};	
	// logger.debug(metaInfo);

	let req = this.client.post(url,args, function(data, response){
		metaInfo.POST_DATA = (data && data["0"]) ? data.toString('utf-8') : data; 
		// logger.debug(metaInfo);
		callback(data,response);
	});
	
	//Handle the error here
	req.on('error', function (err) {
        metaInfo.POST_ERROR = err;
		logger.info(metaInfo);
        if(errorHandler){
		    errorHandler(err);
        }
	});
};

RestClient.prototype.put = function(url, args, callback, errorHandler){
	
    let requestId = Math.floor(100000000 + Math.random() * 900000000);
	let metaInfo = {
		"PUT_REQUEST_ID" : requestId,
		"PUT_URL" : url,
		"PUT_ARGS" : args
	};	
	// logger.debug(metaInfo);
	let req = this.client.put(url,args, function(data, response){
		metaInfo.PUT_DATA = (data && data["0"]) ? data.toString('utf-8') : data; 
		// logger.debug(metaInfo);
		callback(data,response);
	});
	
	//Handle the error here
	req.on('error', function (err) {
        metaInfo.PUT_ERROR = err;
		logger.info(metaInfo);
        if(errorHandler){
		    errorHandler(err);
        }
	});
};

RestClient.prototype.remove = function(url, args, callback, errorHandler){
	
    let requestId = Math.floor(100000000 + Math.random() * 900000000);
	let metaInfo = {
		"DELETE_REQUEST_ID" : requestId,
		"DELETE_URL" : url,
		"DELETE_ARGS" : args
	};	
	// logger.debug(metaInfo);
	let req = this.client.delete(url,args, function(data, response){
		metaInfo.DELETE_DATA = (data && data["0"]) ? data.toString('utf-8') : data; 
		// logger.debug(metaInfo);
		callback(data,response);
	});
	
	//Handle the error here
	req.on('error', function (err) {
        metaInfo.DELETE_ERROR = err;
		logger.info(metaInfo);
        if(errorHandler){
		    errorHandler(err);
        }
	});
};

module.exports = new RestClient();
