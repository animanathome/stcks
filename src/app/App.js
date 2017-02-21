import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
// import PurpleAppBar from './components/PurpleAppBar.js';

import StockList from './stocklist.jsx'

import SuccessButton from './components/SuccessButton.js';
import Dialog from 'react-toolbox/lib/dialog';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import theme from './app.css';

import _ from 'underscore'
import io from 'socket.io-client';
let socket = io(`http://localhost:3000`)

class App extends React.Component {
	constructor(props) {
		super(props);
		
		this.socket = socket;
		this.state = {
			tickers: {},
			watch_ticker: [],
			active: false,
			open: [],
			width: 600,
			height: 800
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
			
			// get sectors
			var sectors = []
			stock_data.map(function(stock_item, idx){
				if(stock_item.hasOwnProperty('str')){
					sectors.push(stock_item['str'])
				}
			})

			// sort by sector
			var sorted_stock = {}
			_.uniq(sectors).map(function(item){
				sorted_stock[item] = []
			})
			
			stock_data.map(function(stock_item, idx){
				sorted_stock[stock_item['str']].push(stock_item)
			})
			// console.log(sorted_stock)

        	this.setState({open:sorted_stock})
        })
        socket.on('stock:get_tickers', (data) =>{        	
        	var stock_list = JSON.parse(data.stock_list)
        	// console.log('get_tickers result:', stock_list)
        	this.setState({tickers:stock_list})
        })
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
		// console.log('init')

		// get all open positions
		// user for display
		socket.emit('stock:get_positions', {position: 'open', date: new Date()})
		// socket.once('stock:get_positions', (data) => {
  //       	console.log('got stock:data back:', data.stock_list)
  //       	this.setState({day:data.stock_list})
  //       })

        // get all tickers (symbol + name)
        // used for adding new positions
        socket.emit('stock:get_tickers')
        // socket.once('stock:get_tickers', (data) =>{        	
        // 	var stock_list = JSON.parse(data.stock_list)
        // 	console.log('result:', stock_list)
        // 	this.setState({tickers:stock_list})
        // })
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

	render() {
		// console.log('theme', theme)
		return (
			<div>
				<div id='content' style={{ flex: 1, overflowY: 'auto', padding: '1.8rem' }}>
					
                
					{
						_.keys(this.state.open).map((sector, i) =>{
							return (
								<StockList key={i} name={sector}
									width={this.state.width} 
									height={this.state.height} 
									stock={this.state.open[sector]} 
									socket={this.socket}/>
							)
						})
					}	

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
			</div>
		);
	}
}

export default App;