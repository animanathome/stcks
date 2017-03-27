import React from 'react'
import * as d3 from "d3";
import theme from './Charts.scss';

class LineChart extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			height:100,
			width: 800,
			chart_id: 'LineChart',
			stroke: 'gray'
		}
	}
	render(){
		// console.log('LineChart.render')
		// console.log('theme', theme)
		// console.log('data', this.props.data)
		// console.log('x', this.props.x(this.props.data[0].day))
		// console.log('y', this.props.y(this.props.data[0].value))
		
		var stroke = this.state.stroke;
		if(this.props.stroke !== undefined){
			stroke = this.props.stroke;
		}

		var scope = this
		var line = d3.line()
			.x(function(d, idx) { 
				// console.log('line', idx, scope.props.x(d.day))
				return scope.props.x(d.day)+(scope.props.x.bandwidth()/2); 
			})
			.y(function(d, idx) { 
				// console.log(idx, scope.props.y(d.value))
				return scope.props.y(d.value); 
			})
			// .defined(function(d){
			// 	return !isNaN(d.value)
			// });

		return (
			<path className={theme["line"]+' '+theme["shadow"]}
                   stroke={stroke} 
                   d={line(this.props.data)} 
                   strokeLinecap="round"/>
		)
	}
}

export default LineChart