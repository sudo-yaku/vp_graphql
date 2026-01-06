import { formatError as formatErr} from 'apollo-errors';
import logger from './LogUtil' 


export function formatError (error, returnNull) {
    logger.info("format error"+error);
    logger.info("format Error return null"+returnNull)
    let queryError= error && error.nodes && error.nodes[0] && error.nodes[0].kind && error.nodes[0].kind==="VariableDefinition" || error.message && error.message.toLowerCase().includes("cannot query field")? true: false;
    if (returnNull === void 0) { returnNull = false; }
    let originalError = error ? error.originalError || error : null;
    logger.info("originalError in formatError"+originalError)
    
    if (!originalError)
        return returnNull ? null : error;
    let locations = error.locations, path = error.path;
    logger.info("queryError***"+queryError)
    if(queryError){
        logger.info("Inside Query error");
        return {
            message: "Error in Query Parameter or Unknown error! Please contact administrator "
        }
        }
        else{
            logger.info("Inside Format error");
            return formatErr(error,returnNull);
        }
}
