import React, { Component, PropTypes } from 'react';
import { DropdownMenu } from './dropdown';

import { AttrLegend } from './legend';
import {
	Panel, ListGroup, ListGroupItem,
	Button, ButtonToolbar, ButtonGroup,
} from 'react-bootstrap';

import { SET_VIEW_PROPS, FILTER_METADATA } from '../actions/actionTypes';

export class ScatterplotSidepanel extends Component {
	componentWillMount(){
		const { 
			dispatch, dataset, 
			stateName, attrName } = this.props;

		const { attrs } = dataset[attrName];

		const handleChangeFactory = (field) => {
			return (value) => {
				dispatch({
					type: SET_VIEW_PROPS,
					stateName,
					path: dataset.path,
					viewState: { [stateName]: { [field]: value } },
				});
			};
		};

		const asMatrixHC = handleChangeFactory('asMatrix');
		const logscaleHC = handleChangeFactory('logscale');
		const jitterHC = handleChangeFactory('jitter');
		const colorAttrHC = handleChangeFactory('colorAttr');

		const nullFunc = () => { };

		const setCoordinateFactory = (label, attr1, attr2) => {
			if (attrs[attr1] && attrs[attr2]) {
				return (coordinateAttrs) => {
					const isSet = (coordinateAttrs[0] === attr1) && (coordinateAttrs[1] === attr2);
					const handleClick = () => {
						let newVals = coordinateAttrs.slice(0);
						newVals[0] = attr1;
						newVals[1] = attr2;
						dispatch({
							type: SET_VIEW_PROPS,
							stateName,
							path: dataset.path,
							viewState: { [stateName]: { coordinateAttrs: newVals } },
						});
					};
					return (
						<ButtonGroup>
							<Button
								bsStyle={isSet ? 'success' : 'default'}
								onClick={handleClick}>
								{label}
							</Button>
						</ButtonGroup>
					);
				};
			} else {
				return nullFunc;
			}
		};

		const setTSNE = setCoordinateFactory('tSNE', '_tSNE1', '_tSNE2');
		const setPCA = setCoordinateFactory('PCA', '_PC1', '_PC2');
		const setSFDP = setCoordinateFactory('SFDP', 'SFDP_X', 'SFDP_Y');
		const setLog = setCoordinateFactory('Log', '_LogMean', '_LogCV');

		const coordinateQuickSettings = (
			setTSNE !== nullFunc ||
			setPCA !== nullFunc ||
			setSFDP !== nullFunc ||
			setLog !== nullFunc
		) ? (
				(coordinateAttrs) => {
					return (
						<ListGroupItem>
							<ButtonGroup justified>
								{setTSNE(coordinateAttrs)}
								{setPCA(coordinateAttrs)}
								{setSFDP(coordinateAttrs)}
								{setLog(coordinateAttrs)}
							</ButtonGroup>
						</ListGroupItem>
					);
				}
			) : nullFunc;

		const coordAttrHCFactory = (newAttrs, idx) => {
			let newVals = newAttrs.slice(0);
			return (value) => {
				if (value) {
					newVals[idx] = value;
				} else {
					for (let i = idx; i < newVals.length; i++) {
						newVals[i] = newVals[i + 1];
					}
					newVals.pop();
				}
				dispatch({
					type: SET_VIEW_PROPS,
					stateName,
					path: dataset.path,
					viewState: { [stateName]: { coordinateAttrs: newVals } },
				});
			};
		};

		const colorSettingsFactory = (colorMode) => {
			return () => {
				dispatch({
					type: SET_VIEW_PROPS,
					stateName,
					path: dataset.path,
					viewState: { [stateName]: { colorMode } },
				});
			};
		};

		const heatmapOC = colorSettingsFactory('Heatmap');
		const heatmap2OC = colorSettingsFactory('Heatmap2');
		const categoricalOC = colorSettingsFactory('Categorical');

		this.setState({
			asMatrixHC,
			logscaleHC,
			jitterHC,
			colorAttrHC,
			coordinateQuickSettings,
			coordAttrHCFactory,
			heatmapOC,
			heatmap2OC,
			categoricalOC,
		});
	}

