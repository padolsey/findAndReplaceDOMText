# findAndReplaceDOMText

**[See the demo](http://padolsey.github.com/findAndReplaceDOMText/demo.html)**

`findAndReplaceDOMText` searches for regular expression matches in a given DOM node and replaces or wraps each match with a node or piece of text that you can specify.

For example:

```html
<p id="t">
  123 456 Hello
</p>
```

```js
findAndReplaceDOMText(document.getElementById('t'), {
  find: /Hello/,
  wrap: 'em'
});
```

This would result in:

```html
<p id="t">
  123 456 <em>Hello</em>
</p>
```

And it also works when matches are spread **across multiple nodes**! E.g.

```html
<p id="t">
  123 456 Hell<span>o Goodbye</span>
</p>
```

```js
findAndReplaceDOMText(document.getElementById('t'), {
  find: /Hello/,
  wrap: 'em'
});
```

This would result in:

```html
<p id="t">
  123 456 <em>Hell</em><span><em>o</em> Goodbye</span>
</p>
```

The `EM` element has been added twice, to cover both portions of the match.

## API

`findAndReplaceDOMText` has the following argument signature:

```js
findAndReplaceDOMText(
  element, // (Element) The element or text-node to search within
  options  // (Object) Explained below
);
```
### API

#### Options

The `options` object includes:

 * **find** (`RegExp | String`): Something to search for. A string will perform a global search by default (looking for all matches), but a RegExp will only do so if you include the global (`/.../g`) flag.
 * **replace** *optional* (`String | Function`): A String of text to replace matches with, or a Function which should return replacement Node or String. If you use a string, it can contain various tokens:
  * `$n` to represent the *n*th captured group of a regular expression (i.e. `$1`, `$2`, ...)
  * `$0` or `$&` to represent the entire match
  * <code>$`</code> to represent everything to the left of the match.
  * `$'` to represent everything to the right of the match.
 * **wrap** *optional* (`String | Node`): A string representing the node-name of an element that will be wrapped around matches (e.g. `span` or `em`). Or a Node (i.e. a stencil node) that we will clone for each match portion.
 * **portionMode** *optional* (`String`, one of `"retain"` or `"first"`): Indicates whether to re-use existing node boundaries when replacing a match with text (i.e. the default, `"retain"`), or whether to instead place the entire replacement in the first-found match portion's node. *Most of the time you'll want the default*.
 * **filterElements** *optional* (`Function`): A function to be called on every element encountered by `findAndReplaceDOMText`. If the function returns false the element will be altogether ignored.

#### What is a portion?

A portion or "match portion" is a part of a match that is delimited by node boundaries. Not all matches occur within a single text-node, so `findAndReplaceDOMText` has to be able to deal with cross-boundary matches (e.g. when matching `/foo/` in `"<em>f</em>oo"`).

#### The `replace` Function

If you pass a function to the `replace` option your function will be called on every portion of every match and is expected to return a DOM Node (a Text or Element node). Your function will be passed both the portion and the encapsulating match of that portion.

E.g.

*Input HTML*

```html
<div id="container">
  Explaining how to write a replace <em>fun</em>ction
</div>
```

*JS*

```js
findAndReplaceDOMText(document.getElementById('container'), {
  find: 'function',
  replace: function(portion, match) {
    return '[[' + portion.index + ']]';
  }
});
```

*Output HTML*

```html
<div id="container">
  Explaining how to write a replace <em>[[0]]</em>[[1]]
</div>
```

#### The instance

Calling `findAndReplaceDOMText` returns an instance of an internal Finder constructor -- the API on the object is limited, at the moment, to reverting:

```js
var finder = findAndReplaceDOMText(...);

// Later:
finder.revert();
```

**Note:** Reversion will only work if the nodes have not been tampered with after the initial replacement -- if there have been removals, movements or normalisations then the reversion is not guarenteed to work. In this case it's best to retain your own clone of the target node(s) in order to run your own reversion.

### Changelog

 * 0.4.0 (6 Oct 2013): Major API overhaul, including a new arg signature (`findAndReplaceDOMText(node, options)`, plus the ability to replace a match with text or wrap it with a DOM Node.
 * 0.3.0: Switch to semver, add node-filtering feature (as requested in [Issue #11](https://github.com/padolsey/findAndReplaceDOMText/issues/11)
 * 0.2: Fix case where regular expression contains word bounderies and add support for specifying a capture group to replace as the fourth argument to `findAndReplaceDOMText()` (see [issue #5](https://github.com/padolsey/findAndReplaceDOMText/issues/5))
 * 0.11: Minor fix: Make sure replacement node function is called in order of matches (see [issue #4](https://github.com/padolsey/findAndReplaceDOMText/issues/4))
 * 0.1: Initial commit + Fix for IE's broken HTML5 cloneNode ([pull request](https://github.com/padolsey/findAndReplaceDOMText/pull/3))
