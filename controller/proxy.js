import fetchWrapper  from '../corelib/request'

let config = require('config');

class Proxy{
    fetch = (url, args) => {
        return fetchWrapper(url, args)
    }
}

module.exports = {
    fetch:(...args) => {return new Proxy().fetch(...args)}
}