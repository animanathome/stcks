import React from 'react';
import ReactDOM from 'react-dom';
import Q from 'q';

import theme from './stockgraph.css';
import {Tab, Tabs} from 'react-toolbox';

import LineChart from './charts/LineChart.jsx'
import BarChart from './charts/BarChart.jsx';
import ButtonGroup from './ui/ButtonGroup.jsx';
import RadioButtonGroup from './ui/RadioButtonGroup.jsx';

import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Dropdown from 'react-toolbox/lib/dropdown';

import SuccessButton from './components/SuccessButton.js';
// import AddPosition from './components/AddPosition.js';
// import StockAutoComplete from './components/StockAutoComplete.js'


class DurationTabs extends React.Component {
	constructor (props){
		super(props);
		this.names = props.tabs;
		this.state = {
			index: 1
		}
	};	

	handleTabChange = (index) => {
		console.log('handleTabChange', index)
		console.log('selected', this.names[index])
		this.setState({index});
	};

	render () {
		// console.log('render')
		var tabs = Object.keys(this.props.tabs).map(function(d, i){
			// console.log(i, 'tab', d)
			return <Tab key={i} label={d}></Tab>
		})

		return (			
			<Tabs fixed index={this.state.index} onChange={this.handleTabChange}>
				{tabs}
			</Tabs>
		)
	}
}

class StockGraph extends React.Component {
	constructor(props) {
		console.log('props:', props)

		super(props);
		var scope = this;
		this.gotData = this.gotData.bind(this)
		this.gotPositions = this.gotPositions.bind(this)

		this.state = {
			data:[],

			// add position
			active: false,
			action: null,
			date: null,
			value: null,
			quantity: null
		}
		
		this.memory = {
			data:{},
			range:'1Y'
		}
		this.time_range = {
			'1M': 20,
			'3M': 65,
			'6M': 130,
			'1Y': 260,
			'2Y': 540,
			'3Y': 800,
			'5Y': 1300,
			'10Y': 2600
		}

		this.props.socket.on('stock:get_ticker_data', this.gotData)
		// this.props.socket.on('stock:get_ticker_positions', this.gotPositions)
	};
	
	gotData(data){
		if(this.props.symbol != data.stock){
			return
		}
		console.log('gotData', data)

		if(data.hasOwnProperty('error')){
			console.warn('No data available for', this.props.symbol)
		}else{
			var jdata = JSON.parse(data.stock_data);
			// this.setState({data:jdata})
			this.memory.data = jdata
			this.setRange()
		}
	}

	getData(){
		// console.log('getData')
		var scope = this;
		var query = {}
		query['symbol'] = this.props.symbol;
		query['indicators'] = this.props.display_info;
		query['duration'] = this.time_range['3M'];

		this.props.socket.emit('stock:get_ticker_data', query);
	}

	gotPositions(data){		
		if(this.props.symbol != data.stock){
			return
		}
		// console.log('got', data.user, 'stock:get_ticker_positions back', data)
		if(data.hasOwnProperty('error')){
			console.warn('No data available for', this.props.symbol)
		}else{
			var object = {}
			object[data.user] = data.stock_data
			this.setState(object)
		}
	}

	getPositions(user){
		if(user == undefined){
			user = 'positions'
		}
		// console.log('getPositions', user)

		var scope = this;
		var query = {}
		query['symbol'] = this.props.symbol;
		query['user'] = user;
		this.props.socket.emit('stock:get_ticker_positions', query)
	}

	componentDidMount(){
		this.getData()
		this.getPositions('positions')
		this.getPositions('me')	
	}

	componentWillUnmount(){
		this.props.socket.removeListener('stock:get_ticker_data', this.gotData);
		this.props.socket.removeListener('stock:get_ticker_positions', this.gotPositions);
	}

	setRange(range){
		console.log('setRange', range)
		// if(range == undefined){
		// 	range = '1Y'
		// }
		// var days = this.time_range[range]
		// console.log('memory:', this.memory)
		// var slice = this.memory.data.data.slice(Math.max(this.memory.data.data.length - days, 1))
		// // console.log(slice)
		// // console.log('structure:', this.memory.data.structure)

		// var data_to_set = {
		// 	'info': this.memory.data.info,
		// 	'data': {
		// 		'data': slice,
		// 		'structure': this.memory.data.structure
		// 	}
		// }
		// this.setState({data:data_to_set, 'range':range})
	}

	setOverlay(visiblity){
		// console.log('setOverlay', visiblity)
		this.setState({display:visiblity})
	}

	handleDialogToggle = () => {
		console.log('handleDialogToggle')

		this.setState({active: !this.state.active});
  	}

  	handleDialogAdd = () => {
		console.log('handleDialogAdd')

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
	
	render(){
		console.log('render')
		return (
			<div className={theme['stock_item_g']}>
				<DurationTabs tabs={this.time_range}/>
			</div>
		)
	}

}

export default StockGraph;