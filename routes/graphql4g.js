let express = require('express');
let router = express.Router();
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import { formatError } from '../util/formatError';
import schema from '../data/schema';
import NoIntrospection from 'graphql-disable-introspection';
import { setAppPathCookie } from '../corelib/sso';

router.use('/graphql4g', bodyParser.json({ limit: '250mb' }), setAppPathCookie, graphqlExpress(req => ({ formatError, schema, validationRules: [NoIntrospection], context: { req } })));

module.exports = router;