	render() {

		const { dispatch, dataset,
			stateName, attrName,
		} = this.props;

		const { attrs, allKeysNoUniques, dropdownOptions } = dataset[attrName];
		const filterOptions = dropdownOptions.allNoUniques;

		const { coordinateAttrs, asMatrix,
			colorAttr, colorMode,
			logscale, jitter } = this.props.viewState;

		const { asMatrixHC, logscaleHC, jitterHC,
			coordinateQuickSettings,
			heatmapOC, heatmap2OC, categoricalOC,
		} = this.state;


		const { colorAttrHC, coordAttrHCFactory } = this.state;

		// filter out undefined attributes;
		let newAttrs = [];
		for (let i = 0; i < coordinateAttrs.length; i++) {
			let attr = coordinateAttrs[i];
			if (attr) {
				newAttrs.push(attr);
			}
		}

		let coordinateDropdowns = [];
		for (let i = 0; i <= newAttrs.length; i++) {
			const coordHC = coordAttrHCFactory(newAttrs, i);
			coordinateDropdowns.push(
				<DropdownMenu
					key={i}
					value={newAttrs[i] ? newAttrs[i] : '<select attribute>'}
					options={allKeysNoUniques}
					filterOptions={filterOptions}
					onChange={coordHC}
				/>
			);
		}

		const colorDropdown = (
			<ListGroupItem>
				<label>Color</label>
				<DropdownMenu
					value={colorAttr}
					options={allKeysNoUniques}
					filterOptions={filterOptions}
					onChange={colorAttrHC}
				/>
			</ListGroupItem>
		);
		const coordinateButtons = (
			<ListGroupItem>
				{coordinateDropdowns}
				<ButtonGroup vertical block>
					<Button
						bsStyle={asMatrix ? 'success' : 'default'}
						onClick={() => { asMatrixHC(!asMatrix); }}>
						Plot Matrix
				</Button>
				</ButtonGroup>
				<label htmlFor={'xAxisButtons'} >X axis:</label>
				<ButtonToolbar id={'xAxisButtons'}>
					<Button
						bsStyle={logscale.x ? 'success' : 'default'}
						onClick={() => { logscaleHC({ x: !logscale.x }); }}>
						log
				</Button>
					<Button
						bsStyle={jitter.x ? 'success' : 'default'}
						onClick={() => { jitterHC({ x: !jitter.x }); }}>
						jitter
				</Button>
				</ButtonToolbar>
				<label htmlFor={'yAxisButtons'} >Y axis:</label>
				<ButtonToolbar id={'yAxisButtons'}>
					<Button
						bsStyle={logscale.y ? 'success' : 'default'}
						onClick={() => { logscaleHC({ y: !logscale.y }); }}>
						log
				</Button>
					<Button
						bsStyle={jitter.y ? 'success' : 'default'}
						onClick={() => { jitterHC({ y: !jitter.y }); }}>
						jitter
				</Button>
				</ButtonToolbar>
			</ListGroupItem>
		);

		const colorSettings = attrs[colorAttr] ? (
			<ListGroupItem>
				<ButtonGroup justified>
					<ButtonGroup>
						<Button
							bsStyle={colorMode === 'Heatmap' ? 'success' : 'default'}
							onClick={heatmapOC}>
							Heatmap
							</Button>
					</ButtonGroup>
					<ButtonGroup>
						<Button
							bsStyle={colorMode === 'Heatmap2' ? 'success' : 'default'}
							onClick={heatmap2OC}>
							Heatmap2
							</Button>
					</ButtonGroup>
					<ButtonGroup>
						<Button
							bsStyle={colorMode === 'Categorical' ? 'success' : 'default'}
							onClick={categoricalOC}>
							Categorical
							</Button>

					</ButtonGroup>
				</ButtonGroup>
				<AttrLegend
					mode={colorMode}
					filterFunc={(val) => {
						return () => {
							dispatch({
								type: FILTER_METADATA,
								path: dataset.path,
								stateName,
								attrName,
								key: colorAttr,
								val,
							});
						};
					}}
					attr={attrs[colorAttr]}
				/>
			</ListGroupItem>
		) : null;

		return (
			<Panel
				className='sidepanel'
				key={`${stateName}-settings`}
				header='Settings'
				bsStyle='default'>

				<ListGroup fill>
					{coordinateQuickSettings(coordinateAttrs)}
					{coordinateButtons}
					{colorDropdown}
					{colorSettings}
				</ListGroup>
			</Panel >
		);
	}
}

ScatterplotSidepanel.propTypes = {
	dispatch: PropTypes.func.isRequired,
	dataset: PropTypes.object.isRequired,
	stateName: PropTypes.string.isRequired,
	attrName: PropTypes.string.isRequired,
	viewState: PropTypes.object.isRequired,
};