import React, { Component, PropTypes } from 'react';
import { SparklineSidepanel } from './sparkline-sidepanel';
import { Sparkline } from './sparkline';
import { FetchDatasetComponent } from './fetch-dataset';
import * as _ from 'lodash';

class SparklineViewComponent extends Component {


	render() {
		const { sparklineState, dataSet, genes, dispatch } = this.props;
		const geneList = dataSet.rowAttrs.Gene;

		let colData = dataSet.colAttrs[sparklineState.colAttr];

		// Determine which array we want to sort by. Note that we abuse
		// the JS dictionary behavior of returning "undefined" when an
		// entry doesn't exist: if the string returned by orderByGene or
		// orderByAttr is not present, comparedArray stays undefined.
		let compareArray = undefined;
		if (sparklineState.orderByAttr === "(gene)") {
			compareArray = genes[sparklineState.orderByGene];
		} else {
			compareArray = dataSet.colAttrs[sparklineState.orderByAttr];
		}

		// Default to sorted "as is" ...
		let indices = new Array(colData.length);
		for (let i = 0; i < indices.length; ++i) {
			indices[i] = i;
		}
		// ... but if compareArray is defined, sort by that instead
		if (compareArray) {
			indices.sort(
				(a, b) => {
					return compareArray[a] < compareArray[b] ? -1 :
						compareArray[a] > compareArray[b] ? 1 : 0;
				}
			);
		}
		// Finally, order the column attribute values by the determined indices
		let temp = new Array(colData.length);
		for (let i = 0; i < colData.length; ++i) { temp[i] = colData[indices[i]]; }
		colData = temp;




		const genesList = _.intersection(
			sparklineState.genes.trim().split(/[ ,\r\n]+/),
			dataSet.rowAttrs.Gene
		);

		// Sidepanel
		const sidepanel = (
			<SparklineSidepanel
				sparklineState={sparklineState}
				dataSet={dataSet}
				geneCache={genes}
				geneList={geneList}
				dispatch={dispatch}
				/>
		);

		// "Show cell attribute"
		// Showing the scrollbar is ugly, but otherwise lining up will be *really hard*
		const legend = (
			<div style={{ flex: '0 0 auto', minHeight: '20px', overflowY: 'scroll' }}>
				<Sparkline
					orientation='horizontal'
					height={20}
					data={colData}
					dataRange={[0, colData.length]}
					mode={sparklineState.colMode}
					/>
			</div>
		);

		// Actual sparklines
		let geneSparklines = [];
		if (genesList.length !== 0 && genesList[0] !== '') {
			for (let i = 0; i < genesList.length; i++) {
				const gene = genesList[i];
				let geneData = new Array(colData.length);
				for (let j = 0; j < geneData.length; ++j) {
					geneData[j] = genes[gene][indices[j]];
				}
				geneSparklines[i] = (
					<div
						key={gene}
						style={{
							background: ((i % 2 === 0) ? '#FFFFFF' : '#F8F8F8'),
							display: 'flex',
							flexDirection: 'column',
							minHeight: '32px',
							maxHeight: '100px',
						}}>
						<span
							style={{
								display: 'block',
								width: '100%',
								fontSize: '10px',
								marginLeft: '2px',
								minHeight: '12px',
								maxHeight: '12px',
							}}>
							{gene}
						</span>
						<Sparkline
							orientation='horizontal'
							data={geneData}
							dataRange={[0, colData.length]}
							mode={sparklineState.geneMode}
							style={{ minHeight: '20px' }}
							/>
					</div>
				);
			}
		}

		return (
			<div className='view' style={{ overflowX: 'hidden' }}>
				{sidepanel}
				<div className='view-vertical' style={{ margin: '20px 0px 20px 20px' }}>
					{legend}
					<div style={{ display: 'flex', flex: 1, overflowY: 'scroll' }}>
						<div style={{
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
						}}>
							{geneSparklines}
						</div>
					</div>
					{legend}
				</div>
			</div>
		);
	}
}

SparklineViewComponent.propTypes = {
	dataSet: PropTypes.object.isRequired,
	genes: PropTypes.object.isRequired,
	sparklineState: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const SparklineViewContainer = function (props) {
	const { dispatch, data, sparklineState, params } = props;
	const { project, dataset } = params;
	const dataSet = data.dataSets[dataset];
	const genes = data.genes;
	return (dataSet === undefined ?
		<FetchDatasetComponent
			dispatch={dispatch}
			dataSets={data.dataSets}
			dataset={dataset}
			project={project} />
		:
		<SparklineViewComponent
			dispatch={dispatch}
			sparklineState={sparklineState}
			dataSet={dataSet}
			genes={genes} />
	);
};

SparklineViewContainer.propTypes = {
	// Passed down by react-router-redux
	params: PropTypes.object.isRequired,
	// Passed down by react-redux
	data: PropTypes.object.isRequired,
	sparklineState: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

//connect SparklineViewContainer to store
import { connect } from 'react-redux';

// react-router-redux passes URL parameters
// through ownProps.params. See also:
// https://github.com/reactjs/react-router-redux#how-do-i-access-router-state-in-a-container-component
const mapStateToProps = (state, ownProps) => {
	return {
		params: ownProps.params,
		sparklineState: state.sparklineState,
		data: state.data,
	};
};

export const SparklineView = connect(mapStateToProps)(SparklineViewContainer);