**[See the demo](http://padolsey.github.com/findAndReplaceDOMText/demo.html)**

`findAndReplaceDOMText` searches for regular expression matches in a DOM node and wraps all matches (and portions of matches separated by node bounderies) with a specified element.

For example:

```html
<p id="t">
	123 456 999
</p>
```

```js
findAndReplaceDOMText(/9+/, document.getElementById('t'), 'em');
```

This would result in:

```html
<p id="t">
	123 456 <em>999</em>
</p>
```

And it also works when matches are spread **across multiple nodes**! E.g.

```html
<p id="t">
	123 456 99<span>9 foo</span>
</p>
```

```js
findAndReplaceDOMText(/9+/, document.getElementById('t'), 'em');
```

This would result in:

```html
<p id="t">
	123 456 <em>99</em><span><em>9</em> foo</span>
</p>
```

The `EM` element has been added twice, to cover both portions of the match.

### Documentation

It's pretty simple. `findAndReplaceDOMText` has the following argument signature:

```js
findAndReplaceDOMText(
  regex,        // (RegExp) The regular expression to match
  element,      // (Element) The element to search within
  replacement,  // (String|Node|Function) Explained below
  captureGroup, // (Number) OPTIONAL: The regex capture group to replace
  elementFilter // (Function) OPTIONAL: A function to filter elements to process
);
```

The third argument (`replacement`) can be one of:

 * A nodeName (e.g. `"em"` or `"span"`)
 * A "stencil" node that will be cloned.
 * A function which will return an element whenever called with a match portion (text)

E.g. if I wanted to replace every instance of `foo` in an element with `<span class="found">` I would simply do:

```js
var span = document.createElement('span');
span.className = 'found';
findAndReplaceDOMText(/foo/g, myElement, span);
```

To avoid certain elements (e.g. Style and Script tags) you can specify an element filter like so:

```js
findAndReplaceDOMText(/foo/g, myElement, 'span', null, function(el) {
	var name = el.nodeName.toLowerCase();
	return name !== 'style' && name !== 'script';
});
```

### Changelog

 * 0.3.0: Switch to semver, add node-filtering feature (as requested in [Issue #11](https://github.com/padolsey/findAndReplaceDOMText/issues/11)
 * 0.2: Fix case where regular expression contains word bounderies and add support for specifying a capture group to replace as the fourth argument to `findAndReplaceDOMText()` (see [issue #5](https://github.com/padolsey/findAndReplaceDOMText/issues/5))
 * 0.11: Minor fix: Make sure replacement node function is called in order of matches (see [issue #4](https://github.com/padolsey/findAndReplaceDOMText/issues/4))
 * 0.1: Initial commit + Fix for IE's broken HTML5 cloneNode ([pull request](https://github.com/padolsey/findAndReplaceDOMText/pull/3))