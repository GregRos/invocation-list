/**
 * Created by Greg on 29/09/2016.
 */
import {InvokerError} from "../dist/errors";
import _ = require('lodash');
/**
 * Created by Greg on 26/09/2016.
 */
declare function require(name : string) : any;
import {InvocationLists} from '../src/invoker/invoker';
import {invokedBy} from '../src/invoker-decorators';

let addf = InvocationLists.addInvocation;

let stringify = (x : any) => {
	return !x ? "" + x : x.toString();
};
describe("invoker failure/success", () => {
	it("basic success test", () => {
		let x = {} as any;
		let r = false;
		addf(x, "hi", () => r = true);
		x.hi();
		expect(r).toBe(true);
	});

	it("invoker works with symbol keys", () => {
		let x = {} as any;
		let r = false;
		let symb = Symbol.for("hi");
		addf(x,symb , () => r = true);
		x[symb]();
	});
	describe("strange input functions", () => {
		let count = "";
		let x = {} as any;
		let itShouldThrow = (what : any) => {
			it(`throws when function is ${stringify(what)}`, () => {
				expect(() => addf(x, "rts_test", what)).toThrow()
			})
		};
		[null, undefined, 5, NaN, "c", Symbol("not an object")].forEach(itShouldThrow);
	});

	describe("strange target objects", () => {
		let shouldWork = ([what,desc]) => {
			it(`works when the input is ${desc} (${typeof what})`, () => {
				let c = "";
				addf(what, "rts_test", () => c = "x");
				what.rts_test();
				expect(c).toBe("x");
			});
		};

		let shouldThrow = ([what, desc]) => {
			it(`throws when the input is ${desc} (${typeof(what)})`, () => {
				expect(() => addf(what, "rts_test", () => {})).toThrow();
			});
		};

		let noProto = [Object.create(null), "null proto object"];
		let wrapper = [String.prototype, "wrapped string"];
		let arr = [Array.prototype, "array"];
		let typedArray = [new Uint8Array(1), "typed array"];
		let regexp = [/a/, "regexp"];
		let func = [() => 1, "function"];
		[noProto, wrapper, arr, typedArray, regexp, func].forEach(shouldWork);

		let throws = [
			[null, "null"],
			[undefined, "undefined"],
			[1, "number"],
			["", "string"],
			[Symbol(""), "symbol"]
		];

		throws.forEach(shouldThrow);
	});
});

describe("complex proto chains", () => {
	it("add 2 functions to invoke list, both execute in right order", () => {
		let x = {} as any;
		let count = "";
		addf(x, "test", () => count += "a");
		addf(x, "test", () => count += "b");
		x.test();
		expect(count).toBe("ab");
	});

	it("modify existing function with invocation list", () => {
		let x = {} as any;
		let count = "";
		x.test = () => count += "a";
		addf(x, "test", () => count += "b");
		x.test();
		expect(count).toBe("ab");
	});

	it("invocation list override on object with prototype", () => {
		let x = {} as any;
		let count = "";
		addf(x, "test", () => count = "a");
		let y = Object.create(x);
		addf(y, "test", () => count += "b");
		y.test();
		expect(count).toBe("ab");
		x.test();
		expect(count).toBe("a");
	});

	it("invocation list on prototype doesn't change explicit member", () => {
		let x = {} as any;
		let count = "";
		addf(x, "test", () => count = "a");
		let y = Object.create(x);
		y.test = () => count = "b";
		y.test();
		expect(count).toBe("b");
		x.test();
		expect(count).toBe("a");
	});

	it("3 prototype chain, invocation lists on 1 and 3", () => {
		let x = {} as any;
		let count = "";
		addf(x, "test", () => count += "x");
		let y = Object.create(x);
		let z = Object.create(y);
		addf(z, "test", () => count += "z");
		z.test();
		expect(count).toBe("xz");
	});

	it("3 prototype chain, invocation lists on 1 and 3, overide on 2", () => {
		let x = {} as any;
		let count = "";
		addf(x, "test", () => count += "x");
		let y = Object.create(x);
		y.test = () => count += "y";
		let z = Object.create(y);
		addf(z, "test", () => count += "z");
		z.test();
		//according to the spec, when the invoker is overriden on y
		//and a new invoker is placed on z, then the invocation list for z will be [y.test, newF]
		expect(count).toBe("yz");

		count = "";
		//this should still be just "y":
		y.test();

		//this should still be just "x":
		count = "";
		x.test();
	});

	it("invoc list then override on single", () => {
		let x = {} as any;
		let count = "";
		addf(x, "test", () => count += "a");
		x.test = () => count += "b";
		x.test();
		expect(count).toBe("b");
		count = "";
		addf(x, "test", () => count += "c");
		x.test();
		expect(count).toBe("bc");
	});

	it("preserves this", () => {
		let x = {p : 1} as any;
		let count = "";
		addf(x, "test", function() {
			count += this.p;
		});
		addf(x, "test", function() {
			count += "," + this.p;
		});
		x.test();
		expect(count).toBe("1,1");
	})
});

describe("decorator", () => {
	it("should work", () => {
		let x = "";
		let s = invokedBy("entryPoint");

		let symb = Symbol.for("hi");
		let t = invokedBy(symb);
		class Test {
			entryPoint() {
				x += "0";
			}
			@s
			func1() {
				x += "1";
			}
			@s
			func2() {
				x += "2";
			}


			[symb]() {

			}

			@t
			funcSymb() {
				x += "3";
			}


		}

		let ex = new Test();
		ex.entryPoint();
		expect(x).toBe("012");
		ex[symb]();
		expect(x).toBe("0123");

	})
});




