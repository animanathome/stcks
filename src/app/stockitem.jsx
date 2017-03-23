import React from 'react'
import StockGraph from './stockgraph.jsx'
import theme from './stockitem.css';
import FontIcon from 'react-toolbox/lib/font_icon';

class StockItem extends React.Component {
	constructor(props){
		super(props);
		this.state = {showGraph: false}
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(){
		// console.log('click', this.state)
		this.setState(prevState => ({
			showGraph: !prevState.showGraph
		}));
	}

	handleRemoveClick(e){
		// console.log('handleRemoveClick', e)
		e.stopPropagation()		
		this.props.socket.emit('stock:remove_ticker', {ticker:[this.props.sbl]})
	}

	// componentWillUpdate(nextProps, nextState){
	// 	console.log('componentWillUpdate', nextProps, nextState)
	// }

	render(){
		// console.log('StockItem:', this.props.info)
		// console.log(theme)
		// console.log(this.props.pgl, typeof(this.props.pgl))
		var _this = this;
		return (
			<div className={theme['stock_item']}>
				<div onClick={this.handleClick} className={theme['stock_item_h']}>					
					<div className={theme['stock_item_n']}>
						<span>{this.props.info.nme} 
							<font color="gray"><small> {this.props.sbl}</small></font>
						</span>
					</div>

					<div onClick={this.handleRemoveClick.bind(this)} 
						 className={theme['stock_item_m']}>
						 <FontIcon value='clear' />
					</div>

					

					<div className={theme['stock_item_d']}>
						<span>
							{this.props.info.pgl < 0 && 
								<font color="red">{this.props.info.pgl+" ("+this.props.info.pglp+")"}
									<FontIcon 
										className={theme['stock_item_ud']} 
										value='arrow_downward'/>
								</font>
							}
							{this.props.info.pgl > 0 && 
								<font color="green">{this.props.info.pgl+" ("+this.props.info.pglp+")"}
									<FontIcon 
										className={theme['stock_item_ud']} 
										value='arrow_upward'/>
								</font>
							}
							{typeof(this.props.info.pgl) === 'undefined' && <font>-</font>}

						</span>
					</div>

					<div className={theme['stock_item_q']}>
						<span>
							{typeof(this.props.info.pq) === 'undefined' && <font>-</font>}
							{typeof(this.props.info.pq) !== 'undefined' && <font>{this.props.info.pq}</font>}
						</span>
					</div>

					{/*
					<div className={theme['stock_item_v']}>
						
							{typeof(this.props.app) === 'undefined' && <span><font>-</font></span>}
							{typeof(this.props.app) !== 'undefined' && 
								<span>
									<strong>{this.props.app}</strong> 
									<font color="gray"><small> USD</small></font>
								</span>
							}
					</div>


					
					<div className={theme['stock_item_d']}>
						<span>
							{this.props.dv < 0 && 
								<font color="red">{this.props.dv+" ("+this.props.dp+")"}
									<FontIcon 
										className={theme['stock_item_ud']} 
										value='arrow_downward'/>
								</font>
							}
							{this.props.dv > 0 && 
								<font color="green">{this.props.dv+" ("+this.props.dp+")"}
									<FontIcon 
										className={theme['stock_item_ud']} 
										value='arrow_upward'/>
								</font>
							}
						</span>
					</div>
					*/}

					<div className={theme['stock_item_v']}>
						<span>							
							<strong>{this.props.info.prc}</strong> 
							<font color="gray"><small> USD</small></font> 
						</span>
					</div>					
				</div>
				
				<div>
					{this.state.showGraph ? 
					<StockGraph
						display_info={this.props.display_info} 
						width={this.props.width-36} 
						info={this.props.info}
						socket={this.props.socket} 
						symbol={this.props.sbl}/>:null
					}
				</div>
			</div>
		)
	}
}

export default StockItem;