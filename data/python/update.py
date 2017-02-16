import os
import sys
import json
import pandas as pd
import pandas_datareader.data as web
import datetime
from get_ticker_info import get_ticker_info

def today():
	# get a stock update for each active stock
	stocks = []
	start = datetime.datetime(2017, 1, 25)
	end = datetime.date.today()

	config = os.path.join(os.path.dirname(__file__), '..', 'config.json')

	if not os.path.exists(config):
		raise Exception('File '+config+' does not exist')

	with open(config) as data_file:    
		data = json.load(data_file)
	
	for item in data['stocks']:
		stock_pd = web.DataReader(item, "yahoo", start, end)
		y_v = stock_pd['Close'].values[-2]
		t_v = stock_pd['Close'].values[-1]
		d_v = '{:.2f}'.format(t_v - y_v)	
		d_p = '{:.2f}%'.format(((t_v/y_v)-1)*100)

		stock_si = get_ticker_info(item)
		if stock_si:
			company = stock_si['name']
		else:
			company = item

		obj = {
			'sbl': item,
			'nme': company,
			'prc': '{:.2f}'.format(t_v),
			'dv': d_v,
			'dp': d_p
		}
		stocks.append(obj)

	today = os.path.join(os.path.dirname(__file__), '..', 'today.json')
	with open(today, 'w') as outfile:
		json.dump(stocks, outfile)

if __name__ == '__main__':
	today()