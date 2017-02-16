import React from 'react';

var Button=React.createClass({
    getDefaultProps: function() {
        return {
            cx: 25,
            cy: 25,
            r: 25,
            id: 'buttonId',
            callback: null
        };
    },
    handleClick(){
        console.log('click', this.props.id)
        if(this.props.callback != null){
            this.props.callback(this.props.id)
        }
    },
    render: function(){
        return (
            <svg width="50" height="50">
                <circle onClick={this.handleClick} id={this.props.id} className="button-circle" cx={this.props.cx} cy={this.props.cy} r={this.props.r}></circle>
            </svg>
        )
    }
})

export default Button