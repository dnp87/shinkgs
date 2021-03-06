import canUseDom from "dom-helpers/util/inDOM";
import ownerDocument from "dom-helpers/ownerDocument";

import PropTypes from "prop-types";
import componentOrElement from "prop-types-extra/lib/componentOrElement";
import React from "react";
import ReactDOM from "react-dom";

function getContainer(container, defaultContainer) {
  container = typeof container === "function" ? container() : container;
  return ReactDOM.findDOMNode(container) || defaultContainer;
}

function ownerDocument2(componentOrElement2) {
  return ownerDocument(ReactDOM.findDOMNode(componentOrElement2));
}

/**
 * The `<Portal/>` component renders its children into a new "subtree" outside of current component hierarchy.
 * You can think of it as a declarative `appendChild()`, or jQuery's `$.fn.appendTo()`.
 * The children of `<Portal/>` component will be appended to the `container` specified.
 */
export class Portal extends React.Component {
  static displayName = "Portal";

  static propTypes = {
    /**
     * A Node, Component instance, or function that returns either. The `container` will have the Portal children
     * appended to it.
     */
    container: PropTypes.oneOfType([componentOrElement, PropTypes.func]),

    onRendered: PropTypes.func,
  };

  UNSAFE_componentWillMount() {
    if (!canUseDom) {
      return;
    }

    let { container } = this.props;
    if (typeof container === "function") {
      container = container();
    }

    if (container && !ReactDOM.findDOMNode(container)) {
      // The container is a React component that has not yet been rendered.
      // Don't set the container node yet.
      return;
    }

    this.setContainer(container);
  }

  componentDidMount() {
    if (!this._portalContainerNode) {
      this.setContainer(this.props.container);
      this.forceUpdate(this.props.onRendered);
    } else if (this.props.onRendered) {
      this.props.onRendered();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.container !== this.props.container) {
      this.setContainer(nextProps.container);
    }
  }

  componentWillUnmount() {
    this._portalContainerNode = null;
  }

  setContainer(container) {
    this._portalContainerNode = getContainer(
      container,
      ownerDocument2(this).body
    );
  }

  render() {
    return this.props.children && this._portalContainerNode
      ? ReactDOM.createPortal(this.props.children, this._portalContainerNode)
      : null;
  }

  getMountNode = () => {
    return this._portalContainerNode;
  };
}
