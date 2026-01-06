function prepareTaskData(payload, categoryData) {
    // Find category
    const category = categoryData.category[0];
    // Find type by name from payload
    const type = category.types.find(t => t.type_name === payload.type_name) || category.types[0];

    // Find status objects
    const statusComplete = categoryData.status.find(s => s.status_name === "Complete");
    const statusInProgress = categoryData.status.find(s => s.status_name === "In Progress");
    const statusNew = categoryData.status.find(s => s.status_name === "New");

    return {
        ...payload,
        name: type ? type.type_name : payload.type_name,
        type_id: type ? type.type_id : "",
        priority: "P4",
        status_id: statusComplete ? statusComplete.status_id : "",
        status: "Complete",
        status_name: statusInProgress ? statusInProgress.status_name : "",
        status_new: statusNew ? statusNew.status_id : "",
        category_id: category.category_id,
        category_name: category.category_name,
        prev_status_id: statusInProgress ? statusInProgress.status_id : "",
        prev_status: statusInProgress ? statusInProgress.status_name : "",
    };
}

module.exports = {
    prepareTaskData
};
