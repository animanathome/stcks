import os
import sys
import json
import math
import pandas as pd
import pandas_datareader.data as web
from datetime import date, datetime, timedelta
from ticker_info import get_ticker_info, get_ticker_value_info
from ticker_positions import ticker_position, active_positions
from ticker_data import TickerData, get_some_ticker_data

def details():
	get_some_ticker_data(active_positions())

def blurp(ticker):
	print 'blurp', ticker

	start = datetime.today() - timedelta(days=90)
	end = date.today()

	stock_pd = web.DataReader(ticker, "yahoo", start, end)
	
	# print stock_pd['Close']
	y_v = stock_pd['Close'].values[-2]
	# current price
	t_v = stock_pd['Close'].values[-1]
	# yesterday's price change
	d_v = '{:.2f}'.format(t_v - y_v)
	# yesterday's price change in percentage
	d_p = '{:.2f}%'.format(((t_v/y_v)-1)*100)

	obj = {		
		'prc': float('{:.2f}'.format(t_v)),
		'dv': float(d_v),					
		'dp': d_p
	}

	# get an array showing the change in value for the last 3 months by taking one data point at the end of each week
	pdl = stock_pd.shape[0]
	np = int(math.floor(pdl/5))
	
	# index array
	ida = [(pdl - (i*5))-1 for i in range(np)]
	ida.reverse()

	# close value array
	cvc = [float("{:.2f}".format(stock_pd['Close'].values[i])) for i in ida]
	obj.update({'cvc':cvc})

	# get ticker info
	stock_si = get_ticker_info(ticker)
	if stock_si:
		company = stock_si['nme']
		sector = stock_si['str']
	else:
		company = ticker
		sector = 'Miscellaneous'

	obj.update({
		'sbl': ticker,
		'nme': company,
		'str': sector
	})
	
	# get value of ticker position
	try:
		stock_ps = ticker_position(ticker, t_v)
		if stock_ps:
			obj.update({
				'app': stock_ps['price'],
				'pq': stock_ps['quantity'],
				'pgl': float(stock_ps['gl']),
				'pglp': stock_ps['glp']
			})
	except Exception as message:
		# print message
		pass

	# get additional ticker value data
	try:
		stock_pd = get_ticker_value_info(ticker)
		if stock_pd:
			obj.update({
				'mkt': stock_pd['mkt'],
				'yh': float(stock_pd['yh']),
				'yl': float(stock_pd['yl'])
			})
	except Exception as message:
		# print message
		pass

	return obj

def today():
	# get a stock update for each active stock
	stocks = []	
	start = datetime.today() - timedelta(days=90)
	end = date.today()

	for item in active_positions():
		stocks.append(blurp(item))

	# print stocks
	data = {
		'date': end.strftime('%m-%d-%Y'),
		'stocks':stocks
	}

	today = os.path.join(os.path.dirname(__file__), '..', 'today.json')
	with open(today, 'w') as outfile:
		json.dump(data, outfile)

if __name__ == '__main__':
	# print blurp('TSLA')
	today()
	details()
	# print balance()