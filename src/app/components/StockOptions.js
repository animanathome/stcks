import React from 'react';
import _ from 'underscore'
import { Checkbox } from 'react-toolbox';

class Category extends React.Component {
	constructor(props){
		super(props)

		this.category = props.name
		this.active = []
		this.processData(props)
		this.parent = props.parent
	}

	handleChange = (field, value) => {
		// console.log('handleChange', field, value)
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

			if(props.data[d].visibility){
				scope.active.push(d)
			}
		})
		console.log('\tstate:', this.state)
		console.log('\tactive:', this.active)
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
    	this.props.onChange(this.category, this.active)
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

		this.active = {}
		this.state = props.data
		this.onInit()
		// this.state = {
		// 	'base':{
		// 		'info':{
		// 			visibility: 1,
		// 			name:'Info',
		// 			abbr:'NF'
		// 		},
		// 		'grid_dates':{
		// 			visibility: 0,
		// 			name:'Dates Grid',
		// 			abbr:'DG'
		// 		},
		// 		'grid_prices':{
		// 			visibility: 1,
		// 			name:'Price Grid',
		// 			abbr:'PG'
		// 		},
		// 		'annotations':{
		// 			visibility: 0,
		// 			name: 'Annotations'
		// 		},
		// 		'close': {
		// 			visibility: 1,
		// 			name: 'Closing Price',
		// 			abbr: 'CLOSING'
		// 		}
		// 	},
		// 	'overlap':{
		// 		'os_sma_20': {
		// 			visibility: 0,
		// 			name: 'Simple Moving Average 20D',
		// 			abbr: 'SMA20'
		// 		},
		// 		'os_sma_50': {
		// 			visibility: 0,
		// 			name: 'Simple Moving Average 50D',
		// 			abbr: 'SMA50'
		// 		},
		// 		'os_sma_200': {
		// 			visibility: 0,
		// 			name: 'Simple Moving Average 200D',
		// 			abbr: 'SMA200'
		// 		},
		// 		'os_bbu_20': {
		// 			visibility: 0,
		// 			name: 'Bollinger Bands',
		// 			abbr: 'BB'
		// 		},
		// 		'os_dema_20': {
		// 			visibility: 0,
		// 			name: 'Double Exponential Moving Average 20D',
		// 			abbr: 'DEMA20'
		// 		},
		// 		'os_ema_20': {
		// 			visibility: 0,
		// 			name: 'Exponential Moving Average 20D',
		// 			abbr: 'EMA20'
		// 		},
		// 		'os_mp_14': {
		// 			visibility: 0,
		// 			name: 'Midpoint Over Period',
		// 			abbr: 'MOP'
		// 		},
		// 		'os_sar': {
		// 			visibility: 0,
		// 			name: 'Parabolic SAR',
		// 			abbr: 'PSAR'
		// 		},
		// 		'os_tema_5': {
		// 			visibility: 0,
		// 			name: 'Triple Exponential Moving Average 5D',
		// 			abbr: 'TEMA5'
		// 		},
		// 		'os_trima_30': {
		// 			visibility: 0,
		// 			name: 'Triangular Moving Average 30D',
		// 			abbr: 'TMA30'
		// 		},
		// 		'os_wma_30': {
		// 			visibility: 0,
		// 			name: 'Weighted Moving Average 30D',
		// 			abbr: 'WMA30'
		// 		},
		// 	},
		// 	'momentum':{
		// 		'mi_adx_14': {
		// 			visibility: 0,
		// 			name: 'Average Directional Movement Index 14D',
		// 			abbr: 'ADMI14'
		// 		},
		// 		'mi_adxr_14': {
		// 			visibility: 0,
		// 			name: 'Average Directional Movement Index Rating 14D',
		// 			abbr: 'ADMIR14'
		// 		},
		// 		'mi_apo': {
		// 			visibility: 0,
		// 			name: 'Absolute Price Oscillator',
		// 			abbr: 'APO'
		// 		},
		// 		'mi_arron_d': {
		// 			visibility: 0,
		// 			name: 'Aroon',
		// 			abbr: 'A'
		// 		},
		// 		'mi_aroonosc': {
		// 			visibility: 0,
		// 			name: 'Aroon Oscillator',
		// 			abbr: 'AO'
		// 		},
		// 	}
		// }
		// this.onInit()
	}

	// flattenActive(){
	// 	var scope = this;
	// 	var flattend = []
	// 	Object.keys(this.active).map(function(d){
	// 		scope.active[d].map(function(e){
	// 			flattend.push(e)
	// 		})
	// 	})
	// 	return flattend
	// }
	
	// onInit(){
	// 	console.log('process')
	// 	var scope = this;

	// 	Object.keys(this.state).map(function(d){
	// 		// console.log(d)
	// 		scope.active[d] = []
	// 		Object.keys(scope.state[d]).map(function(e){
	// 			// console.log('\t', e)
	// 			if(scope.state[d][e].visibility){
	// 				scope.active[d].push(e)
	// 			}
	// 		})
	// 	})
	// 	console.log('\tactive:', this.active)

	// 	// this.props.onChange(this.flattenActive())
	// }

	flattenActive(active){
		var flattend = []
		Object.keys(active).map(function(d){
			active[d].map(function(e){
				flattend.push(e)
			})
		})
		return flattend
	}

	onInit(){
		console.log('onInit')
		var scope = this;
		
		this.active = {}
		Object.keys(this.state).map(function(d){
			scope.active[d] = []
			Object.keys(scope.state[d]).map(function(e){
				// console.log(scope.state[d][e])
				if(scope.state[d][e].visibility){
					scope.active[d].push(e)
				}
			})
		})
		console.log('\tactive:', this.active)
	}

	onChange(category, data){
		console.log('onChange', category, data)
		var scope = this;
		// this.active = _.union(this.active, data)
		// console.log('\tactive', this.active)
		// this.props.onChange(this.active)
		this.active[category] = data

		// var flattend = []
		// Object.keys(this.active).map(function(d){
		// 	scope.active[d].map(function(e){
		// 		flattend.push(e)
		// 	})
		// })
		// console.log('flat:', flattend)
		this.props.onChange(this.flattenActive(this.active))
	}

	render(){
		var scope = this

		var buildMenu = Object.keys(this.state).map(function(d, i){
			return <Category 
						key={i} 
						name={d} 
						onChange={scope.onChange.bind(scope)} 
						data={scope.state[d]}/>
		})

		return (
			<div>
				{buildMenu}
			</div>
		)
	}
}

export default StockOptions;