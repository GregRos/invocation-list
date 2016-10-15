/**
 * Created by Greg on 26/09/2016.
 */
//he invoker is a module responsible for constructing invocation lists.
import _ = require('lodash');
import {Errors, InvokerError} from '../errors';
import Immutable = require('immutable');

export module InvocationLists {

	//the invoker cache.
	var invokers: any = {};
	var symbolCache = new Map<string | symbol, symbol>();
	/**
	 * Retrieves the invocation symbol for a member with the given name.
	 * @param name The name of the member.
	 * @returns {symbol} The invocation symbol.
	 */
	function getSymbol(name: string | symbol) {
		let symb = symbolCache.get(name);
		if (symb) return symb;
		let textName = _.isString(name) ? name : name.toString();
		let invocListSymbol = Symbol(textName);
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
	function getInvoker(name: string | symbol): Function {
		let symbol = getSymbol(name);
		if (invokers[symbol]) {
			return invokers[symbol];
		}
		return invokers[symbol] = function () {
			//this will be the instance this function was called on, not the module or the function object
			let invocationList = this[symbol] as Immutable.List<Function>;

			if (!Immutable.List.isList(invocationList)) {
				throw Errors.invalidInvocationList(name, invocationList);
			}
			let args = arguments;
			let result: any;
			invocationList.forEach(func => result = func.apply(this, args));
			//undefined is always returned!
			return undefined;
		}
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
	export function addInvocation(thisObj: any, memberName: string | symbol, newFunction: Function) {
		if (!_.isFunction(newFunction)) {
			throw Errors.expectedFunction(newFunction);
		}
		if (!memberName || (!_.isString(memberName) && !_.isSymbol(memberName))) {
			throw Errors.expectedIdentifier(memberName);
		}

		if (!_.isObject(thisObj)) {
			throw Errors.expectedObject(thisObj);
		}

		let descriptor = Object.getOwnPropertyDescriptor(thisObj, memberName);
		if (descriptor) {
			if (!descriptor.writable) {
				throw Errors.propertyNotWriteable(memberName);
			}
			if (descriptor.get || descriptor.set) {
				throw Errors.getterOrSetterNotSupported(memberName);
			}
		}
		let symbol = getSymbol(memberName);
		let invoker = getInvoker(memberName);
		let ownList = thisObj[symbol] as Immutable.List<Function>;
		let ownFunction = thisObj[memberName];
		if (ownFunction !== undefined && !_.isFunction(ownFunction)) {
			throw Errors.memberNotFunction(memberName);
		}
		else if (ownList && ownFunction === invoker) {
			//the invocation list exists and the current occupant is the invoker for the member

			ownList = ownList.push(newFunction);
		} else if (ownList && ownFunction !== invoker) {
			//the invocation list exists, but the current function is not the invoker
			//meaning it was overriden. We have to create a new invocation list based on the old function.

			ownList = Immutable.List.of(ownFunction, newFunction)
		} else if (!ownList && !ownFunction) {
			//there is no invocation list and there is no function with that name.

			ownList = Immutable.List.of(newFunction);
		} else if (!ownList && ownFunction === invoker) {
			//there is no invocation list but there is a function and it is an invoker
			//this is a strange error.

			throw Errors.invalidInvocationList(memberName, undefined);
		} else if (!ownList && ownFunction) {
			//there is no invocation list but there is a function.

			ownList = Immutable.List.of(ownFunction, newFunction);
		}

		thisObj[memberName] = invoker;
		thisObj[symbol] = ownList;
		//if the invoker is in place, nothing should be done.
	}

	export function getInvocations(thisObj : any, memberName : string | symbol) : Immutable.List<Function> {
		if (!_.isObject(thisObj) || (!_.isSymbol(memberName) && _.isString(memberName))) {
			return Immutable.List.of<Function>();
		}

		let symbol = getSymbol(memberName);
		let invocationList = thisObj[symbol];
		if (invocationList) {
			return invocationList;
		} else if (_.isFunction(thisObj[memberName])) {
			return Immutable.List.of(thisObj[memberName]);
		} else {
			return Immutable.List.of<Function>();
		}
	}
}