import React from 'react'
import * as d3 from "d3";
import _ from 'underscore'
import merge from 'deepmerge'
import MultiChart from './MultiChart.jsx'

class SocketMultiChart extends React.Component {
	
	constructor(props){
		super(props)

		var scope = this;
		this.state = {
			height: 200,
			width: 800,
			chart_id: 'SocketMultiChart',
			data: {},
			info: {},
			positions: {}
		}

		setTimeout(function(){
			// IMPORTANT: To ensure we can properly merge (add/remove) our data streams we need to use unique data headers. Therefore we have to make use of dictionaries instead of arrays. When using arrays, index 0 will be overwritten with index 0 of the new stream. Even if it contains data of a new stream. This because it index name of key matches. We don't have this problem with dictionaries, the key will only be overwritten when the key has the same value. Example: Adding 2 streams, close + volume becomes {close, volume} with dictionaries while with arrays they would become [0] 
			var data1 = {
				dates:["02-17-2017", "02-21-2017", "02-22-2017", "02-23-2017", "02-24-2017"],
				data:{
					close: {
						stroke: 'red',
						chart:'line',
						entries:[10, 25, 30, 25, 10],
					},
					open: {
						stroke: 'blue',
						chart:'line',
						entries:[14, 20, 24, 24, 14],
					},
				}
			}
			scope.setState(merge(scope.state, data1))
			// console.log('state:', scope.state)
		}, 1000)

		setTimeout(function(){
			
			var data2 = {
				data:{
					volume: {
						stroke: 'blue',
						chart:'bar',
						entries:[4, 8, 10, 8, 4],
					}
				}
			}
			scope.setState(merge(scope.state, data2))
			// console.log('state:', scope.state)
		}, 2000)

		setTimeout(function(){
			var data3 = {
				info:{
					ytdmin:{
						line:'h',
						entry: 12
					},
					ytdmax:{
						line:'h',
						entry: 24
					}
				}
			}
			scope.setState(merge(scope.state, data3))
			// console.log('state:', scope.state)
		}, 3000)

		setTimeout(function(){
			var data4 = {
				positions:{
					test1:{
						dates: ["02-17-2017", "02-24-2017"],
						entries: [1, 0]
					}
				}
			}
			scope.setState(merge(scope.state, data4))
			// console.log('state:', scope.state)
		}, 4000)

		setTimeout(function(){
			var data5 = {
				positions:{
					test2:{
						dates: ["02-17-2017", "02-21-2017", "02-23-2017"],
						entries: [1, 0, 1]
					}
				}
			}
			scope.setState(merge(scope.state, data5))
			// console.log('state:', scope.state)
		}, 5000)
	}

	hasData(){
		if(Object.keys(this.state.data).length !== 0 
		&& this.state.data.constructor === Object){
			return true
		}

		if(Object.keys(this.state.info).length !== 0 
		&& this.state.info.constructor === Object){
			return true
		}

		if(Object.keys(this.state.positions).length !== 0 
		&& this.state.positions.constructor === Object){
			return true
		}

		return false
	}

	componentWillUpdate(nextProps, nextState){		
		// Before rendering... manipulate data here
		// console.log('componentWillUpdate')
		// console.log(Object.keys(this.state.data))

		// In case we are mixing a bar and line chart, I guess here is the best place to remap the bar values so they do not take up more then x% in Y.
	}

	render(){
		// console.log('render', this.state)
		if(!this.hasData()){
			return (
				<div>Loading...</div>
			)
		}else{
			return (
				<MultiChart data={this.state}/>
			)
		}	
	}
}

export default SocketMultiChart