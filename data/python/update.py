import os
import sys
import json
import pandas as pd
import pandas_datareader.data as web
from datetime import date, datetime, timedelta
from get_ticker_info import get_ticker_info, get_ticker_value_info

def active_tickers():
	# get all active tickers
	config = os.path.join(os.path.dirname(__file__), '..', 'config.json')

	if not os.path.exists(config):
		raise Exception('File '+config+' does not exist')

	with open(config) as data_file:    
		data = json.load(data_file)

	return data['stocks']

def ticker_position(ticker, current_price):
	# print 'ticker_position', ticker, current_price

	# get the active position for the given ticker
	# returns the size of the position + the average price
	_file = os.path.join(os.path.dirname(__file__), '../me', ticker+'.json')

	if not os.path.exists(_file):
		raise Exception('File '+_file+' does not exist')

	with open(_file) as data_file:    
		data = json.load(data_file)

	# collect all added open positions
	quantity = 0
	position_count = 0
	price = 0
	structure = data['structure']
	for position in reversed(data['data']):
		if position[structure.index('signal')] != 'open':
			break

		quantity += int(position[structure.index('quantity')])
		position_count += 1
		price += float(position[structure.index('price')])

	# average price
	price /= float(position_count)

	# gain/loss
	gl = current_price - price
	tgl = '{:.2f}'.format(quantity * gl)
	glp = '{:.2f}%'.format(((current_price/price)-1)*100)

	result =  {'price':price, 'quantity':quantity, 'gl':tgl, 'glp': glp}
	return result

def today():
	# get a stock update for each active stock
	stocks = []	
	start = datetime.today() - timedelta(days=2)
	end = date.today()

	for item in active_tickers():
		#  get ticker price data
		stock_pd = web.DataReader(item, "yahoo", start, end)
		y_v = stock_pd['Close'].values[-2]
		# current price
		t_v = stock_pd['Close'].values[-1]
		# yesterday's price change
		d_v = '{:.2f}'.format(t_v - y_v)
		# yesterday's price change in percentage
		d_p = '{:.2f}%'.format(((t_v/y_v)-1)*100)

		obj = {		
			'prc': '{:.2f}'.format(t_v),
			'dv': d_v,					
			'dp': d_p
		}

		# get ticker info
		stock_si = get_ticker_info(item)
		if stock_si:
			company = stock_si['nme']
		else:
			company = item

		obj.update({
			'sbl': item,
			'nme': company
		})
		
		# get value of ticker position
		try:
			stock_ps = ticker_position(item, t_v)
			if stock_ps:
				obj.update({
					'app': stock_ps['price'],
					'pq': stock_ps['quantity'],
					'pgl': stock_ps['gl'],
					'pglp': stock_ps['glp']
				})
		except Exception as message:
			# print message
			pass

		# get additional ticker value data
		try:
			stock_pd = get_ticker_value_info(item)
			if stock_pd:
				obj.update({
					'mkt': stock_pd['mkt'],
					'yh': stock_pd['yh'],
					'yl': stock_pd['yl']
				})
		except Exception as message:
			# print message
			pass

		stocks.append(obj)

	# print stocks

	today = os.path.join(os.path.dirname(__file__), '..', 'today.json')
	with open(today, 'w') as outfile:
		json.dump(stocks, outfile)

if __name__ == '__main__':
	today()