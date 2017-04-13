import React from 'react';
// import Context from 'react-context';

import Moment from 'moment';
import AppBar from 'react-toolbox/lib/app_bar';
// import PurpleAppBar from './components/PurpleAppBar.js';

import StockList from './stocklist.jsx'
import { Layout, NavDrawer, Panel, Sidebar } from 'react-toolbox';
import { RadioGroup, RadioButton } from 'react-toolbox/lib/radio';
import {Tab, Tabs} from 'react-toolbox';
import SuccessButton from './components/SuccessButton.js';
import StockOptions from './components/StockOptions.js';
import {IconButton} from 'react-toolbox/lib/button';
import Dialog from 'react-toolbox/lib/dialog';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import theme from './app.css';
import StockItem from './stockitem.jsx'

import _ from 'underscore'
import io from 'socket.io-client';
let socket = io(`http://localhost:3000`)

class App extends React.Component {
	constructor(props) {
		super(props);
		
		var scope = this;
		this.socket = socket;
		this.data = {}
		this.data_layers = {
			'base':{
				'info':{
					visibility: 1,
					name:'Legend',
					abbr:'NF'
				},
				'grid_dates':{
					visibility: 0,
					name:'Dates Grid',
					abbr:'DG'
				},
				'grid_prices':{
					visibility: 1,
					name:'Price Grid',
					abbr:'PG'
				},
				'annotations':{
					visibility: 0,
					name: 'Annotations'
				},
				'close': {
					visibility: 1,
					name: 'Closing Price',
					abbr: 'CLOSING'
				}
			},
			'overlap':{
				'os_sma_20': {
					visibility: 0,
					name: 'Simple Moving Average 20D',
					abbr: 'SMA20'
				},
				'os_sma_50': {
					visibility: 0,
					name: 'Simple Moving Average 50D',
					abbr: 'SMA50'
				},
				'os_sma_200': {
					visibility: 0,
					name: 'Simple Moving Average 200D',
					abbr: 'SMA200'
				},
				'os_bbu_20': {
					visibility: 0,
					name: 'Bollinger Bands',
					abbr: 'BB'
				},
				'os_dema_20': {
					visibility: 0,
					name: 'Double Exponential Moving Average 20D',
					abbr: 'DEMA20'
				},
				'os_ema_20': {
					visibility: 0,
					name: 'Exponential Moving Average 20D',
					abbr: 'EMA20'
				},
				'os_mp_14': {
					visibility: 0,
					name: 'Midpoint Over Period',
					abbr: 'MOP'
				},
				'os_sar': {
					visibility: 0,
					name: 'Parabolic SAR',
					abbr: 'PSAR'
				},
				'os_tema_5': {
					visibility: 0,
					name: 'Triple Exponential Moving Average 5D',
					abbr: 'TEMA5'
				},
				'os_trima_30': {
					visibility: 0,
					name: 'Triangular Moving Average 30D',
					abbr: 'TMA30'
				},
				'os_wma_30': {
					visibility: 0,
					name: 'Weighted Moving Average 30D',
					abbr: 'WMA30'
				},
			},
			'momentum':{
				'mi_adx_14': {
					visibility: 0,
					name: 'Average Directional Movement Index 14D',
					abbr: 'ADMI14'
				},
				'mi_adxr_14': {
					visibility: 0,
					name: 'Average Directional Movement Index Rating 14D',
					abbr: 'ADMIR14'
				},
				'mi_apo': {
					visibility: 0,
					name: 'Absolute Price Oscillator',
					abbr: 'APO'
				},
				'mi_arron_d': {
					visibility: 0,
					name: 'Aroon',
					abbr: 'A'
				},
				'mi_aroonosc': {
					visibility: 0,
					name: 'Aroon Oscillator',
					abbr: 'AO'
				},
			},
			'volume':{
				'volume':{
					visibility: 0,
					name: 'Volume',
					abbr: 'vol'
				}
			},
			'positions':{
				'position_me':{
					visibility: 0,
					name: 'Me',
					abbr: 'ME'
				}
			}
		}
		this.state = {
			tickers: {},
			watch_ticker: [],
			display_layer: this.getInitDisplayedLayers(),
			active: false,
			sidebarPinned: false,
			open: [],

			width: 600,
			height: 800,
			tab_index: 0,
			range: '6M',
			sort: 'pchange',
			updated: null
		}		

		socket.on('disconnect', () => {
            socket.close();
        });
        
        socket.on('init', () => {
        	this.init()
        });
        
        socket.on('stock:get_positions', (data) => {
        	// console.log('get_positions result:', data.stock_list)
			var stock_data = JSON.parse(data.stock_list)
			
			// when was the data generated/updated?
			var date = 'updated '+Moment(stock_data.date, "MM-DD-YYYY").calendar(null, {
			    sameDay: '[today]',
			    nextDay: '[tomorrow]',
			    nextWeek: 'dddd',
			    lastDay: '[yesterday]',
			    lastWeek: '[last] dddd',
			    sameElse: 'DD/MM/YYYY'
			})
			console.log('update', date)
			console.log('update', stock_data.date)

			// store unprocessed stocks on object
			scope.data = stock_data.stocks

			// get sectors
			// var sectors = []
			// stock_data.stocks.map(function(stock_item, idx){
			// 	if(stock_item.hasOwnProperty('str')){
			// 		sectors.push(stock_item['str'])
			// 	}
			// })

			// // sort by sector
			// var sorted_stock = {}
			// _.uniq(sectors).map(function(item){
			// 	sorted_stock[item] = []
			// })
			
			// stock_data.stocks.map(function(stock_item, idx){
			// 	sorted_stock[stock_item['str']].push(stock_item)
			// })
			// console.log('sorted stock:', sorted_stock)

			
        	this.setState({open:this.sortStockData(this.state.sort), updated:date})
        })

        socket.on('stock:get_tickers', (data) =>{        	
        	var stock_list = JSON.parse(data.stock_list)
        	// console.log('get_tickers result:', stock_list)
        	this.setState({tickers:stock_list})
        })
	}

