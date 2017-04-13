import React from 'react'
import * as d3 from "d3";
import theme from './Charts.scss';

class AnnotateValue extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		var left = this.props.x(this.props.xp)+(this.props.x.bandwidth())
		var top = this.props.y(this.props.yp)-7.5

		var transform='translate(' + left + ',' + top + ')';
		return (
			<g className={theme['annotation']} transform={transform}>
				<path d="M0,0H50V16H0L-8,8L0,0" stroke="#000000"/>
				<text transform='translate(6,12)'>{"$"+this.props.yp}</text>
			</g>
		)
	}
}

export default AnnotateValue