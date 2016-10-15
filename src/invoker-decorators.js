"use strict";
/**
 * Created by Greg on 30/09/2016.
 */
var invoker_1 = require('./invoker/invoker');
function invokedBy(memberName, maxArity) {
    if (maxArity === void 0) { maxArity = -1; }
    return function (target, property) {
        var f = target[property];
        invoker_1.InvocationLists.addInvocation(target, memberName, target[property]);
    };
}
exports.invokedBy = invokedBy;
//# sourceMappingURL=invoker-decorators.js.map