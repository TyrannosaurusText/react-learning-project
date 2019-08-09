/*
 * Usage:
 * <PopoverStickOnHover
 *    component={<div>Holy guacamole! I'm Sticky.</div>}
 *    placement="top"
 *    onMouseEnter={() => { }}
 *    delay={200}
 * >
 *   <div>Show the sticky tooltip</div>
 * </PopoverStickOnHover>
 */

import React from "react";
import PropTypes from "prop-types";
import { Overlay, Popover } from "react-bootstrap";

export default class PopoverStickOnHover extends React.Component {
  constructor(props) {
    super(props);

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.setRef = this.setRef.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.ref = null;
    this.state = {
      showPopover: false
    };
  }

  setRef(ref) {
    // console.log("ref", ref);
    this.ref = ref;
    // return this.ref;
  }

  focusOn() {
    // console.log(this.ref);
    if (this.ref) this.ref.focus();
  }

  handleMouseEnter() {
    const { delay, onMouseEnter } = this.props;

    this.setTimeoutConst = setTimeout(() => {
      this.setState({ showPopover: true }, () => {
        if (onMouseEnter) {
          onMouseEnter();
        }
      });
    }, delay);
  }

  handleMouseLeave() {
    clearTimeout(this.setTimeoutConst);
    if (!this.state.lock) this.setState({ showPopover: false });
  }

  componentWillUnmount() {
    if (this.setTimeoutConst) {
      clearTimeout(this.setTimeoutConst);
    }
  }

  handleOnFocus() {
    const { delay, onMouseEnter } = this.props;

    this.setTimeoutConst = setTimeout(() => {
      this.setState({ showPopover: true, lock: true }, () => {
        if (onMouseEnter) {
          onMouseEnter();
        }
      });
    }, delay);
  }
  handleOnBlur() {
    clearTimeout(this.setTimeoutConst);
    this.setState({ lock: false }, () => {
      setTimeout(() => {
        // console.log(this.state.lock);

        if (!this.state.lock) {
          this.setState({ showPopover: false });
        }
      }, 1000);
    });
  }

  render() {
    let { component, children, placement } = this.props;

    const child = React.Children.map(children, child =>
      React.cloneElement(child, {
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave,
        onFocus: this.handleOnFocus,
        onBlur: this.handleOnBlur,
        ref: node => {
          this._child = node;
          const { ref } = child;
          if (typeof ref === "function") {
            ref(node);
          }
        }
      })
    )[0];
    return (
      <React.Fragment>
        {child}
        <Overlay
          show={this.state.showPopover}
          placement={placement}
          target={this._child}
          shouldUpdatePosition={true}
          transition={false}
        >
          {({
            placement,
            scheduleUpdate,
            arrowProps,
            outOfBoundaries,
            show: _show,
            ...props
          }) => (
            <StatefulToolTip
              setRef={this.setRef}
              {...props}
              style={{
                ...props.style
              }}
              className="inv-tooltip"
              onMouseEnter={() => {
                // console.log("Enter")
                this.setState({ showPopover: true });
              }}
              onMouseLeave={this.handleMouseLeave}
              onClick={() => {
                // console.log("hi")
                this.focusOn();
              }}
              onFocus={this.handleOnFocus}
              onBlur={this.handleOnBlur}
              id="popover"
              // tabIndex={1}
            >
              {component}
            </StatefulToolTip>
          )}
        </Overlay>
      </React.Fragment>
    );
  }
}

PopoverStickOnHover.defaultProps = {
  delay: 0
};

PopoverStickOnHover.propTypes = {
  delay: PropTypes.number,
  onMouseEnter: PropTypes.func,
  children: PropTypes.element.isRequired,
  component: PropTypes.node.isRequired
};

class StatefulToolTip extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    // console.log(this.props)
    return (
      <div
        tabIndex={-1}
        ref={this.props.setRef}
        className={this.props.className}
        style={this.props.style}
        onClick={this.props.onClick}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        {this.props.children}
      </div>
    );
  }
}
