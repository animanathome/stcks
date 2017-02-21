var fs = require('fs');
var path = require('path');
var jsonfile = require('jsonfile');
var pythonShell = require('python-shell');
var options = {
  scriptPath: path.join(__dirname, '../../..', 'data', 'python')
};

var stock = (function(){

	var get_json_file = function(jsonPath){		
		if(fs.existsSync(jsonPath)){
			console.log('file', jsonPath, 'exists')
			var jsonString = fs.readFileSync(jsonPath, 'utf8');
			return jsonString
		}else{
			console.log('file', jsonPath, 'does NOT exists')
		}
	}	

	var all_tickers = function(){
		// all NASDAQ tickers
		var jsonPath = path.join(__dirname, '../../..', 'data', 'tickers.json');
		return get_json_file(jsonPath)
	}

	var add_ticker = function(tickers, callback){
		// add a ticker to our follow list
		console.log('add_ticker', tickers)

		// update follow list (add)
		var jsonPath = path.join(__dirname, '../../..', 'data', 'config.json')
		var data = get_json_file(jsonPath)
		var jdata = JSON.parse(data)
		var index = 0;
		for(var i = 0; i < tickers.length; i++){
			if(jdata.stocks.indexOf(tickers[i]) != -1){
				continue
			}
			jdata.stocks.push(tickers[i])			
		}
		fs.writeFileSync(jsonPath, JSON.stringify(jdata))

		// update ticker info for our updated list
		pythonShell.run('update.py', options, function (err, results) {
			if (err){
				throw err;
			}else{
				if(callback){
					callback()
				}	
			}
		});
	}

	var remove_ticker = function(tickers, callback){
		// remove a ticker from our follow list
		console.log('remove_ticker', tickers)

		// update follow list (remove)
		var jsonPath = path.join(__dirname, '../../..', 'data', 'config.json')
		var data = get_json_file(jsonPath)
		var jdata = JSON.parse(data)
		for(var i = 0; i < tickers.length; i++){
			index = jdata.stocks.indexOf(tickers[i])
			if(index != -1){
				console.log('removing', tickers[i])
				jdata.stocks.splice(index, 1)
			}
		}
		console.log(jdata)
		fs.writeFileSync(jsonPath, JSON.stringify(jdata))

		// update ticker info for our updated list
		pythonShell.run('update.py', options, function (err, results) {
			if (err){
				throw err;
			}else{
				if(callback){
					callback()
				}	
			}
		});
	}

	var all_positions = function(position_type, date){
		// get the position for the given date		
		console.log('all_positions', position_type, date)
		
		// position_type can be: existing, upcoming or leaving		
		var jsonPath = path.join(__dirname, '../../..', 'data', 'today.json');
		return get_json_file(jsonPath)
	}

	var add_position = function(ticker, date, price, position, amount){
		// TSLA, 20-12-2016, $100, 20, open
		var jsonPath = path.join(__dirname, '../../..', 'data', 'me', ticker+'.json');

		var obj={}
		if(fs.existsSync(jsonPath)){
			console.log('file', jsonPath, 'exists')
			var jsonString = fs.readFileSync(jsonPath, 'utf8');
			obj = JSON.parse(jsonString)
			obj.data.push([date, price, position, amount])
		}else{
			obj = {
				structure:["date", "price", "signal", "quantity"],
				data:[[date, price, position, amount]]
			}
		}		

		fs.writeFileSync(jsonPath, JSON.stringify(obj))
	}

	var positions = function(ticker, user){
		// user can currently be me or positions
		if(user == undefined){
			user = 'positions'
		}

		// get all positions for the given ticker
		var jsonPath = path.join(__dirname, '../../..', 'data', user, ticker+'.json');
		return get_json_file(jsonPath)
	}

	var info = function(ticker){
		var jsonPath = path.join(__dirname, '../../..', 'data', 'info', ticker+'.json');
		return get_json_file(jsonPath)	
	}

	var data = function(symbol, indicators, duration){
		// get all price data for the given ticker
		var jsonPath = path.join(__dirname, '../../..', 'data', 'data', symbol+'.json');
		return get_json_file(jsonPath)
	}

	return {
		all_positions: all_positions,
		all_tickers: all_tickers,
		info: info,
		data: data,
		positions: positions,
		add_position: add_position,
		add_ticker: add_ticker,
		remove_ticker: remove_ticker
	}
})()

// export function for listening to the socket
module.exports = function (socket) {

	// send the new user their name and a list of users
	socket.emit('init', {
		action: 'init'
	});

	// clean up when a user leaves, and broadcast it to other users
	socket.on('disconnect', function () {
			console.log('disconnect')
	});

	//	-----------------------------------------
	// tickers

	socket.on('stock:get_tickers', function(data){
		// get all tickers (symbol + name)
		socket.emit('stock:get_tickers', {
			stock_list: stock.all_tickers()
		})
	})

	socket.on('stock:add_ticker', function(data){
		// add a new ticker
		console.log('add_ticker', data)
		stock.add_ticker(data.ticker, function(){
			// once we're added the new ticker(s), update client list
			var stock_data = stock.all_positions(data.position, data.date)
			console.log('result', stock_data)
			socket.emit('stock:get_positions', {
				stock_list: stock_data
			})
		})
	})

	socket.on('stock:remove_ticker', function(data){
		// remove a ticker
		console.log('remove ticker', data)
		stock.remove_ticker(data.ticker, function(){
			var stock_data = stock.all_positions(data.position, data.date)
			console.log('result', stock_data)
			socket.emit('stock:get_positions', {
				stock_list: stock_data
			})
		})
	})

	socket.on('stock:get_ticker_data', function(data){
		console.log('get_ticker_data', data)
		
		var result = {}
		var stock_data = stock.data(data.symbol, data.indicators, data.duration)

		if(stock_data){
			result = {
				stock_data: stock_data,
				user: data.user,
				stock: data.symbol
			}	
		}else{
			result = {
				error: 'No data available'
			}
		}
		// console.log('returning', result)
		socket.emit('stock:get_ticker_data', result)
	})

	socket.on('stock:get_ticker_positions', function(data){
		console.log('get_ticker_positions', data)

		var result = {}
		var stock_data = stock.positions(data.symbol, data.user)
		if(stock_data){
			result = {
				stock_data: stock_data,
				user: data.user,
				stock: data.symbol
			}	
		}else{
			result = {
				error: 'No data available'
			}
		}
		console.log('returning', result)
		socket.emit('stock:get_ticker_positions', result)
	})

	//	-----------------------------------------
	//	info
	socket.on('stock:get_info', function(data){
		// get all positions
		console.log('get_info', data)

		var stock_data = stock.info()
		console.log('result', stock_data)
		socket.emit('stock:get_info', {
			info: stock_data
		})
	})	

	//	-----------------------------------------
	// positions
	socket.on('stock:add_position', function(data){
		console.log('add_position', data)

		// add position to ticker
		stock.add_position(data.ticker, data.date, data.price, data.signal, data.quantity)

		// return updated list
		var stock_data = stock.positions(data.ticker, 'me')
		if(stock_data){
			result = {
				stock_data: stock_data,
				user: data.user
			}	
		}else{
			result = {
				error: 'No data available'
			}
		}
		console.log('returning', result)
		socket.emit('stock:get_ticker_positions', result)
	})	

	socket.on('stock:get_positions', function(data){
		// get all positions
		console.log('get_positions', data)

		var stock_data = stock.all_positions(data.position, data.date)
		console.log('result', stock_data)
		socket.emit('stock:get_positions', {
			stock_list: stock_data
		})
	})	
};