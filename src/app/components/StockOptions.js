import React from 'react';
import _ from 'underscore'
import { Checkbox } from 'react-toolbox';

class Category extends React.Component {
	constructor(props){
		super(props)

		this.active = []
		this.processData(props)
		this.parent = props.parent
	}

	handleChange = (field, value) => {
		console.log('handleChange', field, value)
    	this.setState({...this.state, [field]: value});
    	this.processActive(field, value);
  	};

	processData(props){
		// console.log('processData', props)
		var scope = this;
		this.state = {}
		Object.keys(props.data).map(function(d, i){
			// console.log('->', d, props.data[d].visibility)
			scope.state[d] = Boolean(props.data[d].visibility)
		})
		// console.log('result:', this.state)
	}

	processTitle(string){
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	processActive(field, value){
		// console.log('processActive', field, value)

		var index = this.active.indexOf(field)
		// console.log('index', index)
		if(value){
    		if(index == -1){
				// console.log('add', field)
    			this.active.push(field)
    		}
    	}else{
    		if(index != -1){
    			// console.log('remove', field)
    			this.active.splice(index, 1)
    		}
    	}
    	// console.log('active:', this.active)
    	this.props.onChange(this.active)
	}

	render(){
		// console.log('render', this.props.data)
		var scope = this;
		var build = Object.keys(this.props.data).map(function(d, i){
			// console.log(i, scope.props.data[d].name)
			return <Checkbox
				key = {i}
				checked={scope.state[d]}
				label={scope.props.data[d].name}
				onChange={scope.handleChange.bind(scope, d)}/>
		})

		return (
			<div>
				<p>{this.processTitle(this.props.name)}</p>
				{build}
			</div>
		)
	}
}

class StockOptions extends React.Component {
	constructor(props){
		super(props);

		this.active = []
		this.state = {
			'base':{
				'close': {
					visibility: 1,
					name: 'Closing Price'
				}
			},
			'overlap':{
				'os_sma_20': {
					visibility: 0,
					name: 'Simple Moving Average 20D'
				},
				'os_sma_50': {
					visibility: 0,
					name: 'Simple Moving Average 50D'
				},
				'os_sma_200': {
					visibility: 0,
					name: 'Simple Moving Average 200D'
				},
				'os_bbu_20': {
					visibility: 0,
					name: 'Bollinger Bands'
				},
				'os_dema_20': {
					visibility: 0,
					name: 'Double Exponential Moving Average 20D'
				},
				'os_ema_20': {
					visibility: 0,
					name: 'Exponential Moving Average 20D'
				},
				'os_mp_14': {
					visibility: 0,
					name: 'Midpoint Over Period'
				},
				'os_sar': {
					visibility: 0,
					name: 'Parabolic SAR'
				},
				'os_tema_5': {
					visibility: 0,
					name: 'Triple Exponential Moving Average 5D'
				},
				'os_trima_30': {
					visibility: 0,
					name: 'Triangular Moving Average 30D'
				},
				'os_wma_30': {
					visibility: 0,
					name: 'Weighted Moving Average 30D'
				},
			},
			'momentum':{
				'mi_adx_14': {
					visibility: 0,
					name: 'Average Directional Movement Index 14D'
				},
				'mi_adxr_14': {
					visibility: 0,
					name: 'Average Directional Movement Index Rating 14D'
				},
				'mi_apo': {
					visibility: 0,
					name: 'Absolute Price Oscillator'
				},
				'mi_arron_d': {
					visibility: 0,
					name: 'Aroon'
				},
				'mi_aroonosc': {
					visibility: 0,
					name: 'Aroon Oscillator'
				},
			}
		}
	}

	onChange(data){
		// console.log('onChange', data)
		this.active = _.union(this.active, data)
		// console.log('\tactive', this.active)
		this.props.onChange(this.active)
	}

	render(){
		var scope = this
		var buildMenu = Object.keys(this.state).map(function(d, i){
			return <Category key={i} name={d} onChange={scope.onChange.bind(scope)} data={scope.state[d]}/>
		})

		return (
			<div>
				{buildMenu}
			</div>
		)
	}
}

export default StockOptions;