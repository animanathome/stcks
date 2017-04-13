import React from 'react'
import * as d3 from "d3";
import ReactDOM from 'react-dom';
import theme from './Charts.scss';

var GridPrices = React.createClass({
	propTypes: {
		height:React.PropTypes.number,
		grid:React.PropTypes.func
	},
	componentDidUpdate: function (){ 
		this.renderGrid(); 
	},
	componentDidMount: function () {
		this.renderGrid(); 
	},
	renderGrid: function () {
		var scope = this;
		var format;
		var axis = d3.axisRight(this.props.axis)
			.tickSizeInner(this.props.width)
			.tickSizeOuter(0)
			.tickPadding(5)
			.ticks(4)
			.tickFormat(function(d, idx){
				return scope.props.prefix+d
			});

		var node = ReactDOM.findDOMNode(this);
		d3.select(node)
			.call(axis)
			.classed(theme['tick'], true)
			.classed(theme['axis'], true)
			.classed(theme['axis--y'], true)
	},
	render: function () {
		var translate = "translate(0,0)";
		return (
			<g className="y-grid" transform={translate}>
			</g>
		);
	}
});

export default GridPrices 