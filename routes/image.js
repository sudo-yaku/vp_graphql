
let express = require('express');
let router = express.Router();
global.config = require('config');
const httpProxy = require('http-proxy'),
proxy = httpProxy.createProxy({});


router.use((req,res,next) => {
    console.log("coming to image router middleware " + req.url )
    
    proxy.web(req, res, {
        // target: `${getServiceHost("vpmservices")}/vendorportal/services/orderservice`,
        changeOrigin: true, // this is added for SSO, otherwise host will go as fixedwireless and fails SSL validation
        //cookieDomainRewrite: "",
        secure: true
    });
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Cookie', 'foobar'); // for sso sometimes Cookie size are very big so resetting the cookies here for api's.. NOT SO GOOD IF THIS IS GOING TO BE COMMON CODE :()
});

proxy.on('error', function(e) {
    console.log("error in proxy " + e , e);
  });

proxy.on('proxyRes', (proxyRes, req, res) => {

    console.log("proxyRes for image upload " + req.url + " " + res.statusCode +" "+proxyRes.statusCode);
    
    const allowedOrigins = config.origin;
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        proxyRes.headers['access-control-allow-origin'] = origin
        proxyRes.headers['access-control-allow-credentials'] = true
    }
   
    proxyRes.headers['access-control-allow-methods'] = 'GET,PUT,POST,DELETE'
    proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization, app-token, iscbandpage, sso-token, x-vpm-origin'

    // res.setHeader('access-control-allow-origin', origin);
    // res.setHeader('access-control-allow-credentials', true);
    // res.setHeader('access-control-allow-headers','Content-Type, Authorization, app-token, sso-token, x-vpm-origin');
    // res.setHeader('access-control-allow-methods','GET,PUT,POST,DELETE');
   
});

module.exports = router;