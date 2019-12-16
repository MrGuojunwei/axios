/*
 * @Description: 
 * @Author: 郭军伟
 * @Date: 2019-12-16 15:27:48
 * @lastEditTime: Do not edit
 */
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  // 将Axios.prototype.request的this指向context;instance是function类型
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  // 拷贝axios.prototype对象的数据到instance上，如果axios.prototype对象的属性值是函数，则改变函数的this指向为context
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // instance将会拥有Axios函数的上静态方法和原型上的所有方法
  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
// axios.all方法传入promises数组，返回promise对象，实际调用Promise.all(promises)
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
