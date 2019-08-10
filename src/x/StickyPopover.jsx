import React from "react";
import PropTypes from "prop-types";
import { Overlay } from "react-bootstrap";

export default class StickyPopover extends React.Component {
  constructor(props) {
    super(props);
    this.tooltip_timeout=150;
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
    this.ref = ref;
  }

  focusOn() {
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
        if (!this.state.lock) {
          this.setState({ showPopover: false });
        }
      }, this.tooltip_timeout);
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
              className={this.props.className}
              onMouseEnter={() => {
                this.setState({ showPopover: true });
              }}
              onMouseLeave={this.handleMouseLeave}
              onClick={() => {
                this.focusOn();
              }}
              onFocus={this.handleOnFocus}
              onBlur={this.handleOnBlur}
            >
              {component}
            </StatefulToolTip>
          )}
        </Overlay>
      </React.Fragment>
    );
  }
}

StickyPopover.defaultProps = {
  delay: 0
};

StickyPopover.propTypes = {
  delay: PropTypes.number,
  onMouseEnter: PropTypes.func,
  children: PropTypes.element.isRequired,
  component: PropTypes.node.isRequired
};

class StatefulToolTip extends React.Component {

  render() {
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
