import React from 'react';
import ReactDOM from 'react-dom';
import Q from 'q';

import theme from './stockgraph.css';
import {Tab, Tabs} from 'react-toolbox';

import MultiChart from './charts/MultiChart.jsx'

// import LineChart from './charts/LineChart.jsx'
// import BarChart from './charts/BarChart.jsx';
import ButtonGroup from './ui/ButtonGroup.jsx';
import RadioButtonGroup from './ui/RadioButtonGroup.jsx';

import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Dropdown from 'react-toolbox/lib/dropdown';

import SuccessButton from './components/SuccessButton.js';
// import AddPosition from './components/AddPosition.js';
// import StockAutoComplete from './components/StockAutoComplete.js'


// class RangeTabs extends React.Component {
// 	constructor (props){
// 		super(props);
// 		this.options = Object.keys(this.props.tabs)
// 		this.state = {
// 			index: 0
// 		}
// 	}	

// 	handleChange = (index) => {
// 		// console.log('handleTabChange', index)
// 		// console.log('options:', this.names)
// 		// console.log('selected:', this.options[index])
// 		this.setState({index});
// 		this.rangeChange(this.options[index])
// 	}

// 	rangeChange = (range) => {
// 		this.props.rangeChange(range)
// 	}

// 	render () {
// 		// console.log('render')		
// 		var tabs = this.options.map(function(d, i){
// 			// console.log(i, 'tab', d)
// 			return <Tab key={i} label={d}></Tab>
// 		})

// 		return (			
// 			<Tabs fixed index={this.state.index} onChange={this.handleChange}>
// 				{tabs}
// 			</Tabs>
// 		)
// 	}
// }

class StockGraph extends React.Component {
	constructor(props) {
		// console.log('props:', props)

		super(props);
		var scope = this;
		this.receivedData = this.receivedData.bind(this)
		// this.gotPositions = this.gotPositions.bind(this)

		this.state = {
			pdata:{},
			vdata:{},
			range: '1M',
			x: 0,			

			// add position
			active: false,
			action: null,
			date: null,
			value: null,
			quantity: null
		}
		
		// this.memory = {
		// 	data:{},
		// 	range:'1Y'
		// }
		this.time_range = {
			'1M': 20,
			'3M': 60,
			'6M': 120,
			'1Y': 260,
			'2Y': 540,
			'3Y': 800,
			'5Y': 1300,
			'10Y': 2600
		}

		this.props.socket.on('stock:get_ticker_data', this.receivedData)
		// this.props.socket.on('stock:get_ticker_positions', this.gotPositions)
	};
	

	requestData(display_layer, range){
		console.log('requestData')
		var scope = this;
		var query = {}
		query['symbol'] = this.props.symbol;
		query['indicators'] = display_layer;
		query['duration'] = this.time_range[range];

		console.log('\tquery:', query)

		this.props.socket.emit('stock:get_ticker_data', query);
	}
	receivedData(data){
		if(this.props.symbol != data.stock){
			return
		}
		// console.log('receivedData', data)

		if(data.hasOwnProperty('error')){
			console.warn('No data available for', this.props.symbol)
		}else{
			var jdata = JSON.parse(data.stock_data);
			// console.log('data', jdata)


			// split the data into price and volume			
			// volume data
			var vdata = {
				dates:jdata.dates,
				data: {}
			}
			Object.keys(jdata.data).map(function(d, i){
				console.log(i, d)
				if(d == 'volume'){
					vdata.data[d] = jdata.data[d]
				}
			})
			// price data
			var pdata = {
				dates:jdata.dates,
				data: {}
			}
			Object.keys(jdata.data).map(function(d, i){
				// console.log(i, d)
				if(d != 'volume'){
					pdata.data[d] = jdata.data[d]
				}
			})

			// console.log('price data:', pdata)
			// console.log('volume data:', vdata)
			this.setState({vdata:vdata, pdata:pdata})
		}
	}

