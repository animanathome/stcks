import React from 'react';

import theme from './main.css';

class ButtonGroup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: [],
      clickables: [],
      callback: null
    }

    var _this = this;
    this.props.clickables.map(function(i, idx){
      _this.state.active.push(false)
    })
  }

  handleClick(index) {
    console.log('handleClick', index)

    var _this = this;
    var result = this.props.clickables.map(function(i, idx){
      if(index == idx){
        return _this.state.active[idx] == true ? false : true;
      }else{
        return _this.state.active[idx] 
      }
    })
    this.setState({active:result})

    if(this.props.callback){
      this.props.callback(result)
    }
  }

  render() {
    // http://stackoverflow.com/questions/29517715/react-this-state-disappears-in-for-loop
    var _this = this;
    return <div>
        { this.props.clickables.map(function(clickable, i) {
            return <MyClickable key={i}
                name={ clickable }
                index={ i }
                isActive={ _this.state.active[i] === true}
                onClick={_this.handleClick.bind(_this)}
            /> } )
        }
    </div>
  }
}

class MyClickable extends React.Component {

  handleClick() {
    // console.log('handleClick', this.props.index)
    this.props.onClick(this.props.index)
  }

  render () {
    return <button type='button' className={this.props.isActive ? theme['button']+' '+theme['active'] : theme['button']} onClick={this.handleClick.bind(this)}>
      <span>{this.props.name}</span>
    </button>
  }
}

export default ButtonGroup