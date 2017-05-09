import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Button, Glyphicon, Collapse, OverlayTrigger, Tooltip } from 'react-bootstrap';

export class OverlayTooltip extends PureComponent {
	render() {
		return (
			<OverlayTrigger
				placement={this.props.placement || 'top'}
				overlay={(
					<Tooltip id={this.props.tooltipId}>{this.props.tooltip}</Tooltip>)
				}>
				{this.props.children}
			</OverlayTrigger>
		);
	}
}

OverlayTooltip.propTypes = {
	placement: PropTypes.string,
	tooltip: PropTypes.string.isRequired,
	tooltipId: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export class CollapsibleSettings extends PureComponent {
	constructor(...args) {
		super(...args);
		this.toggle = this.toggle.bind(this);
		this.state = {
			open: !this.props.mountClosed,
		};
	}

	toggle() {
		this.setState({ open: !this.state.open });
	}

	render() {
		const {
			placement,
			tooltip,
			tooltipId,
			label,
			size,
			unmountOnExit,
			children,
		} = this.props;

		let chevron = this.state.open ? 'chevron-down' : 'chevron-right';
		// using Button so it can be triggered by keyboard
		let _label = tooltip ? (
			<OverlayTooltip
				placement={placement || 'top'}
				tooltip={tooltip}
				tooltipId={tooltipId}>
				<Button
					onClick={this.toggle}
					bsStyle='link'
					bsSize={size}>
					<Glyphicon glyph={chevron} /> {label}
				</Button>
			</OverlayTooltip>
		) : label ? (
			<Button
				onClick={this.toggle}
				bsStyle='link'
				bsSize={size}>
				<Glyphicon glyph={chevron} /> {label}
			</Button>
		) : null;


		return (
			<div>
				{_label}
				<Collapse
					in={this.state.open}
					unmountOnExit={unmountOnExit} >
					{children}
				</Collapse>
			</div >
		);
	}
}

CollapsibleSettings.propTypes = {
	placement: PropTypes.string,
	tooltip: PropTypes.string,
	tooltipId: PropTypes.string,
	label: PropTypes.string.isRequired,
	size: PropTypes.string,
	unmountOnExit: PropTypes.bool,
	children: PropTypes.node.isRequired,
	mountClosed: PropTypes.bool,
};