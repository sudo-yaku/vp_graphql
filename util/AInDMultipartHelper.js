const FormData = require('form-data');


function prepareAinDMultipartData(body,attachmentsData) {
    const form = new FormData();
      form.append('json_data', body);

      if (Array.isArray(attachmentsData)) {
        attachmentsData.forEach((att) => {
            if (att.content && att.filename) {
                const fileName = att.bidUnit
                    ? `${att.bidUnit}_${att.invoiceAuditLineNum || ""}_${att.filename}`
                    : att.filename;
                let base64Data = att.content;
                if (att.content.includes(',')) {
                    base64Data = att.content.split(',')[1]; // Remove the data URI prefix
                }
                
                // Convert to binary buffer
                const binaryData = Buffer.from(base64Data, 'base64');
                form.append('files', binaryData, fileName);
            }
        });
    }

      return form;
}

module.exports = {
    prepareAinDMultipartData
};
