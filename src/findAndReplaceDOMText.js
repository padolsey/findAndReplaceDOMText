/**
 * findAndReplaceDOMText
 * @author James Padolsey http://james.padolsey.com
 * @license http://unlicense.org/UNLICENSE
 *
 * Matches the text of a DOM node against a regular expression
 * and replaces each match (or node-separated portions of the match)
 * in the specified element.
 *
 * Example: Wrap 'test' in <em>:
 *   <p id="target">This is a test</p>
 *   <script>
 *     findAndReplaceDOMText(
 *       /test/,
 *       document.getElementById('target'),
 *       'em'
 *     );
 *   </script>
 */
window.findAndReplaceDOMText = (function() {

  /** 
   * findAndReplaceDOMText
   * 
   * Locates matches and replaces with replacementNode
   *
   * @param {RegExp} regex The regular expression to match
   * @param {Node} node Element or Text node to search within
   * @param {String|Element|Function} replacementNode A NodeName,
   *  Node to clone, or a function which returns a node to use
   *  as the replacement node.
   */
  function findAndReplaceDOMText(regex, node, replacementNode) {

    var m, index, matches = [], text = _getText(node);
    var replaceFn = _genReplacer(replacementNode);

    if (!text) { return; }

    if (regex.global) {
      while (m = regex.exec(text)) {
        if (!m[0]) throw 'findAndReplaceDOMText cannot handle zero-length matches';
        matches.push([regex.lastIndex - m[0].length, regex.lastIndex, m]);
      }
    } else {
      m = text.match(regex);
      index = text.indexOf(m[0]);
      if (!m[0]) throw 'findAndReplaceDOMText cannot handle zero-length matches';
      matches.push([index, index + m[0].length, m]);
    }

    if (matches.length) {
      _stepThroughMatches(node, matches, replaceFn);
    }

  }

  /**
   * Gets aggregate text of a node without resorting
   * to broken innerText/textContent
   */
  function _getText(node) {

    if (node.nodeType === 3) {
      return node.data;
    }

    var txt = '';

    if (node = node.firstChild) do {
      txt += _getText(node);
    } while (node = node.nextSibling);

    return txt;

  }

  /** 
   * Steps through the target node, looking for matches, and
   * calling replaceFn when a match is found.
   */
  function _stepThroughMatches(node, matches, replaceFn) {

    var after, before,
        startNode,
        endNode,
        startNodeIndex,
        endNodeIndex,
        innerNodes = [],
        atIndex = 0,
        curNode = node,
        matchLocation = matches.shift();

    out: while (true) {

      if (curNode.nodeType === 3) {
        if (!endNode && curNode.length + atIndex >= matchLocation[1]) {
          // We've found the ending
          endNode = curNode;
          endNodeIndex = matchLocation[1] - atIndex;
        } else if (startNode) {
          // Intersecting node
          innerNodes.push(curNode);
        }
        if (!startNode && curNode.length + atIndex > matchLocation[0]) {
          // We've found the match start
          startNode = curNode;
          startNodeIndex = matchLocation[0] - atIndex;
        }
        atIndex += curNode.length;
      }

      if (startNode && endNode) {
        curNode = replaceFn({
          startNode: startNode,
          startNodeIndex: startNodeIndex,
          endNode: endNode,
          endNodeIndex: endNodeIndex,
          innerNodes: innerNodes,
          match: matchLocation[2]
        });
        // replaceFn has to return the node that replaced the endNode
        // and then we step back so we can continue from the end of the 
        // match:
        atIndex -= (endNode.length - endNodeIndex);
        startNode = null;
        endNode = null;
        innerNodes = [];
        matchLocation = matches.shift();
        if (!matchLocation) {
          break; // no more matches
        }
      } else if (curNode.firstChild || curNode.nextSibling) {
        // Move down or forward:
        curNode = curNode.firstChild || curNode.nextSibling;
        continue;
      }

      // Move forward or up:
      while (true) {
        if (curNode.nextSibling) {
          curNode = curNode.nextSibling;
          break;
        } else if (curNode.parentNode !== node) {
          curNode = curNode.parentNode;
        } else {
          break out;
        }
      }

    }

  }

  var reverts;
  /**
   * Reverts the last findAndReplaceDOMText process
   */
  findAndReplaceDOMText.revert = function revert() {
    for (var i = 0, l = reverts.length; i < l; ++i) {
      reverts[i]();
    }
    reverts = [];
  };

  /** 
   * Generates the actual replaceFn which splits up text nodes
   * and inserts the replacement element.
   */
  function _genReplacer(nodeName) {

    reverts = [];

    if (typeof nodeName != 'function') {
      var stencilNode = nodeName.nodeType ? nodeName : document.createElement(nodeName);
    }

    return function replace(range) {

      if (typeof nodeName == 'function') {
        stencilNode = nodeName(range.match);
      }

      if (range.startNode === range.endNode) {
        var node = range.startNode;
        if (range.startNodeIndex > 0) {
          // Add `before` text node (before the match)
          var before = document.createTextNode(node.data.substring(0, range.startNodeIndex));
          node.parentNode.insertBefore(before, node);
        }
        // Create the replacement node:
        var el = stencilNode.cloneNode();
        el.appendChild(document.createTextNode(range.match[0]));
        node.parentNode.insertBefore(el, node);
        if (range.endNodeIndex < node.length) {
          // Add `after` text node (after the match)
          var after = document.createTextNode(node.data.substring(range.endNodeIndex));
          node.parentNode.insertBefore(after, node);
        }
        node.parentNode.removeChild(node);
        reverts.push(function() {
          var pnode = el.parentNode;
          pnode.insertBefore(el.firstChild, el);
          pnode.removeChild(el);
          pnode.normalize();
        });
        return el;
      } else {
        // B4 - innerNodes - After
        var before = document.createTextNode(range.startNode.data.substring(0, range.startNodeIndex));
        var after = document.createTextNode(range.endNode.data.substring(range.endNodeIndex));
        var elA = stencilNode.cloneNode();
        var elB = stencilNode.cloneNode();
        var innerSpans = [];
        elA.appendChild(document.createTextNode(range.startNode.data.substring(range.startNodeIndex)));
        elB.appendChild(document.createTextNode(range.endNode.data.substring(0, range.endNodeIndex)));
        range.startNode.parentNode.insertBefore(before, range.startNode);
        range.startNode.parentNode.insertBefore(elA, range.startNode);
        range.startNode.parentNode.removeChild(range.startNode);
        range.endNode.parentNode.insertBefore(elB, range.endNode);
        range.endNode.parentNode.insertBefore(after, range.endNode);
        range.endNode.parentNode.removeChild(range.endNode);
        for (var i = 0, l = range.innerNodes.length; i < l; ++i) {
          var innerNode = range.innerNodes[i];
          var innerSpan = stencilNode.cloneNode();
          innerNode.parentNode.insertBefore(innerSpan, innerNode);
          innerSpan.appendChild(innerNode);
          innerSpans.push(innerSpan);
        }
        reverts.push(function() {
          innerSpans.unshift(elA);
          innerSpans.push(elB);
          for (var i = 0, l = innerSpans.length; i < l; ++i) {
            var span = innerSpans[i];
            var pnode = span.parentNode;
            pnode.insertBefore(span.firstChild, span);
            pnode.removeChild(span);
            pnode.normalize();
          }
        });
        return elB;
      }
    };

  }

  return findAndReplaceDOMText;

}());