	// gotPositions(data){		
	// 	if(this.props.symbol != data.stock){
	// 		return
	// 	}
	// 	// console.log('got', data.user, 'stock:get_ticker_positions back', data)
	// 	if(data.hasOwnProperty('error')){
	// 		console.warn('No data available for', this.props.symbol)
	// 	}else{
	// 		var object = {}
	// 		object[data.user] = data.stock_data
	// 		this.setState(object)
	// 	}
	// }

	// getPositions(user){
	// 	if(user == undefined){
	// 		user = 'positions'
	// 	}
	// 	// console.log('getPositions', user)

	// 	var scope = this;
	// 	var query = {}
	// 	query['symbol'] = this.props.symbol;
	// 	query['user'] = user;
	// 	this.props.socket.emit('stock:get_ticker_positions', query)
	// }

	componentDidMount(){
		console.log('componentDidMount', this.props.display_layer, this.props.range)
		this.requestData(this.props.display_layer, this.props.range)
		// this.getPositions('positions')
		// this.getPositions('me')
	}

	componentWillReceiveProps(nextProps){
		console.log('componentWillReceiveProps', nextProps.display_layer, nextProps.range)
		this.requestData(nextProps.display_layer, nextProps.range)
	}

	componentWillUnmount(){
		this.props.socket.removeListener('stock:get_ticker_data', this.receivedData);
		this.props.socket.removeListener('stock:get_ticker_positions', this.gotPositions);
	}

	setOverlay(visiblity){
		// console.log('setOverlay', visiblity)
		this.setState({display:visiblity})
	}

	handleDialogToggle = () => {
		// console.log('handleDialogToggle')

		this.setState({active: !this.state.active});
  	}

  	handleDialogAdd = () => {
		// console.log('handleDialogAdd')

		var datestring = ("0" + this.state.date.getDate()).slice(-2) + "-" + ("0"+(this.state.date.getMonth()+1)).slice(-2) + "-" +
    	this.state.date.getFullYear()

		var result = {
			ticker: this.props.symbol,
			date: datestring,
			quantity: this.state.quantity,
			price: this.state.value,
			signal: this.state.action
		}
		this.props.socket.emit('stock:add_position', result);

		// reset
		this.setState({'end_date': null, 'start_date': null})
		this.handleDialogToggle()
  	}
		
	dialogActions = [
		{ label: "Cancel", onClick: this.handleDialogToggle },
		{ label: "Add", onClick: this.handleDialogAdd }
	]

	handleChange = (item, value) => {
		// console.log('handleChange')
		this.setState({...this.state, [item]: value});
	}

	rangeChange = (item) => {
		// console.log('rangeChange', item)
	}
	
	onMouseMove = (x, source) => {
		// console.log('onMouseMove', x, source)
		this.setState({'x':x})
	}

	render(){
		// console.log('render', this.props.width)	
		// console.log('data:', this.state.data)
		// console.log('render', this.props.display_layer)
		var scope = this;
		var priceChart = function(){
			// console.log('priceChart', scope.state.pdata)
			if(Object.keys(scope.state.pdata).length > 0){
				if(Object.keys(scope.state.pdata.data).length > 0){
					// console.log('creating price chart')
					return <MultiChart 
							chart_id={'price'}
							width={scope.props.width}
							height={scope.props.width/4}
							range={scope.props.range}
							gridPricePrefix={'$'}
							visibility={scope.props.display_layer}
							onMouseMove={scope.onMouseMove}
							mousePosition={scope.state.x}
							data={scope.state.pdata}/>
				}
			}
		}

		var volumeChart = function(){
			// console.log('priceChart', scope.state.vdata)
			if(Object.keys(scope.state.vdata).length > 0){
				if(Object.keys(scope.state.vdata.data).length > 0){
					// console.log('creating volume chart')
					return <MultiChart 
							chart_id={'volume'}
							width={scope.props.width}
							height={scope.props.width/6} 
							range={scope.props.range}
							visibility={scope.props.display_layer}
							gridPricePrefix={''}
							onMouseMove={scope.onMouseMove}
							mousePosition={scope.state.x}
							y_min={0}
							data={scope.state.vdata}/>
				}
			}	
		}

		return (
			<div className={theme['stock_item_g']}>
				{priceChart()}
				{volumeChart()}
			</div>
		)
	}

}

export default StockGraph;