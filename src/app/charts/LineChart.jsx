import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from "d3";
import $ from 'jquery';

import theme from './LineChart.css';

var Axis=React.createClass({
    propTypes: {
        h:React.PropTypes.number,
        axis:React.PropTypes.func,
        axisType:React.PropTypes.oneOf(['x','y'])

    },

    componentDidUpdate: function () { this.renderAxis(); },
    componentDidMount: function () { this.renderAxis(); },
    renderAxis: function () {
        var node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.axis);
        d3.selectAll(".tick")
            .classed(theme["tick"], true)
        d3.selectAll(".pad")
            .classed(theme["pad"], true)

    },
    render: function () {

        var translate = "translate(0,"+(this.props.h)+")";

        return (
            <g className={theme['axis']} transform={this.props.axisType=='x'?translate:""} >
            </g>
        );
    }

});

var Grid=React.createClass({
    propTypes: {
        h:React.PropTypes.number,
        grid:React.PropTypes.func,
        gridType:React.PropTypes.oneOf(['x','y'])
    },

    componentDidUpdate: function () { this.renderGrid(); },
    componentDidMount: function () { this.renderGrid(); },
    renderGrid: function () {
        var node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.grid);
        d3.selectAll(".tick")
            .classed(theme["tick"], true)
        d3.selectAll(".pad")
            .classed(theme["pad"], true)
    },
    render: function () {
        var translate = "translate(0,"+(this.props.h)+")";
        return (
            <g className={theme['axis']+" "+theme["axis--"+this.props.gridType]} 
               transform={this.props.gridType=='x'?translate:""}>
            </g>
        );
    }

});

var HInfoLine = React.createClass({
    render: function(){
        var x = this.props.x;
        var y = this.props.y;
        var d="M0,"+y(this.props.yp)+"H"+x(this.props.xr[1])
        return (
            <path style={{strokeDasharray:'5, 5'}} className={theme['hline-info']} d={d}></path>
        )
    }
});

var VInfoLine=React.createClass({
    render: function(){
        if(!this.props.hasOwnProperty('index') 
        || !this.props.hasOwnProperty('data')){
            return null
        }
        var idx = this.props.index;
        if(idx === null){
            return null
        }
        var data = this.props.data;
        if(idx >= data.length){
            return null
        }

        var x = this.props.x;
        var y = this.props.y;
        var px = x(data[idx].day);
        var d="M"+px+",0V"+y(this.props.yb)
        return (
            <path style={{strokeDasharray:'2, 2'}} className={theme['vline-info']} d={d}></path>
        )
    }
});


var LegendItem=React.createClass({
    getDefaultProps: function() {
        return {
            text: 'text',
            x: 22,
            y: 17,
            index: 1,
            colorVisibility: false,
            color: 'red'
        };
    },
    render: function(){
        // console.log(this.props.text)
        var transform = 'translate(12,' + ((this.props.y*this.props.index)-(this.props.y/4)+4) + ')';
        // console.log(transform)
        // console.log(this.props.color)
        return (
            <g>
                <text y={(this.props.y*this.props.index)+4} x={this.props.x}>{this.props.text}</text>
                {this.props.colorVisibility ? <circle r={"3.5"} transform={transform} fill={this.props.color}></circle>:null}
            </g>
        )
    }
})

var Legend=React.createClass({
    getDefaultProps: function() {
        return {
            x: 0,
            y: 0,
            width: 140,
            height: 80,
            itemHeight: 21
        };
    },
    render: function(){

        var x;
        if(this.props.align > 0){
            x = (this.props.x - this.props.width) - 10;
        }else{
            x = this.props.x + 10;
        }

        // var x = (this.props.x - this.props.width) - 10;
        // var y = this.props.y;
        var y = 0;

        var transform = 'translate(' + x + ',' + y + ')';
        
        return (
            <g className={theme["legend"]} transform={transform}>
                <rect x={0} 
                      y={0} 
                      width={this.props.width} 
                      height={this.props.content.length*this.props.itemHeight}>
                </rect>
                {
                    this.props.content.map((item, i) => {
                        return (
                            <LegendItem key={i} colorVisibility={this.props.displayColors[i]} index={i+1} text={item} color={this.props.colors(i)}/>
                        )
                    })
                }
            </g>
        )
    }
})

