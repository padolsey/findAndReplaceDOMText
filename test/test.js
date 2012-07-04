


test('Element boundery types', function() {

	var tests = {
		'TEST': '<x>TEST</x>',
		'T<em>EST</em>': '<x>T</x><em><x>EST</x></em>',
		'<div>TEST</div>': '<div><x>TEST</x></div>',
		'<i>T</i><b>E</b><u>S</u><i>T</i>': '<i><x>T</x></i><b><x>E</x></b><u><x>S</x></u><i><x>T</x></i>',
		'<i>T</i><div>EST ok</div>': '<i><x>T</x></i><div><x>EST</x> ok</div>',
		'<i>ok T</i><em>EST</em>': '<i>ok <x>T</x></i><em><x>EST</x></em>',
		'<i>ok <i><b>T</b></i></i><em>EST</em>': '<i>ok <i><b><x>T</x></b></i></i><em><x>EST</x></em>'
	};

	var d = document.createElement('div');

	for (var t in tests) {
		d.innerHTML = t;
		findAndReplaceDOMText(/TEST/, d, 'x');
		ok(d.innerHTML === tests[t], '"' + d.innerHTML + '" === "' + tests[t] + '"');
		d.innerHTML = t;
		findAndReplaceDOMText(/TEST/g, d, 'x');
		ok(d.innerHTML === tests[t], '[g flag] "' + d.innerHTML + '" === "' + tests[t] + '"');
		findAndReplaceDOMText.revert();
		ok(d.innerHTML === t, 'Revert worked');
	}

});

test('Match lengths', function() {
	var d = document.createElement('div');
	for (var i = 0; i < 100; ++i) {
		d.innerHTML = Array(i + 1).join('<em>x</em>');
		findAndReplaceDOMText(/x+/, d, 'z');
		ok(d.innerHTML === Array(i + 1).join('<em><z>x</z></em>'))
	}
});

test('StencilNode definition', function() {
	var d = document.createElement('div');
	d.innerHTML = 'test test';
	findAndReplaceDOMText(/test/ig, d, 'div');
	ok(d.innerHTML === '<div>test</div> <div>test</div>');
	d.innerHTML = 'test test';
	findAndReplaceDOMText(/test/ig, d, function() {
		var e = document.createElement('x');
		e.className = 'f';
		return e;
	});
	ok(d.innerHTML === '<x class="f">test</x> <x class="f">test</x>');
	d.innerHTML = 'test test';
	findAndReplaceDOMText(/test/ig, d, document.createElement('z'));
	ok(d.innerHTML === '<z>test</z> <z>test</z>');
});

test('Edge case text nodes', function() {
	var d = document.createElement('div');
	d.innerHTML = '   __\n \n\t ';
	findAndReplaceDOMText(/__/, d, 'em');
	ok(d.innerHTML === '   <em>__</em>\n \n\t ');
	d.innerHTML = '';
	// Empty text nodes
	var t1 = d.appendChild(document.createTextNode(''));
	d.appendChild(document.createTextNode('x'));
	var t2 = d.appendChild(document.createTextNode(''));
	findAndReplaceDOMText(/x/, d, 'em');
	ok(d.innerHTML === '<em>x</em>');
	ok(d.childNodes.length === 3);
	ok(d.childNodes[0] === t1);
	ok(d.childNodes[2] === t2);
});


