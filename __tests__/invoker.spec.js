"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var invoker_1 = require('../src/invoker/invoker');
var invoker_decorators_1 = require('../src/invoker-decorators');
var addf = invoker_1.InvocationLists.addInvocation;
var stringify = function (x) {
    return !x ? "" + x : x.toString();
};
describe("invoker failure/success", function () {
    it("basic success test", function () {
        var x = {};
        var r = false;
        addf(x, "hi", function () { return r = true; });
        x.hi();
        expect(r).toBe(true);
    });
    it("invoker works with symbol keys", function () {
        var x = {};
        var r = false;
        var symb = Symbol.for("hi");
        addf(x, symb, function () { return r = true; });
        x[symb]();
    });
    describe("strange input functions", function () {
        var count = "";
        var x = {};
        var itShouldThrow = function (what) {
            it("throws when function is " + stringify(what), function () {
                expect(function () { return addf(x, "rts_test", what); }).toThrow();
            });
        };
        [null, undefined, 5, NaN, "c", Symbol("not an object")].forEach(itShouldThrow);
    });
    describe("strange target objects", function () {
        var shouldWork = function (_a) {
            var what = _a[0], desc = _a[1];
            it("works when the input is " + desc + " (" + typeof what + ")", function () {
                var c = "";
                addf(what, "rts_test", function () { return c = "x"; });
                what.rts_test();
                expect(c).toBe("x");
            });
        };
        var shouldThrow = function (_a) {
            var what = _a[0], desc = _a[1];
            it("throws when the input is " + desc + " (" + typeof (what) + ")", function () {
                expect(function () { return addf(what, "rts_test", function () { }); }).toThrow();
            });
        };
        var noProto = [Object.create(null), "null proto object"];
        var wrapper = [String.prototype, "wrapped string"];
        var arr = [Array.prototype, "array"];
        var typedArray = [new Uint8Array(1), "typed array"];
        var regexp = [/a/, "regexp"];
        var func = [function () { return 1; }, "function"];
        [noProto, wrapper, arr, typedArray, regexp, func].forEach(shouldWork);
        var throws = [
            [null, "null"],
            [undefined, "undefined"],
            [1, "number"],
            ["", "string"],
            [Symbol(""), "symbol"]
        ];
        throws.forEach(shouldThrow);
    });
});
describe("complex proto chains", function () {
    it("add 2 functions to invoke list, both execute in right order", function () {
        var x = {};
        var count = "";
        addf(x, "test", function () { return count += "a"; });
        addf(x, "test", function () { return count += "b"; });
        x.test();
        expect(count).toBe("ab");
    });
    it("modify existing function with invocation list", function () {
        var x = {};
        var count = "";
        x.test = function () { return count += "a"; };
        addf(x, "test", function () { return count += "b"; });
        x.test();
        expect(count).toBe("ab");
    });
    it("invocation list override on object with prototype", function () {
        var x = {};
        var count = "";
        addf(x, "test", function () { return count = "a"; });
        var y = Object.create(x);
        addf(y, "test", function () { return count += "b"; });
        y.test();
        expect(count).toBe("ab");
        x.test();
        expect(count).toBe("a");
    });
    it("invocation list on prototype doesn't change explicit member", function () {
        var x = {};
        var count = "";
        addf(x, "test", function () { return count = "a"; });
        var y = Object.create(x);
        y.test = function () { return count = "b"; };
        y.test();
        expect(count).toBe("b");
        x.test();
        expect(count).toBe("a");
    });
    it("3 prototype chain, invocation lists on 1 and 3", function () {
        var x = {};
        var count = "";
        addf(x, "test", function () { return count += "x"; });
        var y = Object.create(x);
        var z = Object.create(y);
        addf(z, "test", function () { return count += "z"; });
        z.test();
        expect(count).toBe("xz");
    });
    it("3 prototype chain, invocation lists on 1 and 3, overide on 2", function () {
        var x = {};
        var count = "";
        addf(x, "test", function () { return count += "x"; });
        var y = Object.create(x);
        y.test = function () { return count += "y"; };
        var z = Object.create(y);
        addf(z, "test", function () { return count += "z"; });
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
    it("invoc list then override on single", function () {
        var x = {};
        var count = "";
        addf(x, "test", function () { return count += "a"; });
        x.test = function () { return count += "b"; };
        x.test();
        expect(count).toBe("b");
        count = "";
        addf(x, "test", function () { return count += "c"; });
        x.test();
        expect(count).toBe("bc");
    });
    it("preserves this", function () {
        var x = { p: 1 };
        var count = "";
        addf(x, "test", function () {
            count += this.p;
        });
        addf(x, "test", function () {
            count += "," + this.p;
        });
        x.test();
        expect(count).toBe("1,1");
    });
});
describe("decorator", function () {
    it("should work", function () {
        var x = "";
        var s = invoker_decorators_1.invokedBy("entryPoint");
        var symb = Symbol.for("hi");
        var t = invoker_decorators_1.invokedBy(symb);
        var Test = (function () {
            function Test() {
            }
            Test.prototype.entryPoint = function () {
                x += "0";
            };
            Test.prototype.func1 = function () {
                x += "1";
            };
            Test.prototype.func2 = function () {
                x += "2";
            };
            Test.prototype[symb] = function () {
            };
            Test.prototype.funcSymb = function () {
                x += "3";
            };
            __decorate([
                s
            ], Test.prototype, "func1", null);
            __decorate([
                s
            ], Test.prototype, "func2", null);
            __decorate([
                t
            ], Test.prototype, "funcSymb", null);
            return Test;
        }());
        var ex = new Test();
        ex.entryPoint();
        expect(x).toBe("012");
        ex[symb]();
        expect(x).toBe("0123");
    });
});
//# sourceMappingURL=invoker.spec.js.map