import React from 'react'
import * as d3 from "d3"
import _ from 'underscore'
import merge from 'deepmerge'

import Positions from '../utils/Positions.jsx'

import GridDates from './GridDates.jsx'
import GridPrices from './GridPrices.jsx'
import BarChart from './BarChart.jsx'
import LineChart from './LineChart.jsx'
import HInfoLine from './HInfoLine.jsx'
import VInfoLine from './VInfoLine.jsx'
import AnnotateValue from './AnnotateValue.jsx'
import PositionChart from './PositionChart.jsx'
import Legend from './Legend.jsx'

class MultiChart extends React.Component {
	constructor(props){
		super(props)
		// console.log('init', props)
		this.state = {
			height: 300,
			width: 800,
			chart_id: 'MultiChartNew',
			selection:{
				x:0
			},
			visibility:{},
			dates:{},
			data:{},
			info:{},
			positions:{},
			range: null,
			
			onMouseMove: null
		}
		this.init = false
		this.formatAxisDates = undefined
		this.x = undefined
		this.y = undefined
		this.dates = undefined
		this.dates_range = undefined
		this.y_min = Infinity
		this.y_max = -Infinity
		this.y_min_offset = 1.1
		this.y_max_offset = 0.9

		this.processProps(props, true)
	}

	mouseEnter(e){
        // this.setState({visibility:{info:true}})
        this.setState({visibility:merge(this.state.visibility, {info:true})})
        // console.log('mouseEnter', this.state)
    }

    mouseLeave(e){        
        // this.setState({visibility:{info:false}})
        this.setState({visibility:merge(this.state.visibility, {info:false})})
        // console.log('mouseLeave', this.state)
    }

    mouseMove(e){
    	if(this.x === undefined || this.dates_range === undefined){
    		return
    	}

        var eachBand = this.x.step();
        var bandWidth = this.x.bandwidth()/2
		var index = Math.round(((e.clientX - bandWidth) / eachBand));
		if(index > this.dates_range.length){
			index = this.dates_range.length
		}
		if(index < 1){
			index = 1
		}
        // console.log('mouseMove', e.clientX, index)
        
        // if a onMouseMove method defined then the index is set by the parent component
        if(this.props.onMouseMove !== null){
        	this.props.onMouseMove(index-1, this.state.chart_id)
        }else{
        	this.setState({selection:{x:index-1}})
        }
    }

