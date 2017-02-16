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

		// TODO: this doesn't get properly distroyed when closing the item.
		// Therefore every time we open up the item a new call is added (doubling up every time)
		this.props.socket.on('stock:get_ticker_data', (data) => {
			// console.log('got stock:get_ticker_data back:', data)
			if(scope.props.symbol != data.stock){
				return
			}

			if(data.hasOwnProperty('error')){
				console.warn('No data available for', scope.props.symbol)
			}else{
				var jdata = JSON.parse(data.stock_data);
				// this.setState({data:jdata})
				this.memory.data = jdata
				this.setRange()
			}        	
		})

		this.props.socket.on('stock:get_ticker_positions', (data) => {
			// console.log('got', data.user, 'stock:get_ticker_positions back', data)			
			if(scope.props.symbol != data.stock){
				return
			}

			if(data.hasOwnProperty('error')){
				console.warn('No data available for', scope.props.symbol)
			}else{
				// console.log('Setting data for', scope.props.symbol)
				var object = {}
				object[data.user] = data.stock_data
				// deferred.resolve();
				this.setState(object)
			}
		})
	};
	
	getData(){
		console.log('getData')

		var scope = this;
		var query = {}
		query['symbol'] = this.props.symbol;
		query['indicators'] = ['price'];
		query['duration'] = 'month';

		this.props.socket.emit('stock:get_ticker_data', query);

		// NOTE: make sure we only ever listen once... otherwise we're going
		// to create a new one every time we click on stockItem. 
		// THOUGHT: might be better to see whether or not is already exists as
		// we might require to query additional data 
		// this.props.socket.once('stock:get_ticker_data', (data) => {
		// 	console.log('got stock:get_ticker_data back:', data)

		// 	if(data.hasOwnProperty('error')){
		// 		console.warn('No data available for', scope.props.symbol)
		// 	}else{
		// 		var jdata = JSON.parse(data.stock_data);
		// 		this.setState({data:jdata})        	
		// 		this.memory.data = jdata
		// 	}        	
		// })
	}

	getPositions(user){
		// var deferred = Q.defer();

		// user can currently be me or positions
		if(user == undefined){
			user = 'positions'
		}
		console.log('getPositions', user)

		var scope = this;
		var query = {}
		query['symbol'] = this.props.symbol;
		query['user'] = user;
		this.props.socket.emit('stock:get_ticker_positions', query)

		// this.props.socket.once('stock:get_ticker_positions', (data) => {
		// 	console.log('got', user, 'stock:get_ticker_positions back', data)
			
		// 	if(data.hasOwnProperty('error')){
		// 		console.warn('No data available for', scope.props.symbol)
		// 	}else{
		// 		console.log('Setting data for', scope.props.symbol)
		// 		var object = {}
		// 		object[user] = data.stock_data
		// 		// deferred.resolve();
		// 		this.setState(object)
		// 	}
		// })
		// return deferred.promise;
	}

	componentDidMount(){
		var scope = this;

		this.getData()
		this.getPositions('positions')
		// .then(function(){
			scope.getPositions('me')	
		// })
		
	}

	setRange(range){
		// console.log('setRange', range)

		if(range == undefined){
			range = '1Y'
		}

		var days = 1
		switch(range){
			case '1M': days = 20; break;
			case '3M': days = 65; break;
			case '6M': days = 130; break;
			case '1Y': days = 260; break;
			case '2Y': days = 540; break;
			case '3Y': days = 800; break;
			case '5Y': days = 1300; break;
			case '10Y': days = 2600; break;
		}
		// console.log('ndays:', days)

		// console.log(this.memory.data)
		var slice = this.memory.data.data.data.slice(Math.max(this.memory.data.data.data.length - days, 1))
		// console.log(slice)

		var data_to_set = {
			'info': this.memory.data.info,
			'data': {
				'data': slice,
				'structure': this.memory.data.data.structure
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
		// console.log("render", this.state.me)

		var range_options = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '10Y']
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