/**
 * Created by Greg on 15/10/2016.
 */
export declare class InvokerError extends Error {
    constructor(message?: string);
    name: string;
}
export declare namespace Errors {
    function expectedObject(got: any): TypeError;
    function expectedFunction(got: any): TypeError;
    function expectedIdentifier(got: any): TypeError;
    function invalidInvocationList(name: string | symbol, invocationList: any): void;
    function propertyNotWriteable(name: string | symbol): void;
    function getterOrSetterNotSupported(name: string | symbol): InvokerError;
    function memberNotFunction(name: string | symbol): InvokerError;
}
