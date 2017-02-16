import React from 'react';

import theme from './main.css';

class RadioButtonGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: this.props.activeIndex,
      clickables: [],
      callback: null
    }
  }

  handleClick(index) {
    this.setState({activeIndex: index})

    if(this.props.callback){
      this.props.callback(this.props.clickables[index])
    }
  }

  render() {
    // console.log(this.props)
    // http://stackoverflow.com/questions/29517715/react-this-state-disappears-in-for-loop
    var _this = this;    
    return <div>
        { this.props.clickables.map(function(clickable, i) {
            return <MyRadioClickable key={i}
                name={ clickable }
                index={ i }
                isActive={ _this.state.activeIndex === i }
                onClick={_this.handleClick.bind(_this)}
            /> } )
        }
    </div>
  }
}

class MyRadioClickable extends React.Component {

  handleClick() {
    this.props.onClick(this.props.index)
  }

  render () {
    return <button type='button' className={this.props.isActive ? theme['button']+' '+theme['active'] : theme['button']} onClick={this.handleClick.bind(this)}>
      <span>{this.props.name}</span>
    </button>
  }
}

export default RadioButtonGroup