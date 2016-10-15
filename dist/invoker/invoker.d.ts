import Immutable = require('immutable');
export declare module InvocationLists {
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
    function addInvocation(thisObj: any, memberName: string | symbol, newFunction: Function): void;
    function getInvocations(thisObj: any, memberName: string | symbol): Immutable.List<Function>;
}
