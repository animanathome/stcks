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

class StockGraph extends React.Component {
	constructor(props) {
		// console.log('props:', props)

		super(props);
		var scope = this;
		this.receivedData = this.receivedData.bind(this)
		// this.gotPositions = this.gotPositions.bind(this)

		this.state = {
			// price data
			pdata:{}, 

			// volume data
			vdata:{},
			
			// time range - time period the data covers
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

		// Since display layer is a flat list we need to ensure each data point has a unique name throughout. This also means that we'll need to be able to deduce its function based on the name. Ideally we should pass an object here which properly discribes each data point individually. This will ensure scalability and make the data less enigmatic.
		query['indicators'] = display_layer;
		query['duration'] = this.time_range[range];

		// console.log('\tquery:', query)

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
				// console.log(i, d)
				if(d == 'volume'){
					vdata.data[d] = jdata.data[d]
				}
			})
			// price data
			var pdata = {
				dates:jdata.dates,
				data: {},
				positions: {}
			}
			Object.keys(jdata.data).map(function(d, i){
				// console.log(i, d)
				if(d != 'volume'){
					pdata.data[d] = jdata.data[d]
				}
			})

			if(jdata.hasOwnProperty('positions')){				
				Object.keys(jdata.positions).map(function(d, i){
					pdata.positions[d] = jdata.positions[d]
				})
			}

			// console.log('price data:', pdata)
			// console.log('volume data:', vdata)
			this.setState({vdata:vdata, pdata:pdata})
		}
	}

	componentDidMount(){
		// console.log('componentDidMount', this.props.display_layer, this.props.range)
		this.requestData(this.props.display_layer, this.props.range)
	}

	componentWillReceiveProps(nextProps){
		// console.log('componentWillReceiveProps', nextProps.display_layer, nextProps.range)
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