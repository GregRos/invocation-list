/**
 * Created by Greg on 15/10/2016.
 */

export class InvokerError extends Error{
	constructor(message ?: string) {
		super(message);
	}
	name = "InvokerError";
}

export namespace Errors {
	function getStringRep(what : any) {
		if (what === null || what === undefined) {
			return Object.prototype.toString.call(what);
		}
		return what.toString();
	}

	export function expectedObject(got : any) {
		return new TypeError(`Expected a proper object, but got ${getStringRep(got)}`)
	}

	export function expectedFunction(got : any) {
		return new TypeError(`Expected a function, but got ${getStringRep(got)}`);
	}

	export function expectedIdentifier(got : any) {
		return new TypeError(`Expected an identifier name, but got ${getStringRep(got)}`);
	}

	export function invalidInvocationList(name : string | symbol, invocationList : any) {
		throw new InvokerError(`The invoker for ${getStringRep(name)} failed: the invocation list ${getStringRep(invocationList)} was invalid.`);
	}

	export function propertyNotWriteable(name : string | symbol) {
		throw new InvokerError(`The member ${name} is not writeable!`);
	}

	export function getterOrSetterNotSupported(name : string | symbol) {
		return new InvokerError(`Properties with getters or setters are not supported!`)
	}

	export function memberNotFunction(name : string | symbol) {
		return new InvokerError(`The value under the name ${name} is not a function!`);
	}
}

