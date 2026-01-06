
let express = require('express');
let router = express.Router();
global.config = require('config');

router.use('/download', express.static(config.resources.sso_apkPath));
router.use('/raps',  express.static(config.resources.sso_rapsPath));

module.exports = router;