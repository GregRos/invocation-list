# Invocation Lists
This is a small library that can be used with ES7/TypeScript decorators.  It lets you specify that a function should be executed when another one is executed. You can do this multiple times, creating invocation lists under a single function that are inherited using standard JavaScript prototype inheritance.

Here is how it looks like in practice:

	import {invokedBy} from 'invocation-list';
	let a = "";
	class Example {
		
		hello() {
			a += "0";
		}
	
		@invokedBy('hello');
		method1() {
			a+= "1";
		}
		
		@invokedBy('hello')
		method2() {
			a+= "2"
		}
	}
	
	let example = new Example();
	example.hello();
	expect(a).toBe("012");

In the above example, `method1` and `method2` were added to the 'invocation list' of `hello`, which includes the body of the original method at the beginning.

This plays well with JavaScript prototype inheritance.

	class Derived extends Example {
		@invokedBy('hello');
		method3() {
			a += "3";
		}
	}
	
The above modifies the invocation list for `hello` only for objects of `Derived`.

However, note that if you override the managed method in a more derived prototype:

	class Derived extends Example {
		hello() {

		}
	}
	
The member is no longer managed by the invocation list of less-derived prototypes and they don't interfere with the new functionality.

Now, you can keep using `invokedBy` on that member, but overriding `hello` essentially blocked off the older invocation lists.

	class Derived extends Example {
		hello() {
			a += "0";
		}
		@invokedBy('hello')
		method4() {
			a += "4";
		}
	}
	new Derived().hello();
	expect(a).toBe("04");

Things would've been okay if we'd added a `super` call:

	class Derived extends Example {
		hello() {
			super.hello();
		}
		@invokedBy('hello')
		method4() {
			a += "4";
		}
	}
	new Derived().hello();
	expect(a).toBe("01234");

## Motivation
The motivation of this library is to allow syntax like this when working with React:

	class ExampleComponent extends React.Component {
		@Lifecycle.componentWillUpdate
		@Lifecycle.componentWillMount
		doStuff() {
		}
	}

This is implemented in the `react-decorators` library.