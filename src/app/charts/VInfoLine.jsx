import React from 'react'
import * as d3 from "d3";
import theme from './Charts.scss';

class VInfoLine extends React.Component {
	constructor(props){
		super(props)
	}

	render(){
		var x = this.props.x;
        var y = this.props.y;
		// console.log('render', x, y, theme['vline-info'])
        // var px = x(data[idx].day);
        var d="M"+x+",0V"+y
        return (
            <path 
            	style={{strokeDasharray:'2, 2'}} 
            	className={theme['vline-info']} 
            	d={d}>
            </path>
        )
	}
}

export default VInfoLine