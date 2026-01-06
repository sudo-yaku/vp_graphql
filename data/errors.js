import { createError,formatError as realError } from 'apollo-errors';
import logger from '../corelib/AppLogger'

export function formatError (error) {
  try{
    let errorMessage = error.message ; 
    let isQueryError = '';
    if(errorMessage){
      let errorMessageToLowerCase = error.message.toLowerCase();
      isQueryError = errorMessageToLowerCase.includes("cannot query field") || errorMessageToLowerCase.includes("Cannot extend type") 
      || errorMessageToLowerCase.includes("must have a selection of subfields") || errorMessageToLowerCase.includes("Unknown argument")
      || errorMessageToLowerCase.includes("to use an inline fragment on") || errorMessageToLowerCase.includes("Unknown type")
      || errorMessageToLowerCase.includes("is not defined by type")
    }
    if(isQueryError){
      const errorMsg = "Invalid User request, please contact support";
      logger.getLogger().error("graphql parse error : "+error);
      error.message = errorMsg;
      return realError(error);
    }else{
      return realError(error);
    }
  }
  catch(e){
    logger.getLogger().error("[errors][formaterror] Exception : "+e);
    return realError(error);
  }
 
}

export const UnAuthorized = createError('UnAuthorized', {
  code:401,
  message: 'UnAuthorized , You are not authorized to view this data'
});

export const ConnectionRefuse = createError('ConnectionRefuse', {
  code:500,
  message: 'Connection Refused'
});

export const UnkonwnError = createError('UnkonwnError', {
  code:500,
  message: 'Unknown error! Please contact administrator.'
});


export const InputError = createError('InputError', {
  code:422 ,
  message: 'Please give the valid input'
});

export const NoDataFoundError = createError('NoDataFoundError', {
  code:422 ,
  message: 'No Data Found for the given inputs'
});

export const NotFound = createError('NotFound', {
  code:404,
  message: 'Not Found'
});

export const GateWayDown = createError('GateWayDown', {
  code:502,
  message: 'Gateway down! Please wait for sometime and try again.'
});

export const CustomErr = createError('CustomErr', {
  code:400,
  message: 'User Defined Error'
});

export const InternalServerError = createError('InternalServerError', {
  code:500,
  message: 'Internal Server Error'
});