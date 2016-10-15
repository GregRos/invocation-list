"use strict";
/**
 * Created by Greg on 26/09/2016.
 */
//he invoker is a module responsible for constructing invocation lists.
var _ = require('lodash');
var errors_1 = require('../errors');
var Immutable = require('immutable');
var InvocationLists;
(function (InvocationLists) {
    //the invoker cache.
    var invokers = {};
    var symbolCache = new Map();
    /**
     * Retrieves the invocation symbol for a member with the given name.
     * @param name The name of the member.
     * @returns {symbol} The invocation symbol.
     */
    function getSymbol(name) {
        var symb = symbolCache.get(name);
        if (symb)
            return symb;
        var textName = _.isString(name) ? name : name.toString();
        var invocListSymbol = Symbol(textName);
        symbolCache.set(name, invocListSymbol);
        return invocListSymbol;
    }
    /**
     * Returns an invoker for a member with the specified string/symbol name.
     *
     * @description
     * The invoker is a small function that is placed in a key managed by an invocation list.
     * The invoker accesses the invocation list on the `this` instance and invokes every element using its arguments.
     * Each string key (and corresponding invocation symbol) has its own invoker, and invokers for the same key on different objects are the same.
     * @param name The name for which to get the invoker.
     * @returns {Function} The invoker function.
     */
    function getInvoker(name) {
        var symbol = getSymbol(name);
        if (invokers[symbol]) {
            return invokers[symbol];
        }
        return invokers[symbol] = function () {
            var _this = this;
            //this will be the instance this function was called on, not the module or the function object
            var invocationList = this[symbol];
            if (!Immutable.List.isList(invocationList)) {
                throw errors_1.Errors.invalidInvocationList(name, invocationList);
            }
            var args = arguments;
            var result;
            invocationList.forEach(function (func) { return result = func.apply(_this, args); });
            //undefined is always returned!
            return undefined;
        };
    }
    /**
     * Attaches a new function to the invocation list of a member in the given instance.
     *
     * @description
     * This function makes the specified member managed by an invocation list.
     * Functions can be added to the invocation list for execution, and when the member with this name is called, every function in the invocation list is called in sequence.
     *
     * @param thisObj The `this` instance
     * @param memberName The name of the member to manage.
     * @param newFunction The new function to add to the invoc list.
     */
    function addInvocation(thisObj, memberName, newFunction) {
        if (!_.isFunction(newFunction)) {
            throw errors_1.Errors.expectedFunction(newFunction);
        }
        if (!memberName || (!_.isString(memberName) && !_.isSymbol(memberName))) {
            throw errors_1.Errors.expectedIdentifier(memberName);
        }
        if (!_.isObject(thisObj)) {
            throw errors_1.Errors.expectedObject(thisObj);
        }
        var descriptor = Object.getOwnPropertyDescriptor(thisObj, memberName);
        if (descriptor) {
            if (!descriptor.writable) {
                throw errors_1.Errors.propertyNotWriteable(memberName);
            }
            if (descriptor.get || descriptor.set) {
                throw errors_1.Errors.getterOrSetterNotSupported(memberName);
            }
        }
        var symbol = getSymbol(memberName);
        var invoker = getInvoker(memberName);
        var ownList = thisObj[symbol];
        var ownFunction = thisObj[memberName];
        if (ownFunction !== undefined && !_.isFunction(ownFunction)) {
            throw errors_1.Errors.memberNotFunction(memberName);
        }
        else if (ownList && ownFunction === invoker) {
            //the invocation list exists and the current occupant is the invoker for the member
            ownList = ownList.push(newFunction);
        }
        else if (ownList && ownFunction !== invoker) {
            //the invocation list exists, but the current function is not the invoker
            //meaning it was overriden. We have to create a new invocation list based on the old function.
            ownList = Immutable.List.of(ownFunction, newFunction);
        }
        else if (!ownList && !ownFunction) {
            //there is no invocation list and there is no function with that name.
            ownList = Immutable.List.of(newFunction);
        }
        else if (!ownList && ownFunction === invoker) {
            //there is no invocation list but there is a function and it is an invoker
            //this is a strange error.
            throw errors_1.Errors.invalidInvocationList(memberName, undefined);
        }
        else if (!ownList && ownFunction) {
            //there is no invocation list but there is a function.
            ownList = Immutable.List.of(ownFunction, newFunction);
        }
        thisObj[memberName] = invoker;
        thisObj[symbol] = ownList;
        //if the invoker is in place, nothing should be done.
    }
    InvocationLists.addInvocation = addInvocation;
    function getInvocations(thisObj, memberName) {
        if (!_.isObject(thisObj) || (!_.isSymbol(memberName) && _.isString(memberName))) {
            return Immutable.List.of();
        }
        var symbol = getSymbol(memberName);
        var invocationList = thisObj[symbol];
        if (invocationList) {
            return invocationList;
        }
        else if (_.isFunction(thisObj[memberName])) {
            return Immutable.List.of(thisObj[memberName]);
        }
        else {
            return Immutable.List.of();
        }
    }
    InvocationLists.getInvocations = getInvocations;
})(InvocationLists = exports.InvocationLists || (exports.InvocationLists = {}));

//# sourceMappingURL=invoker.js.map
