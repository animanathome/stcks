import React from 'react'
import * as d3 from "d3";
import theme from './Charts.scss';

class HInfoLine extends React.Component {
	constructor(props){
		super(props)
	}

	render(){
		// console.log('HInfoLine.render')
        var x = this.props.x;
        var y = this.props.y;
        var d="M"+x(this.props.xr[0])+","+y(this.props.yp)
        d+="H"+(x(this.props.xr[1])+this.props.x.bandwidth()); 
        return (
            <path style={{strokeDasharray:'5, 5'}} 
            	  className={theme['hline-info']} d={d}>
			</path>
        )
	}
}

export default HInfoLine