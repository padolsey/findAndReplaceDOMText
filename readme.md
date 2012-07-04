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