	getInitDisplayedLayers(){
		// console.log('getInitDisplayedLayers', this.data_layers)
		var scope = this;
		
		var active = []
		Object.keys(this.data_layers).map(function(d){
			// console.log(d, scope.data_layers[d])
			Object.keys(scope.data_layers[d]).map(function(e){
				// console.log(d, e)
				if(scope.data_layers[d][e].visibility){
					active.push(e)
				}
			})
		})
		// console.log(active)
		return active
	}

	componentWillMount(){
        this.updateDimensions();
    }

	updateDimensions(){
		// console.log('updateDimensions', window.innerWidth, window.innerHeight)
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }
    
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

	init(){
		console.log('init')
		socket.emit('stock:get_positions', {position: 'open', date: new Date()})
        socket.emit('stock:get_tickers')
	}

	handleDialogToggle = () => {
		// console.log('handleDialogToggle')
		this.setState({active: !this.state.active});
  	}

  	handleDialogAdd = () => {
		// console.log('handleDialogAdd')
		// console.log('watching', this.state.watch_ticker)
		if(this.state.watch_ticker.length > 0){
			socket.emit('stock:add_ticker', {'ticker':this.state.watch_ticker})
			this.setState({watch_ticker: []});
		}
		this.handleDialogToggle()
	}

	handleAutoCompleteChange = (value) => {
		// console.log('handleAutoCompleteChange', value)
		this.setState({watch_ticker: value});
	}
	
	dialogActions = [
		{ label: "Cancel", onClick: this.handleDialogToggle },
		{ label: "Add", onClick: this.handleDialogAdd }
	]

	toggleSidebar = () => {
		// console.log('toggleSidebar')
		this.setState({sidebarPinned: !this.state.sidebarPinned});		
	}

	onOptionChange = (data) => {
		// console.log('onOptionChange', data)
		this.setState({display_layer: data})
	}

	handleTabChange = (index) => {
		// console.log('handleTabChange', index)
		this.setState({tab_index:index});
	}

	handleRangeChange = (value) => {
		// console.log('handleRangeChange', value)
		this.setState({range:value});
	}

	handleSortChange = (value) => {
		// console.log('handleSortChange', value)
		if(value != this.state.sort){			
			this.setState({sort:value, open:this.sortStockData(value)});
		}
	}