var Positions=React.createClass({

    getPositionValue: function(positions){
        // console.log('getPositionValue')
        var result = []
        var pl = positions.length;
        var dv, dp;
        for(var i = 0; i < pl-1; i++){
            dv = (positions[i+1][1] - positions[i][1]).toFixed(2)
            dp = (((positions[i+1][1] / positions[i][1])-1)*100).toFixed(2)
            // console.log('$'+dv+', '+dp+'%')
            result.push({'data':positions[i][0], 'value':dv, 'percentage':dp})
        }
        return result
    },
    getPositionRanges: function(positions){
        // console.log('getPositionRanges', positions)
        var result = []
        for(var i = 0; i < positions.length; i++){
            if(positions[i][2] == 'close'){
                result.push({
                    date: d3.timeDay.offset(positions[i][0], -1),
                    defined:true
                })
            }
            result.push({
                date:positions[i][0], 
                defined:positions[i][3]
            })
        }

        // close area when we end with an open position
        var li = positions.length-1
        var today = new Date()
        if(positions[li][2] == 'open'){
            result.push({
                date: d3.timeDay.offset(today, -1),
                defined:true
            })

            result.push({
                date: d3.timeDay.offset(today),
                defined:false
            })
        }

        return result
    },
    render: function(){
        // console.log('Positions', this.props.color)

        var parseTime = d3.timeParse("%d-%m-%Y");
        var positions = this.props.positions;
        var showPositions = false;
        if(typeof(positions) == 'string'){
            // console.log(positions)
            var jpositions = JSON.parse(positions)
            jpositions.positions = jpositions.data.map(function(d, idx){
                // console.log(d)
                return [parseTime(d[0]), d[1], d[2], d[2] == "open"? true:false]
            })

            var pranges = this.getPositionRanges(jpositions.positions)
            // console.log('position ranges', pranges)                
            showPositions = true
            // console.log('showPositions', showPositions)
            var pvalue = this.getPositionValue(jpositions.positions)
            // console.log(pvalue)
        }
        var x = this.props.x;
        var height = this.props.height;
        var area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { 
              // console.log(x(d.date));
              return x(d.date); })
            .y0(height)
            .y1(0.0)
            .defined(function(d){
                return d.defined
            })

        if(showPositions){
            return (
                <g>
                    <path id={this.props.id} 
                          style={{fill:this.props.color}} 
                          className={theme["area"]}
                          d={area(pranges)}/>
                </g>
            )
        }else{
            return null
        }
    }
})

var Info=React.createClass({
    render: function(){
        // console.log('info', this.props)

        if(!this.props.hasOwnProperty('index') 
        || !this.props.hasOwnProperty('data')){
            return null
        }
        var idx = this.props.index;
        if(idx === null){
            return null
        }
        var data = this.props.data;
        if(idx >= data.length){
            return null
        }
        var x = this.props.x;
        var y = this.props.y;

        // console.log(data[idx].price)

        var px = x(data[idx].day), 
            py = y(data[idx].price);

        // console.log(px, py)
        var transform='translate(' + px + ',' + py + ')';

        var color = this.props.fill;

        return (
            <g className={theme["info"]} transform={transform}>
                <circle r="5.5" style={{fill:"white"}}></circle>
                <circle r="4.5" style={{fill:color}}></circle>
            </g>
        );
    }
});

