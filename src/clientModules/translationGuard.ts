/**
 * Keep React working when the browser translates the page.
 *
 * Chrome and Edge translation replace text nodes with their own <font>
 * wrappers. When React later removes or inserts next to a node it believes it
 * owns, the node is no longer where React left it, and the DOM throws
 * "Failed to execute 'removeChild' on 'Node'", which takes the whole page
 * down.
 *
 * The guard makes the two operations tolerate a node the translator moved:
 * removing a node that is no longer a child does nothing, and inserting before
 * one appends instead. Neither path runs unless the DOM would have thrown, and
 * both log a warning so a real bug stays visible. This is the workaround from
 * facebook/react#11538.
 */
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn('Cannot remove a child from a different parent', child, this);
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn('Cannot insert before a reference node from a different parent', referenceNode, this);
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export {};