    processProps(props, on_init){
    	var scope = this;

    	if(on_init === undefined){
    		on_init = false;
    	}

    	if(props.hasOwnProperty('chart_id')){
    		this.state.chart_id = props.chart_id
    	}

    	// console.log('processProps', props, on_init)
    	var updated_range = false;  	
    	var updated_dimensions = false;
		if(props.hasOwnProperty('width')){
			if(props.width != this.state.width){
				updated_dimensions = true;
				if(on_init){
					this.state.width = props.width
					this.state.height = props.height
				}else{				
					this.setState({'width': props.width, 'height':props.height})
				}
			}
		}		
		// console.log(this.state.width, this.state.height)

    	var margin = {top: 20, right: 50, bottom: 20, left: 5},
			width = this.state.width - (margin.left + margin.right),
			height = this.state.height - (margin.top + margin.bottom);

		// Range
		// console.log('range', this.props.range)
		if(on_init){
			this.state.range = this.props.range
		}else{
			if(this.state.range != this.props.range){
				this.setState({range:this.props.range})
				updated_range = true;
			}
		}

    	// Dates
    	// NOTE: in case the dates length is different we should properly delete all other data (since merging them will properly make our data invalid)  
    	if(props.data.hasOwnProperty('dates')){
    		if(this.state.dates.length !== props.data.dates.length || updated_range){
    			updated_range = true;
    			// console.log('old range:', this.state.dates.length)
    			// console.log('new range:', props.data.dates.length)

				if(props.data.dates.length < 60){
					this.formatAxisDates = d3.timeFormat("%e %b");
				}else{
					this.formatAxisDates = d3.timeFormat("%b %Y");
				}
    			
    			// console.log("updating dates")
		        var weekdays = props.data.dates.map(function(d, idx){
		            return {
		                'date':scope.formatAxisDates(new Date(d)),
		                'weekday':idx
		            }
		        })
		        if(on_init || Object.keys(this.state.dates).length == 0 || updated_range){
					this.state.dates = weekdays
				}else{				
					this.setState({dates:weekdays})
				}

				this.x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        		var weekday_range = weekdays.map(function(d){
        			return d.weekday
        		})
        		// console.log('weekday_range', weekday_range)
        		var weekday_dates = weekdays.map(function(d){
        			return d.date
        		})
				this.x.domain(weekday_range)
				this.x_min = weekday_range[0]
				this.x_max = weekday_range[weekday_range.length-1]
				this.dates = weekday_dates
				this.dates_range = weekday_range
				this.init = true;

				// console.log('state:', this.state.dates)
    		}    		
    	}else{
    		console.warn('props does not contain any dates', props.data)
    	}

    	if(updated_dimensions){
    		console.log('updating x')
    		if(this.x !== undefined){
    			this.x.rangeRound([0, width])
    		}
    	}

    	// Data
    	if(props.data.hasOwnProperty('data')){
    		var s_data = Object.keys(this.state.data)
			var p_data = Object.keys(props.data.data)
			if(updated_range || s_data !== p_data){
				var data = {}
				var visibility = {}

				if(updated_range){
					p_data.map(function(d, idx){
						// console.log(props.data.data[d])
						data[d] = {
							'stroke':props.data.data[d].stroke,
							'name':props.data.data[d].name,
							'abbr':props.data.data[d].abbr,
							'type':props.data.data[d].chart,
							'data':props.data.data[d].entries.map(function(e, edx){
								// console.log('\t', edx, e, scope.state.dates[edx])
								if(scope.y_min > e) scope.y_min = e
								if(scope.y_max < e) scope.y_max = e

								return {'value': e, 'day': scope.state.dates[edx].weekday}
							})
						}
						visibility[d] = true;
					})
				}
				else if(s_data !== p_data){
					// console.log("updating data")
					// console.log('s:', s_data)
					// console.log('p:', p_data)
					// console.log("adding", _.difference(p_data, s_data))
					_.difference(p_data, s_data).map(function(d, idx){
						// console.log(props.data.data[d])
						data[d] = {
							'stroke':props.data.data[d].stroke,
							'name':props.data.data[d].name,
							'abbr':props.data.data[d].abbr,
							'type':props.data.data[d].chart,
							'data':props.data.data[d].entries.map(function(e, edx){
								// console.log('\t', edx, e, scope.state.dates[edx])
								if(scope.y_min > e) scope.y_min = e
								if(scope.y_max < e) scope.y_max = e

								return {'value': e, 'day': scope.state.dates[edx].weekday}
							})
						}
						visibility[d] = true;
					})
				}

				var merged_data = merge(this.state.data, data)
				var merged_visibility = merge(this.state.visibility, visibility)
				if(on_init){
					this.state.data = merged_data
					this.state.visibility = merged_visibility
				}else{				
					this.setState({'data':merged_data, 'visibility': merged_visibility})
				}
				// console.log('data:', Object.keys(merged_data))

				// default to y = 0
				if(this.props.hasOwnProperty('y_min')){					
					this.y_min = this.props.y_min
				}
				this.y = d3.scaleLinear()
							.rangeRound([height, 0])
							.domain([this.y_min - (this.y_min * .015), this.y_max + (this.y_max * .015)])
				this.y_range = (this.y_max + (this.y_max * .015)) - (this.y_min - (this.y_min * .015))
				this.z = d3.scaleOrdinal(d3.schemeCategory10)
						.domain(Object.keys(merged_data))
			}
		}

		// Info
		if(props.data.hasOwnProperty('info')){
			var s_data = Object.keys(this.state.info)
			var p_data = Object.keys(props.data.info)
			if(p_data.length > 0){
				var data = props.data.info
				// console.log('got info', s_data)
				if(on_init){
					this.state.info = data
				}else{				
					this.setState({'info':merge(this.state.info, data)})
				}
			}
		}

		// Positions
		if(props.data.hasOwnProperty('positions')){
			var s_data = Object.keys(this.state.positions)
			var p_data = Object.keys(props.data.positions)

			var positions = {}
			var data = props.data.positions
			if(updated_range){
				p_data.map(function(d, idx){
					positions[d] = data[d].map(function(e, edx){
						// console.log('\t', edx, e, scope.state.dates[edx])
						return {'defined': e, 'day': scope.state.dates[edx].weekday}
					})
					visibility[d] = true;
				})

			}else if(s_data !== p_data){
				// console.log('got positions', s_data)
				// console.log('position data', data)
				_.difference(p_data, s_data).map(function(d, i){
					positions[d] = data[d].map(function(e, edx){
						// console.log('\t', edx, e, scope.state.dates[edx])
						return {'defined': e, 'day': scope.state.dates[edx].weekday}
					})
					visibility[d] = true;
				})

			}
			// console.log('positions:', positions)
			if(on_init){
				this.state.positions = positions
			}else{
				// console.log('merging:', this.state.positions, 'with', positions)
				// console.log('result:', merge(this.state.positions, positions))
				this.setState({'positions':merge(this.state.positions, positions)})
			}
			// console.log('state:', this.state)
		}
				
		// Visibility
		if(props.visibility){
			// console.log('visibility')
			// console.log('\tprops:', props.visibility)
			// console.log('\tstate:', Object.keys(this.state.visibility))

			// add missing data points
			var visibility = this.state.visibility
			props.visibility.map(function(d){
				if(!visibility.hasOwnProperty(d)){
					visibility[d] = true
				}
			})

			Object.keys(visibility).map(function(d, i){
				if(props.visibility.indexOf(d) == -1){
					// console.log('hiding', d)
					visibility[d] = false;
				}else{
					visibility[d] = true;
				}
				// console.log('\t', i, d, visibility[d])
			})
			// console.log('\tresult:', visibility)
			if(on_init){
				this.state.visibility = visibility
			}else{
				this.setState({'visibility':visibility})
			}
		}

		if(!on_init){
			this.setState({selection:{x:this.props.mousePosition}})
		}

		// console.log('state:', this.state)
    }