	sortStockData = (value) => {
		console.log('sortStockData', value)

		switch(value){
			case "name":
				this.data.sort(function(a, b){
					var nameA = a.nme.toUpperCase(); // ignore upper and lowercase
					var nameB = b.nme.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}

					// names must be equal
					return 0;
				})
			break;

			case "vchange":
				this.data.sort(function(a, b){
					return b.pgl - a.pgl 
				})
			break;

			case "pchange":
				this.data.sort(function(a, b){
					return parseFloat(b.pglp) - parseFloat(a.pglp)
				})
			break;

			case "sposition":
				this.data.sort(function(a, b){
					return b.pq - a.pq
				})
			break;

			case "vposition":
				this.data.sort(function(a, b){
					return b.prc * b.pq - a.prc * a.pq
				})
			break;
		}

		// console.log(this.data)
		return this.data
	}

	render() {
		// console.log('render')
		// console.log('theme', theme)
		
		var scope = this
		var buildItems = this.state.open.map(function(d, i){
			// console.log('socket', socket)
			return <StockItem 
						key={i}
						nme={d.nme}
						sbl={d.sbl}
						
						prc={d.prc}
						dv={d.dv}
						dp={d.dp}

						app={d.app}
						pq={d.pq}
						pgl={d.pgl}
						pglp={d.pglp}

						info={d}
						display_layer={scope.state.display_layer}
						range={scope.state.range}

						width={scope.state.width}
						socket={socket}/>
		})

		return (
			<Layout>				
				<NavDrawer pinned={ this.state.sidebarPinned } scrollY={true} width={ 33 }>
                    <div style={{ flex: 1, padding: "0.5rem"}}>
                    	<IconButton style={{ float: "right"}} icon='close' onClick={ this.toggleSidebar }/>
                    	<h4>Settings</h4>
                     	<Tabs index={this.state.tab_index} onChange={this.handleTabChange}>
							<Tab label='Sort'>
                        		<RadioGroup value={this.state.sort} onChange={this.handleSortChange}>
                        			<RadioButton label='Position Change' value='vchange'/>
                        			<RadioButton label='Percentage Change' value='pchange'/>
                        			<RadioButton label='Position Size' value='sposition'/>
                        			<RadioButton label='Position Value' value='vposition'/>
                        			<RadioButton label='Name' value='name'/>
                        			<RadioButton label='Sector' value='sector'/>
                        		</RadioGroup>
							</Tab>
							<Tab label='Range'>
								<RadioGroup value={this.state.range} onChange={this.handleRangeChange}>
									<RadioButton label='1 Month' value='1M'/>
									<RadioButton label='3 Month' value='3M'/>
									<RadioButton label='6 Month' value='6M'/>
									<RadioButton label='1 Year' value='1Y'/>
									<RadioButton label='2 Years' value='2Y'/>
									<RadioButton label='3 Years' value='3Y'/>
									<RadioButton label='5 Years' value='5Y'/>
									<RadioButton label='10 Years' value='10Y'/>
								</RadioGroup>
							</Tab>
							<Tab label='Show'>
                        		<StockOptions 
                        			data={this.data_layers} 
                        			onChange={this.onOptionChange}/>
							</Tab>
                    	</Tabs>                    	
                    </div>
                </NavDrawer>
                <Panel>
					<div id='content' style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
					<IconButton style={{float:'left'}} icon='menu' onClick={this.toggleSidebar}/>
					<div style={{float:'left'}}><h4>Open Positions</h4></div>
					<div id='toolbar' style={{float: 'right'}}>
						<div className={theme['date']}>{this.state.updated}</div>
						<div className={theme['range']}>{this.state.range}</div>
					</div>
					
                	{buildItems}

					<div className={theme['tail']}>
					<SuccessButton 
							onClick={this.handleDialogToggle} 
							icon='add' floating accent mini />
					</div>
					<Dialog
							actions={this.dialogActions}
							active={this.state.active}
							onEscKeyDown={this.handleDialogToggle}
							onOverlayClick={this.handleDialogToggle}
							title={'Add Ticker'}>
							<Autocomplete
						        direction="down"
						        selectedPosition="above"
						        label="Choose Ticker"
						        onChange={this.handleAutoCompleteChange.bind(this)}
						        source={this.state.tickers}
						        value={this.state.watch_ticker}
						     />
						     <div style={{height:"140px"}}>
						     </div>
					</Dialog>
					</div>
				</Panel>
			</Layout>
		);
	}
}

export default App;