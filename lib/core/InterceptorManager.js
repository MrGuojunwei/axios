/*
 * @Description: 拦截器类
 * @Author: 郭军伟
 * @Date: 2019-12-16 15:27:48
 * @lastEditTime: Do not edit
 */
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = []; // 存放拦截器方法，数组中每一个对象都包含两个方法 fulfilled 和 rejected
}

/**
 * 添加一个拦截器到栈中 this.handles
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later 返回id用于移除最后的元素
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * 根据id从栈中移除一个拦截器
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * 遍历拦截器，并将所有的拦截器作为fn的参数，执行fn函数
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;
