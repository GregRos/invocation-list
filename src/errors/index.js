/**
 * Created by Greg on 15/10/2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var InvokerError = (function (_super) {
    __extends(InvokerError, _super);
    function InvokerError(message) {
        _super.call(this, message);
        this.name = "InvokerError";
    }
    return InvokerError;
}(Error));
exports.InvokerError = InvokerError;
var Errors;
(function (Errors) {
    function getStringRep(what) {
        if (what === null || what === undefined) {
            return Object.prototype.toString.call(what);
        }
        return what.toString();
    }
    function expectedObject(got) {
        return new TypeError("Expected a proper object, but got " + getStringRep(got));
    }
    Errors.expectedObject = expectedObject;
    function expectedFunction(got) {
        return new TypeError("Expected a function, but got " + getStringRep(got));
    }
    Errors.expectedFunction = expectedFunction;
    function expectedIdentifier(got) {
        return new TypeError("Expected an identifier name, but got " + getStringRep(got));
    }
    Errors.expectedIdentifier = expectedIdentifier;
    function invalidInvocationList(name, invocationList) {
        throw new InvokerError("The invoker for " + getStringRep(name) + " failed: the invocation list " + getStringRep(invocationList) + " was invalid.");
    }
    Errors.invalidInvocationList = invalidInvocationList;
    function propertyNotWriteable(name) {
        throw new InvokerError("The member " + name + " is not writeable!");
    }
    Errors.propertyNotWriteable = propertyNotWriteable;
    function getterOrSetterNotSupported(name) {
        return new InvokerError("Properties with getters or setters are not supported!");
    }
    Errors.getterOrSetterNotSupported = getterOrSetterNotSupported;
    function memberNotFunction(name) {
        return new InvokerError("The value under the name " + name + " is not a function!");
    }
    Errors.memberNotFunction = memberNotFunction;
})(Errors = exports.Errors || (exports.Errors = {}));
//# sourceMappingURL=index.js.map