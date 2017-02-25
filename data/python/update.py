import os
import sys
import json
import pandas as pd
import pandas_datareader.data as web
from datetime import date, datetime, timedelta
from ticker_info import get_ticker_info, get_ticker_value_info
from ticker_positions import ticker_position, active_positions
from ticker_data import TickerData

# def balance():
# 	# get the total value of all positions
# 	spv = {}
# 	tv = 0
# 	ap = active_positions()
# 	for item in ap:
# 		t = TickerData(item).init()
# 		cp = float(t.get_value('close', -1)); # current price	
# 		pd = ticker_position(item, cp); # position data	
# 		pv = pd['quantity'] * cp; # position value
# 		spv[item] = {'pv':pv}		
# 		tv += pv; # total value

# 	for item in ap:
# 		pp = '{:.2f}%'.format((spv[item]['pv']/tv)*100)
# 		spv[item].update({'pp':pp})

# 	return spv

def today():
	# get a stock update for each active stock
	stocks = []	
	start = datetime.today() - timedelta(days=4)
	end = date.today()

	for item in active_positions():
		# print item 
		#  get ticker price data
		stock_pd = web.DataReader(item, "yahoo", start, end)
		# print stock_pd['Close']
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
			sector = stock_si['str']
		else:
			company = item
			sector = 'Miscellaneous'

		obj.update({
			'sbl': item,
			'nme': company,
			'str': sector
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
	# print balance()