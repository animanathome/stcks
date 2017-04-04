import React from 'react'
import StockItem from './stockitem.jsx'
import { Card } from 'react-toolbox/lib/card';
import theme from './stocklist.css';

class StockList extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		// console.log('render', this.props.display_layer)
		console.log('width', this.props.width)		
		return (
		<div>
			<h4>{this.props.name}</h4>
			<Card>
			{
				this.props.stock.map((stock, i) => {
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

							info={stock}
							display_layer={this.props.display_layer}

							width={this.props.width}
							socket={this.props.socket}
						/>
					);
				})
			}			
			</Card>
			<div className={theme['tail']}></div>
		</div>
		)
	}
}

export default StockList;
