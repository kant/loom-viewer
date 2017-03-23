import React, { Component, PropTypes } from 'react';
import { ScatterplotSidepanel } from './scatterplot-sidepanel';
import { fetchGene } from '../actions/actions';
import { binaryIndexOf } from '../js/util';

export class LandscapeSidepanel extends Component {

	componentWillMount() {
		this.fetchGenes(this.props);
	}

	componentWillUpdate(nextProps){
		this.fetchGenes(nextProps);
	}

	fetchGenes(props) {
		const { dispatch, dataset } = props;
		const { sortedKeys } = dataset.col;
		const viewState = dataset.viewState.landscape;
		const { coordinateAttrs, colorAttr } = viewState;

		// fetch any selected genes (that aren't being fetched yet).
		let genes = [];
		for (let i = 0; i < coordinateAttrs.length; i++) {
			let value = coordinateAttrs[i];
			// `keys` will be in the range of a few dozen attributes
			// at most, whereas `genes` or `CellID` will be in the
			// thousands. So it's faster to check if a value *isn't*
			// in `keys`, than to check if it *is* in `genes`.
			if (value && binaryIndexOf(sortedKeys, value) === -1 && !dataset.fetchedGenes[value]) {
				genes.push(value);
			}
		}
		if (binaryIndexOf(sortedKeys, colorAttr) === -1 && !dataset.fetchedGenes[colorAttr]) {
			genes.push(colorAttr);
		}
		if (genes.length) {
			dispatch(fetchGene(dataset, genes));
		}
	}

	render() {
		const { dispatch, dataset } = this.props;
		const viewState = dataset.viewState.landscape;

		return (
			<ScatterplotSidepanel
				dispatch={dispatch}
				dataset={dataset}
				stateName={'landscape'}
				axis={'col'}
				viewState={viewState}
			/>
		);
	}
}

LandscapeSidepanel.propTypes = {
	dataset: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};