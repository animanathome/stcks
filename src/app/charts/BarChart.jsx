import React from 'react'
import theme from './BarChart.css';
import * as d3 from "d3";
import weekday from './weekday.js'

class BarChart extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			height:100
		}
	}	render(){
		var data = this.props.data;
		if(!data.hasOwnProperty('data')){
			return (
				<div>Loading...</div>
			)
		}else{
			var formatAxisDates;
            if(['1Y', '2Y', '3Y', '5Y', '10Y'].indexOf(this.props.range) != -1){
                formatAxisDates = d3.timeFormat("%b %Y");
            }else{
                formatAxisDates = d3.timeFormat("%e %b");
            }
            var parseTime = d3.timeParse("%m-%d-%Y");

			var margin = {top: 5, right: 30, bottom: 20, left: 30},
				width = this.props.width - (margin.left + margin.right),
				height = this.state.height - (margin.top + margin.bottom);

			var structure = data.data.structure
			console.log(structure)
			
			var dates = data.data.data.map(function(d){
                // console.log(d)
                return parseTime(d[0])
            })
            var xrng = d3.extent(dates)

            var _date;
            var weekdays = data.data.data.map(function(d){
                _date = new Date(d[0])
                // console.log(_date, d[0])
                return {
                    'date':formatAxisDates(_date),
                    'weekday':weekday(_date)
                }
            })

            // close(d) prices
            var vindex = structure.indexOf('volume')
            var vdata = data.data.data.map(function(d, idx){
                return {'volume':+d[vindex], 'day':weekdays[idx].weekday}
            })
            this._vdata = vdata

            // get y (volume) min and max
            var ymn = d3.min(vdata, function(d) { return d.volume; })
            var ymx = d3.max(vdata, function(d) { return d.volume; })

            console.log('volume range:', ymn, ymx)
            console.log('volume height:', height)            

            var x = d3.scaleLinear().range([0, width])
            var y = d3.scaleLinear().range([height, 0])

            x.domain(d3.extent(weekdays, function(d){
            	// console.log(d.weekday)
            	return d.weekday
            }))
            console.log('------')
			
			var ymxa = ymx+(ymx*.05)
			console.log('y range:', 0, ymxa)
            y.domain([0, ymxa])

            var xAxis = d3.axisBottom(x)
                  .tickSizeInner(-10)
                  .tickSizeOuter(0)
                  .tickPadding(5)
                  .tickFormat(function(d){
                        return formatAxisDates(weekday.invert(d))
                    });

            // console.log(width)
            var yAxis = d3.axisRight(y)
                .tickSizeInner(width)
                .tickSizeOuter(0)
                .tickPadding(15)
                .tickFormat(function(d) { 
                    return d; 
                })

            var rectBackground= vdata.map(function(d, i) {
            	// console.log(i, 'day', d.day, x(d.day))
            	// console.log(i, 'volume', d.volume, y(d.volume))
	            return (
	                <rect fill="#58657f" key={i}
	                      x={x(d.day)} y={height-y(d.volume)}
	                      height={y(d.volume)}
	                      width="3"/>
	            )
	        });

			return (
				<div>
					<svg id={this.props.chartId} 
						 width={this.props.width} 
						 height={this.state.height}>

						 {rectBackground}
                     </svg>
				</div>
			)
		}
	}
}

export default BarChart