function mapEatInput(input) {
    return {
      created_by: input.createdBy,
      test_type_names: input.testTypeNames,
      site_type: input.siteType,
      is_adhoc_test: input.isAdhocTest,
      spmid: input.spmId,
      rmu_device_name: input.rmuDeviceName,
      source_system: input.sourceSystem
    }
  }
  
module.exports = { mapEatInput };
