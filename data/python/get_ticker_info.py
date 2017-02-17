import os
import pandas as pd
from yahoo_finance import Share
import json

def get_all_tickers(save_to_file=True):
	nasdaq = os.path.join(os.path.dirname(__file__), '..', 'resources', 'companylist.csv')
	data = pd.read_csv(nasdaq)
	print list(data.columns)

	ctr = [x for x in list(data.columns) if x not in ['Symbol', 'Name']]
	data.drop(ctr, axis=1, inplace=True)
	
	# print data.tail

	result = {}
	for s, n in zip(data['Symbol'].values, data['Name'].values):
		result[s] = n

	if save_to_file:
		out = os.path.join(os.path.dirname(__file__),'tickers.json')
		with open(out, 'w') as outfile:
			json.dump(result, outfile)

	return result

def get_ticker_value(symbol='TSLA'):
	# Unable to get the current ticker price through this API
	ticker = Share(symbol)
	ticker.refresh()
	print dir(ticker)
	print ticker.get_open()
	print ticker.get_price()
	# print ticker.get_book_value()
	# print ticker.get_ebitda()

def get_ticker_value_info(symbol='TSLA'):
	# get additional ticker value data
	ticker = Share(symbol)
	return {
		'mkt':ticker.get_market_cap(),
		'yh':ticker.get_year_high(),
		'yl':ticker.get_year_low()
	} 
	
def get_ticker_info(symbol='TSLA'):	
	# get symbol, name, sector, marketcap and industry from the given NASDAQ ticker
	# print 'get_ticker_info', symbol

	# Data retrieved from: http://www.nasdaq.com/screening/companies-by-industry.aspx?industry=Basic+Industries
	# Direct download through: http://www.nasdaq.com/screening/companies-by-industry.aspx?industry=Basic%20Industries&exchange=NASDAQ&render=download
	companyFile = os.path.join(os.path.dirname(__file__), '..', 'resources', 'companylist.csv')
	
	# print file_list
	# print 'reading in', companyFile
	data = pd.read_csv(companyFile)
	try:
		index = data['Symbol'][data['Symbol'] == symbol].index[0]

		# NOTE: the command below seems to reorder the rows 
		# data.drop(["Symbol", "IPOyear", "ADR TSO", "Summary Quote", "Unnamed: 9"], axis=1, inplace=True)		
		return {'nme': data.iloc[index]['Name'], 
				'sbl':symbol, 
				'mkc':data.iloc[index]['MarketCap'], 
				'str':data.iloc[index]['Sector'], 
				'ids':data.iloc[index]['industry']
				}
	except:
		# symbol is not part of the file...
		pass

if __name__ == '__main__':
	result = get_ticker_value_info()
	print 'result:', result