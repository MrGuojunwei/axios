/*
 * @Description: 
 * @Author: 郭军伟
 * @Date: 2019-12-16 15:27:48
 * @lastEditTime: Do not edit
 */
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
// Axios实例属性有两个 defaults保存配置项 interceptors 保存拦截器，包含请求拦截和响应拦截 
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 * 返回一个promise对象
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  // 支持两种传入配置方式 (uri, config) 或者 (config)
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  // 将传入的配置和默认配置进行合并， 得到完整的配置
  config = mergeConfig(this.defaults, config);

  // 将请求方法进行小写转化 并添加默认请求方法为get
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  /**
   * 使用 use 添加 fulfilled 与 rejected 添加到队列中
   * 添加 request 拦截函数的时候使用的是unshift， 这样会导致 use 后添加的先执行，先添加的后执行
   * 整个请求拦截器、请求发送方法、响应拦截器调用链数组，数组格式类似于
   * [requestInterceptor.fulfilled, requestInterceptor.rejected, diapatchRequest, undefined, request.fulfilled, request.rejected]
   */
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  // 利用promise的链式调用，处理chain数组中的拦截器方法和请求发送
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
/**
 * 添加请求别名 也就是为Axios实例添加如下原型方法：
 * delete,get,head,options  两个参数url, config
 * post,put,patch 三个参数url, data, config
 */
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;
