import React from 'react'
import StockItem from './stockitem.jsx'

import theme from './stocklist.css';

class StockList extends React.Component {
	constructor(props){
		super(props)
	}

	render() {
		// console.log(this.props)
		// console.log(this.state.name)
		// console.log(this.props.name)

		var stock_items = this.props.stock
		if(typeof(this.props.stock) === 'string'){
			stock_items = JSON.parse(this.props.stock)
		}
		// console.log(stock_items, typeof(stock_items))

		return (
			<div className={theme['stock_list']}>
				{
					stock_items.map((stock, i) => {
						return (
							<StockItem
								key={i}
								nme={stock.nme}
								sbl={stock.sbl}
								prc={stock.prc}
								dv={stock.dv}
								dp={stock.dp}
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
