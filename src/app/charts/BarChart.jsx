import React from 'react'
import * as d3 from "d3";

class BarChart extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			height:100,
			chart_id: 'BarChart'
		}
	}
	render(){
		// console.log('BarChart.render')
		// console.log(this.props.data)
		var scope = this;
		var barHeight = function(d){ 
  			return scope.props.height - scope.props.y(d); 
  		}

		var buildBars = this.props.data.map(function(d, i) {
			// console.log('bar', i, scope.props.x(d.day))
            return (
                <rect fill="#58657f" key={i}
                      x={scope.props.x(d.day)} 
                      y={scope.props.y(d.value)}
                      width={scope.props.x.bandwidth()}
                      height={barHeight(d.value)}/>
            )
        });

		return (
			<g>
			{buildBars}
			</g>
		)
	}
}

export default BarChart