var LineChart=React.createClass({

    propTypes: {
        width:React.PropTypes.number,
        height:React.PropTypes.number,
        chartId:React.PropTypes.string
        // data: React.PropTypes.string,
        // positions: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            width: 800,
            height: 300,
            chartId: 'v1_chart',
            data: null,
            positions: {},
            activeIndex: null,
            display:[false, false, false],
            infoVisibility:false,
            infoIndex:0
        };
    },
    getInitialState:function(){
        return {
            data:{key:'',value:''},
            positions:null,
            activeIndex: null,
            display:[false, false, false],
            infoVisibility:false,
            infoIndex:0
        };
    },

    getPositionValue: function(positions){
        console.log('getPositionValue')
        var result = []
        var pl = positions.length;
        var dv, dp;
        for(var i = 0; i < pl-1; i++){
            dv = (positions[i+1][1] - positions[i][1]).toFixed(2)
            dp = (((positions[i+1][1] / positions[i][1])-1)*100).toFixed(2)
            // console.log('$'+dv+', '+dp+'%')
            result.push({'value':dv, 'percentage':dp})
        }
        return result
    },

    getPositionRanges: function(positions){
        // console.log('getPositionRanges', positions)
        var result = []
        for(var i = 0; i < positions.length; i++){
            if(positions[i][2] == 'close'){
                result.push({
                    date: d3.timeDay.offset(positions[i][0], -1),
                    defined:true
                })
            }
            result.push({
                date:positions[i][0], 
                defined:positions[i][3]
            })
        }

        // close area when we end with an open position
        var li = positions.length-1
        var today = new Date()
        if(positions[li][2] == 'open'){
            result.push({
                date: d3.timeDay.offset(today),
                defined:true
            })

            result.push({
                date: d3.timeDay.offset(today, +1),
                defined:false
            })
        }

        return result
    },
    getAttributeAtIndex: function(data, index, attribute){
        // console.log('getAttributeAtIndex', data, index, attribute)
        if(typeof(index) != "number"){
            return null
        }

        if(index > data.length-1){
            return null
        }

        if(attribute !== undefined){
            if(data[index].hasOwnProperty(attribute)){
                return data[index][attribute]    
            }else{
                return null
            } 
        }else{
            return data[index]
        }
    },

    mouseEnter: function(e){
        this.setState({infoVisibility:true})
        // console.log('mouseEnter', this.state.infoVisibility)
    },

    mouseLeave: function(e){        
        this.setState({infoVisibility:false})
        // console.log('mouseLeave', this.state.infoVisibility)
    },

    mouseMove: function(e){
        // console.log('mouseMove', e.clientX, e.clientY)
        // console.log('x', this._x)
        // console.log(this._bisectDate)
        var bisectDate = d3.bisector(function(d) { 
            return d.day; 
        }).right;

        var x0 = this._x.invert(e.clientX - 15),
            idx = bisectDate(this._cdata, x0, 1);

        this.setState({infoIndex:idx})
    },

    // componentWillReceiveProps: function(nextProps){
    //     console.log('componentWillReceiveProps')
    //     console.log('props', this.props.width)
    //     console.log('state', this.state.width)
    //     console.log('nextProps', nextProps.width)
    // },

    render:function(){
        // console.log('--------------------------------')
        // console.log('LineChart')
        // console.log('range', this.props.range)
        // console.log(theme)
        var data = this.props.data;
        if(!data.hasOwnProperty('data')){
            return (
                <div>Loading...</div>
            )
        }else{
            // console.log('info', this.props.data.info.yl, this.props.data.info.yh)
            var parseTime = d3.timeParse("%d-%m-%Y");            
            var dmyDateFormat = d3.timeFormat("%d/%m/%y");

            var formatAxisDates;
            if(['1Y', '2Y', '3Y', '5Y', '10Y'].indexOf(this.props.range) != -1){
                formatAxisDates = d3.timeFormat("%b %Y");
            }else{
                formatAxisDates = d3.timeFormat("%e %b");
            }

            var margin = {top: 5, right: 30, bottom: 20, left: 30},
                width = this.props.width - (margin.left + margin.right),
                height = this.props.height - (margin.top + margin.bottom);

            // console.log('wh', width, height)

            // read in data
            // var jdata = JSON.parse(data).data
            var structure = data.data.structure
            // console.log('structure', structure)

            // dates
            // console.log('data', data.data)
            // TODO: https://gist.github.com/mbostock/5827353
            var dates = data.data.data.map(function(d){
                // console.log(d)
                return parseTime(d[0])
            })
            var xrng = d3.extent(dates)
            // console.log('xrng:', xrng)
            
            // close(d) prices
            var cindex = structure.indexOf('close')
            // console.log(cindex)

            var cdata = data.data.data.map(function(d, idx){
                return {'price':+d[cindex], 'day':dates[idx]}
            })
            this._cdata = cdata
            // console.log('close', cdata)

            // 20d moving averages
            var ma20index = structure.indexOf('20sma')
            var ma20data = data.data.data.map(function(d, idx){
                return {'price':+d[ma20index], 'day':dates[idx]}
            })
            this._ma20data = ma20data
            // console.log('ma20data', ma20data)

            // 50d moving averages
            var ma50index = structure.indexOf('50sma')
            var ma50data = data.data.data.map(function(d, idx){
                return {'price':+d[ma50index], 'day':dates[idx]}
            })
            this._ma50data = ma50data
            // console.log('ma50data', ma50data)

            // 200d moving averages
            var ma200index = structure.indexOf('200sma')
            var ma200data = data.data.data.map(function(d, idx){
                return {'price':+d[ma200index], 'day':dates[idx]}
            })
            this._ma200data = ma200data
            // console.log('ma200data', ma200data)

            // get y (price) min and max
            var ymn = d3.min(cdata, function(d) { return d.price; })
            var ymx = d3.max(cdata, function(d) { return d.price; })

            // yearly min and max
            // console.log('info', this.props.info)
            var yymn = parseFloat(this.props.info.yl);
            var yymx = parseFloat(this.props.info.yh);
            if(['2Y', '3Y', '5Y', '10Y'].indexOf(this.props.range) == -1){
                if(yymn < ymn) ymn = yymn
                if(yymx > ymx) ymx = yymx
            }

            var x = d3.scaleTime().range([0, width]),
                y = d3.scaleLinear().range([height, 0]),
                z = d3.scaleOrdinal(d3.schemeCategory10);

            this._x = x;
            this._y = y;
            this._z = z;
            
            x.domain(xrng);

            var ymna = ymn-(ymn*.05)
            var ymxa = ymx+(ymx*.05)
            var yrng = ymxa - ymna
            y.domain([ymna, ymxa])
            z.domain(structure);

            // console.log('ma20color', z('20d'))
            
            // positions
            var positions = this.props.positions;
            var me = this.props.me;
            
            var xAxis = d3.axisBottom(x)
                  .tickSizeInner(-10)
                  .tickSizeOuter(0)
                  .tickPadding(5)
                  .tickFormat(function(d){
                        return formatAxisDates(d)
                    });

            // console.log(width)
            var yAxis = d3.axisRight(y)
                .tickSizeInner(width)
                .tickSizeOuter(0)
                .tickPadding(15)
                .tickFormat(function(d) { 
                    return "$" + d; 
                })

            var line = d3.line()
                .x(function(d) { 
                    return x(d.day); 
                })
                .y(function(d) { 
                    // console.log(y(d.price))
                    return y(d.price); 
                })
                .defined(function(d){
                    return !isNaN(d.price)
                });

            var transform='translate(' + margin.left + ',' + margin.top + ')';

            // console.log(this.state.infoIndex)
            // console.log('date', this.getAttributeAtIndex(dates, this.state.infoIndex))

            var lxp, lyp;
            var lcnt = [];
            var ldpl = [];
            var lalm = 1; // align multiplier (makes the length align left or right to the info line)
            if(this.state.infoIndex < dates.length-1){
                // legend position
                lxp = x(dates[this.state.infoIndex])
                lyp = y(cdata[this.state.infoIndex].price)

                // console.log('xp', lxp/width)
                
                // 0 = left border, 1 = right border
                if(lxp/width < 0.20){
                    lalm = -1;
                }

                // legend content                
                lcnt.push(dmyDateFormat(dates[this.state.infoIndex]))
                ldpl.push(false)
                lcnt.push('Close: $'+this.getAttributeAtIndex(cdata, this.state.infoIndex, 'price'))
                ldpl.push(true)
                if(this.props.display[0]){
                    lcnt.push('SMA20: '+this.getAttributeAtIndex(ma20data, this.state.infoIndex, 'price'))
                    ldpl.push(true)
                }
                if(this.props.display[1]){
                    lcnt.push('SMA50: '+this.getAttributeAtIndex(ma50data, this.state.infoIndex, 'price'))
                    ldpl.push(true)
                }
                if(this.props.display[2]){
                    lcnt.push('SMA200: '+this.getAttributeAtIndex(ma200data, this.state.infoIndex, 'price'))
                    ldpl.push(true)
                }
                // console.log(lcnt)
            }

            // TODO: resize: https://github.com/souporserious/react-measure
            return (
                <div onMouseLeave={this.mouseLeave} onMouseEnter={this.mouseEnter} onMouseMove={this.mouseMove} className={theme['lineChart']}>
                    <svg transform={transform} id={this.props.chartId} width={this.props.width} height={this.props.height}>
                        <Grid h={height} grid={xAxis} gridType="x"/>
                        <Grid h={height} grid={yAxis} gridType="y"/>
                        <g>
                            <path className={theme["line"]+" "+theme["shadow"]}
                                stroke={z('close')} 
                                d={line(cdata)} 
                                strokeLinecap="round"/>
                                
                            {this.props.display[0] ? <path className={theme["line"]+" "+theme["shadow"]} stroke={z('20d')} d={line(ma20data)} strokeLinecap="round"/>:null}
                            {this.props.display[1] ? <path className={theme["line"]+" "+theme["shadow"]} stroke={z('50d')} d={line(ma50data)} strokeLinecap="round"/>:null}
                            {this.props.display[2] ? <path className={theme["line"]+" "+theme["shadow"]} stroke={z('200d')} d={line(ma200data)} strokeLinecap="round"/>:null}
                                                        
                            <Positions id="positions" 
                                color={"rgba(70, 130, 180, 0.1)"} 
                                height={height} x={x} 
                                positions={positions}/>
                            <Positions id="me" 
                                color={"rgba(180, 70, 70, 0.1)"} 
                                height={height} x={x} 
                                positions={me}/>

                            
                            <HInfoLine yp={this.props.info.yh} xr={xrng} y={y} x={x} data={cdata} index={this.state.infoIndex}/>
                            <HInfoLine yp={this.props.info.yl} xr={xrng} y={y} x={x} data={cdata} index={this.state.infoIndex}/>
                            
                            {this.state.infoVisibility ? <VInfoLine yb={ymna} y={y} x={x} data={cdata} index={this.state.infoIndex}/>:null}
                            {this.state.infoVisibility ? <Legend align={lalm} x={lxp} y={lyp} colors={z} displayColors={ldpl} content={lcnt}/>:null}


                            {this.state.infoVisibility ? <Info x={x} y={y} index={this.state.infoIndex} data={cdata} fill={z('close')}/>:null}
                            {this.props.display[0] && this.state.infoVisibility ? <Info x={x} y={y} index={this.state.infoIndex} data={ma20data} fill={z('20d')}/>:null}
                            {this.props.display[1] && this.state.infoVisibility ? <Info x={x} y={y} index={this.state.infoIndex} data={ma50data} fill={z('50d')}/>:null}
                            {this.props.display[2] && this.state.infoVisibility ? <Info x={x} y={y} index={this.state.infoIndex} data={ma200data} fill={z('200d')}/>:null}                            
                        </g>
                    </svg>
                </div>
            )
        }
    }
});

export default LineChart
