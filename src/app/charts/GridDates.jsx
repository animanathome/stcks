import React from 'react'
import * as d3 from "d3";
import ReactDOM from 'react-dom';
import theme from './Charts.scss';

var GridDates = React.createClass({
	propTypes: {
		height:React.PropTypes.number,
		grid:React.PropTypes.func,
		gridType:React.PropTypes.oneOf(['x','y'])
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
		var axis = d3.axisBottom(this.props.axis)
			.tickSizeInner(-10)
			.tickSizeOuter(-10)
			.tickPadding(5)
			.ticks(scope.props.dates.length)
			.tickFormat(function(d, idx){
				if(idx%4 == 0){
					return scope.props.dates[idx].date
				}
			});

		var node = ReactDOM.findDOMNode(this);
		d3.select(node)
			.call(axis)
			.classed(theme['tick'], true)
			.classed(theme['axis'], true)
			.classed(theme['axis--x'], true)
	},
	render: function () {
		var translate = "translate(0,"+(this.props.height)+")";
		return (
			<g className="x-grid" transform={translate}>
			</g>
		);
	}
});

export default GridDates 