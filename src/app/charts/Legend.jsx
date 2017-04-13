import React from 'react';
import * as d3 from "d3";
import theme from './Charts.scss';

class LegendItem extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			text: 'text',
            x: 22,
            y: 17,
            positionIndex: 1,
            colorVisibility: false,
            color: 'red'
		}
	}

	render(){
		// console.log('render', this.props)
		// console.log(this.props.data.data[this.props.dataIndex])
		var text = ''
		if(this.props.data.type == 'line') text+='$' 
		text += this.props.data.data[this.props.dataIndex].value
		var py = (this.state.y*(this.props.positionIndex+1));

		return (
			<g>
				<text y={py} x="10" fill={this.props.color}>
					{this.props.data.abbr}
				</text>
				<text y={py} x="65" fill='black'>
					{text}
				</text>
			</g>
		)
	}
}

class Legend extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			chart_id: 'Legend',
			x: 0,
            y: 0,
            width: 160,
            height: 80,
            itemHeight: 21,
            dataIndex: 0
		}
	}

	render(){
		// console.log('render', this.props.data)		
		var y = this.state.y + 5
		var x = (this.props.x == undefined ? 0 : this.props.x)
		var transform = 'translate(' + x + ',' + y + ')';
		// var height = this.props.data.length*this.state.itemHeight
		var data_list = Object.keys(this.props.data)
		var height = (data_list.length+1)*this.state.itemHeight
		// console.log('height:', height)
		
		var date = this.props.dates[this.props.dataIndex]
		// console.log(date)

		var width = this.props.width
		var d = "M0,"+(height+10)
		d+="L10"+','+height
		d+="L"+width+','+height
		d+= "L"+width+",0"
		d+= "L0,0"
		d+= "L0,"+(height+10)
		return (
			<g className={theme['legend']} transform={transform}>
				<rect x={0} 
                      y={0}                       
                      width={width} 
                      height={height}>
                </rect>
                <path d={d} stroke="#000000"/>

                <g>
					<text x="10" y="17" fill='black'>
						{date}
					</text>
				</g>
                {data_list.map((item, i) => {
    				return (
						<LegendItem key={i} 
							dataIndex={this.props.dataIndex} 
							positionIndex={i+1} 
							color={this.props.z(item)} 
							data={this.props.data[item]}/>
                        )
                    })
                }
			</g>
		)
	}
}

export default Legend
