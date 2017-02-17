import React from 'react'
import StockItem from './stockitem.jsx'

import theme from './stocklist.css';

class StockList extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			items: []
		}
	}

	componentWillReceiveProps(nextProps){
		// console.log('componentWillReceiveProps', nextProps)
		var stock_items = nextProps.stock
		if(typeof(nextProps.stock) === 'string'){
			stock_items = JSON.parse(nextProps.stock)
		}
		// console.log(typeof(stock_items))
		// console.log(stock_items)

		var pp = ['prc', 'dv', 'dp', 'sbl', 'nme', 'app', 'pq', 'pgl', 'pglp']
		var obj = {}
		var unified_items = stock_items.map(function(stock_item, idx){			
			obj = {}
			pp.map(function(p){
				obj[p] = stock_item.hasOwnProperty(p) ? stock_item[p] : undefined
			})
			return obj
		})
		this.setState({items:unified_items})
	}

	render() {
		return (
			<div className={theme['stock_list']}>
				{
					this.state.items.map((stock, i) => {
						return (
							<StockItem
								key={i}
								
								nme={stock.nme}
								sbl={stock.sbl}
								
								prc={stock.prc}
								dv={stock.dv}
								dp={stock.dp}

								app={stock.app}
								pq={stock.pq}
								pgl={stock.pgl}
								pglp={stock.pglp}

								width={this.props.width}
								socket={this.props.socket}
							/>
						);
					})
				}
			</div>
		);
	}
}

export default StockList;