	componentWillReceiveProps(nextProps){
		// console.log('componentWillReceiveProps')//, this.state, nextProps)

		// console.log('cstate:', Object.keys(this.state.data).length)
		// console.log('nstate:', Object.keys(nextProps.data).length)
		this.processProps(nextProps)
	}

	render(){
		console.log('render', this.state)
		// console.log('cstate:', Object.keys(this.state.data).length)		
		var scope = this;

		var margin = {top: 20, right: 60, bottom: 20, left: 5},
			width = this.state.width - (margin.left + margin.right),
			height = this.state.height - (margin.top + margin.bottom);

		// console.log('render', this.state.width, this.state.height)

		var transform='translate(' + margin.left + ',' + margin.top + ')';

		var data = Object.keys(this.state.data)
		var buildGraphs = data.map(function(d, i){
			// console.log(i, d)
			// console.log(scope.z(d))

			// console.log(i, scope.state.data[d], scope.state.data[d].type, scope.state.data[d].data)
        	if(scope.state.visibility[d]){
	        	if(scope.state.data[d].type == 'bar'){
		        	// console.log('-> bar')
	        		return <BarChart 
	        					key={i} 
	        					x={scope.x} 
	        					y={scope.y} 
	        					height={height} 
	        					data={scope.state.data[d].data}/>
	        		
	        	}else{
	        		// console.log('-> line')
	        		return <LineChart 
	        					key={i} 
	        					x={scope.x} 
	        					y={scope.y} 
	        					stroke={scope.z(d)} 
	        					data={scope.state.data[d].data}/>
	        	}
        	}
        })
        var buildAnnotations = data.map(function(d, i){
        	var tdata = scope.state.data[d]
        	// console.log('annotation', i, tdata.type, tdata.data[tdata.data.length-1].value)
        	// var entry = scope.state.data.data[scope.state.data.data.length-1]
        	if(tdata.type == 'line'){
        		var entry = tdata.data[tdata.data.length-1].value
        	// 	// console.log(i, d.data[d.data.length-1])
        		return <AnnotateValue key={i} x={scope.x} y={scope.y} xp={scope.x_max} yp={entry}/>
        	}
        })

        var info = Object.keys(this.state.info)
        var buildInfo = info.map(function(d, i){
        	// console.log(i, d, scope.state.info[d].line, scope.state.info[d].entry)
        	if(scope.state.info[d].line == 'h'){
				return <HInfoLine key={i} x={scope.x} y={scope.y} yp={scope.state.info[d].entry} xr={[scope.x_min, scope.x_max]}/>
        	}
        })

        var positions = Object.keys(this.state.positions)
        var buidPositions = positions.map(function(d, i){
        	console.log('position', i, d)
        	if(scope.state.visibility['position_'+d]){
        		return <PositionChart name={d} key={i} x={scope.x} height={height} data={scope.state.positions[d]}/>
        	}
        })

		const show_grid_prices = this.state.visibility.grid_prices;
		const show_grid_dates = this.state.visibility.grid_dates;
		const show_legend = this.state.visibility.info;
		const show_annotations = this.state.visibility.annotations;
		
		// automatically scaling svg's
		// http://stackoverflow.com/questions/9400615/whats-the-best-way-to-make-a-d3-js-visualisation-layout-responsive
		if(this.init){			
			return (
				<div onMouseEnter={this.mouseEnter.bind(this)} 
	    			 onMouseMove={this.mouseMove.bind(this)} 
	    			 onMouseLeave={this.mouseLeave.bind(this)}>
	    			<svg id={this.state.chart_id}
	    				 viewBox={"0 0 "+this.state.width+" "+this.state.height}
						 width={'100%'} 
						 height={'100%'}>
						 <g transform={transform}>

						 	
							{show_grid_dates && 
								<GridDates height={height} 
								 	   	   axis={this.x} 
								 	   	   dates={this.state.dates}/>
							}
							

							{show_grid_prices &&
								<GridPrices height={height} 
											prefix={this.props.gridPricePrefix}
								 	   		width={width}
								 	   		axis={this.y}/>
							}

							{buidPositions}
							{buildGraphs}
							{buildInfo}
							{show_annotations && buildAnnotations}

							{show_legend &&
								<Legend width={120} 
									x={this.x(this.state.selection.x)+this.x.bandwidth()/2} 
									z={this.z}
									dataIndex={this.state.selection.x} 
									dates={this.dates}
									data={this.state.data}/>								
							}

							{show_legend &&
								<VInfoLine 
									x={this.x(this.state.selection.x)+this.x.bandwidth()/2}
									y={height}/>
							}
						 </g>
					</svg>
				</div>
			)
		}else{
			return (
				<div>
				loading...
				</div>
			)
		}
	}
}

export default MultiChart