import React from 'react';
import ReactDOM from 'react-dom';
import Q from 'q';

import theme from './stockgraph.css';
import {Tab, Tabs} from 'react-toolbox';

import LineChart from './charts/LineChart.jsx'
import ButtonGroup from './ui/ButtonGroup.jsx';
import RadioButtonGroup from './ui/RadioButtonGroup.jsx';

import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Dropdown from 'react-toolbox/lib/dropdown';

import SuccessButton from './components/SuccessButton.js';
// import AddPosition from './components/AddPosition.js';
// import StockAutoComplete from './components/StockAutoComplete.js'

class StockGraph extends React.Component {
	constructor(props) {
		super(props);
		var scope = this;
		this.gotData = this.gotData.bind(this)
		this.gotPositions = this.gotPositions.bind(this)

		this.state = {
			data:[],
			positions:{},
			me:{},
			display:{
				'SMA20': false,
				'SMA50': false,
				'SMA200': false
			},
			
			// add position
			active: false,
			action: null,
			date: null,
			value: null,
			quantity: null
		}
		
		this.memory = {
			data:{},
			range:'1Y',
			indicators:['SMA20', 'SMA50', 'SMA200']
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
		this.props.socket.on('stock:get_ticker_positions', this.gotPositions)
	};
	
	gotData(data){		
		if(this.props.symbol != data.stock){
			return
		}
		// console.log('gotData', data)

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
		query['indicators'] = ['price'];
		query['duration'] = 'month';

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
		// console.log('setRange', range)
		if(range == undefined){
			range = '1Y'
		}
		var days = this.time_range[range]
		// console.log(this.memory)
		var slice = this.memory.data.data.slice(Math.max(this.memory.data.data.length - days, 1))
		// console.log(slice)
		// console.log('structure:', this.memory.data.structure)

		var data_to_set = {
			'info': this.memory.data.info,
			'data': {
				'data': slice,
				'structure': this.memory.data.structure
			}
		}
		this.setState({data:data_to_set, 'range':range})
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

	stockActions = [
		{value:'open', label:'Open Position'},
		{value:'close', label:'Close Position'}
	]
	

	render(){
		// console.log("render", this.state)
		var range_options = ['1M', '3M', '6M', '1Y', '3Y', '5Y', '10Y']
		var indicator_options = [
			// 'BB', 'EMA', 'KC', 'MAE', 'PSAR', 'PC', 
			'SMA20', 'SMA50', 'SMA200'
		]

		return (
			<div className={theme['stock_item_g']}>
				<Tabs index={this.state.index} onChange={this.handleTabChange}>
				</Tabs>
				<LineChart width={this.props.width} 
						   display={this.state.display} 
						   info={this.props.info}
						   positions={this.state.positions} 
						   range={this.state.range}
						   me={this.state.me} 
						   data={this.state.data} 
						   chartId={this.props.symbol+'_chartId'}/>
				
				<div className={theme['stock_item_menu']}>
					<div className={theme['stock_item_rng']}>
						<RadioButtonGroup activeIndex={3}
										  callback={this.setRange.bind(this)}
										  clickables={range_options}/>
					</div>

					<div className={theme['stock_item_ind']}>
						<ButtonGroup 
							callback={this.setOverlay.bind(this)} 
							clickables={indicator_options}/>
					</div>

					<div className={theme['stock_item_add']}>
						<SuccessButton 
							onClick={this.handleDialogToggle} 
							icon='add' floating accent mini />
						<Dialog
							actions={this.dialogActions}
							active={this.state.active}
							onEscKeyDown={this.handleDialogToggle.bind(this)}
							onOverlayClick={this.handleDialogToggle.bind(this)}
							title={'Add '+this.props.symbol+' Position'}>
							<Dropdown
        						auto
        						label='Position'
        						onChange={this.handleChange.bind(this, 'action')}
        						source= {this.stockActions}
        						value={this.state.action}
      						/>
							<DatePicker 
								label='Date' sundayFirstDayOfWeek 
								onChange={this.handleChange.bind(this, 'date')} 
								value={this.state.date} />
							<Input 
								type='number' 
								label='Value' 
								name='value' 
								value={this.state.value} 
								onChange={this.handleChange.bind(this, 'value')} 
								/>
							<Input 
								type='number' 
								label='Quantity' 
								name='quantity' 
								value={this.state.quantity} 
								onChange={this.handleChange.bind(this, 'quantity')} 
								/>
						</Dialog>
					</div>
				</div>
			</div>

		)
	}

}

export default StockGraph;