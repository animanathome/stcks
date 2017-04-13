import React from 'react'
import * as d3 from "d3";
import theme from './Charts.scss';

class PositionChart extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			color: "rgba(70, 130, 180, 0.1)"
		}
	}

	render(){
		// console.log('render', this.props)
		var x = this.props.x;
		var height = this.props.height;
		
		var area = d3.area()
				.curve(d3.curveMonotoneX)
				.x(function(d) { 
					// console.log(d.day, x(d.day));
					return x(d.day)+(x.bandwidth()/2); })
				.y0(height)
				.y1(0.0)
				.defined(function(d){
					return d.defined
				})

		return (
				<g>
						<path id={this.props.name}
								style={{fill:this.state.color}} 
								className={theme["area"]}
								d={area(this.props.data)}/>
				</g>
		)
	}
}

export default PositionChart 