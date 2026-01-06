import staticfile from './staticfile';
import graphql4g from './graphql4g'
import { config, rootdir } from '../global';
import { unsetSSOCookies, redirection } from '../corelib/sso';
global.config = require('config');

let express = require('express');
let router = express.Router();
const path = require('path');

router.use('/errorpage', express.static(path.join(rootdir, 'public/errorpage')))
router.use('/ssosession', unsetSSOCookies, express.static(path.join(rootdir, 'public')))

// Added for sso redirection
router.get(config.app.graphQlPath, redirection)
// router.use(`${config.app.graphQlPath}/images`, ValidateSession, imageroutes);
router.use('/graphqlstaging', graphql4g);
router.use('/graphql', graphql4g);
router.use('/network', staticfile);
router.use('/networktest', staticfile);
router.use('/vpnetworktest', staticfile);
router.use(/\/vpmadmin\w{0,}/, express.static(config.resources.sso_vpmadminPath));
router.use(/\/vendorportaltest\w{0,}/, express.static(config.resources.sso_vpmadminPath));
router.use(/\/network\w{0,}/, express.static(config.resources.sso_rapsPath));
router.use(/\/network\w{0,}\/*/, express.static(config.resources.sso_rapsPath));
router.use(/\/vpnetworktest\w{0,}\/*/, express.static(config.resources.sso_rapsPath));
router.use(/\/vpnetworktest\w{0,}/, express.static(config.resources.sso_rapsPath));
router.use('/vpnetworktest/download/', express.static(config.resources.apkPath));

router.get(/\/vpmadmin\w{0,}/, (req, res) => {
  res.sendFile(path.resolve(config.resources.sso_vpmadminPath, "index.html"));
});

router.get(/\/vendorportaltest\w{0,}/, (req, res) => {
  res.sendFile(path.resolve(config.resources.sso_vpmadminPath, "index.html"));
});

router.use("/", express.static(config.resources.sso_vpmadminPath));
router.use("/", (req, res) => {
  res.sendFile(path.resolve(config.resources.sso_vpmadminPath, "index.html"));
});

module.exports = router;
