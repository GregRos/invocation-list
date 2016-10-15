/**
 * Created by Greg on 30/09/2016.
 */
import {InvocationLists} from './invoker/invoker';
import _ = require("lodash");

export function invokedBy(memberName : string | symbol, maxArity : number = -1) {
	return function (target : any, property : string | symbol) : void {
		let f = target[property] as Function;
		InvocationLists.addInvocation(target, memberName, target[property]);
	};
}
