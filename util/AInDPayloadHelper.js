function prepareAinDPayLoadData(body){
    // Group line items by quote_id (0, -1, -2)
    let line_items = body.line_items || [];
    const groupedLineItems = { 0: [], [-1]: [], [-2]: [] };
    line_items.forEach(row => {
        // Convert all keys in row to lowercase
        const lineItem = {};
        Object.keys(row).forEach(key => {
            lineItem[key.toLowerCase()] = row[key];
        });

        // Ensure quote_id is a number
        let quoteId = Number(lineItem.quote_id);
        if (quoteId === 0 || quoteId === -1 || quoteId === -2) {
            groupedLineItems[quoteId].push(lineItem);
        }
    });
    const validItems = (groupedLineItems[0] || []).filter(item => item.meta_universalid && item.meta_universalid != "");
    const newItems = (groupedLineItems[0] || []).filter(item => {
        const hasUniversalId = !!item.meta_universalid && item.meta_universalid !== "";
        const isDelete = Number(item.deleteme) === 1;
        return !hasUniversalId && !isDelete;
    });
    // Create the combined array with approved items first, then new items
    const finalItems = [...newItems];
    let vendorWorkOrder = body.vendorWorkOrder || {};
    let vwrsInfo = {
        workorder_id: body.workorder_id ? body.workorder_id.toString() : "",
        lineitemtable_quote: JSON.stringify(validItems),
        lineitemtable_approved: JSON.stringify(groupedLineItems[-1] || []),
        lineitemtable_invoiced: JSON.stringify(groupedLineItems[-2] || []),
        lineitemtable_final: finalItems,
        ...vendorWorkOrder,
        vendorcomments: body.vendorcomments,
        osw_info: body.oswInfo,
        distanceMob: body.distanceMob
    };

    
    // Ensure price_matrix is a sibling of vwrs_info in body
    const requestBody = {
        vwrs_info: vwrsInfo
    };
    if (body.price_matrix) {
        requestBody.price_matrix = body.price_matrix;
    }
    if(body.audit_rules) {
        requestBody.audit_rules = body.audit_rules;
    }

    const payload = JSON.stringify({
        metadata: body.metadata,
      body: requestBody
  });

  return payload;
}

module.exports = {
    prepareAinDPayLoadData
};
