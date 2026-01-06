import casual from 'casual';
import wolist from './mockdata/wolist'
import attachment from './mockdata/attachmentlist'
import eloginfo from './mockdata/eloginfo'
import sitedetail from './mockdata/sitedetail'
const mocks = {
  String: () => 'QUOTEAPPROVED',
  Int: () => 112345,
  Query: () => ({
   getVendorWorkOrder:(root, {startdate,enddate},{req}) =>{
    return wolist
   },
   getAttachmentsList: (root,{unid},{req})=>{
    return attachment
   },
   getElogForWorkorder:(root, {workorder_id,vendor},{req}) =>{
     return  {"code": 200,
     "message": null,
     "listItems": [eloginfo]
      }
   },
   getSiteDetails:(root, {siteunid},{req}) =>{
    return sitedetail   
  }
  }),
  Author: () => ({
    firstName: () => casual.first_name,
    lastName: () => casual.last_name
  }),
  Post: () => ({ title: casual.title, text: casual.sentences(3) })
};

export default mocks;
