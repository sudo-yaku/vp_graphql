const FormData = require('form-data');
const moment = require('moment');
import logger from './LogUtil';

function mapLineItemsToAuditFormat(lineItems) {
    return lineItems
    .filter(item => {
    const quoteOk = Number(item.QUOTE_ID) === 0;
    const hasUniversalId = !!(item.META_UNIVERSALID && String(item.META_UNIVERSALID).trim() !== "");
    const isDelete = Number(item.deleteme) === 1;
    return quoteOk && !hasUniversalId && !isDelete;
    })
    .map(item => ({
        bidUnitCatalogeId: item.BID_UNIT_CATALOGE_ID || "",
        vendorWorkorderLineitemId: "",
        invoiceAuditLineNum: Number(item.LINE_NUM) || null,
        rate: Number(item.PRICE_PER_UNIT) || 0,
        quantity: Number(item.QTY) || 0,
        cost: Number(item.TOTAL_PRICE) || 0,
        workedOnDate: moment(item.META_CREATEDDATE).format("YYYY-MM-DD") || null,
        comments: (item.LONG_DESCRIPTION || "").substring(0, 498) || "",
        createdBy: item.META_CREATEDBY || ""
    }));
}

function prepareAuditMultipartData(body,payLoad){
    const form = new FormData();
    const auditReqObj = JSON.parse(payLoad);
    if (auditReqObj?.body?.vwrs_info) {
    ['lineitemtable_quote', 'lineitemtable_approved', 'lineitemtable_invoiced'].forEach(key => {
        if (typeof auditReqObj.body.vwrs_info[key] === 'string') {
            auditReqObj.body.vwrs_info[key] = JSON.parse(auditReqObj.body.vwrs_info[key]);
        }
  });
}
    const payload = JSON.stringify({
        workorderId: body.workorder_id,
        userId: body.metadata.user_id,
        sessionId: body.metadata.session_id,
        transactionId: body.metadata.transaction_id,
        createdBy: body.metadata.user_id,
        auditReq: auditReqObj,
        auditRes: body.auditRes
    });

    const auditLineItems= mapLineItemsToAuditFormat(body.line_items);
    logger.info(`Mapped Audit Line Items: ${JSON.stringify(auditLineItems)}`);

    const universalIdToLineNum = {};
    (body.line_items || []).forEach(item => {
        universalIdToLineNum[item.META_UNIVERSALID] = Number(item.LINE_NUM) || 0;
    });
    // Map attachments
    const auditAttachments = (body.attachments || []).map(att => ({

        fileName: att.bidUnit
        ? `${att.bidUnit}_${att.invoiceAuditLineNum || ""}_${att.filename}`
        : att.filename,
        invoiceAuditLineNum: Number(att.invoiceAuditLineNum) || null,
        uploadedBy: body.metadata.user_id || "",
        category: att.category || ""
    }));
    form.append('auditData', payload);
    form.append('lineItems', JSON.stringify(auditLineItems));
    form.append('attachments', JSON.stringify(auditAttachments));
    
    (body.attachments || []).forEach(att => {
        if (att.content && att.filename) {
            const fileName = att.bidUnit
                ? `${att.bidUnit}_${att.invoiceAuditLineNum || ""}_${att.filename}`
                : att.filename;
            let base64Data = att.content;
            if (att.content.includes(',')) {
                base64Data = att.content.split(',')[1]; // Remove the data URI prefix
            }
            const binaryData = Buffer.from(base64Data, 'base64');
            form.append('files', binaryData, fileName);
        }
    });
    return form;


}
module.exports = {
    prepareAuditMultipartData
};
