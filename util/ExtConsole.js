(function() {
    let exLog = console;
    console.deepLog = function(val) {
      try{
        logger.info(JSON.stringify(val, null, 4));
      }catch(ex){
        logger.info(val);
      }
    }
})()