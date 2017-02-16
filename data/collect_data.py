import os
import sys
import json
# pip install finsymbols
sys.path.append('/Users/manu/GitHub/finsymbols')
import finsymbols
import pandas as pd
# pip install pandas-datareader
import pandas_datareader.data as web
# from pandas.io import data, wb
from pandas.tseries.offsets import *
import datetime
from dateutil.relativedelta import relativedelta
import numpy as np
import urllib2
import csv

import matplotlib.pyplot as plt   # Import matplotlib
from matplotlib.dates import DateFormatter, WeekdayLocator,\
	DayLocator, MONDAY, date2num
from matplotlib.finance import candlestick_ohlc


start = datetime.datetime(2017, 1, 25)
end = datetime.date.today()
nasdaq = finsymbols.get_nasdaq_symbols()

def get_stock_info(symbol):
	for item in nasdaq:
		if item['symbol'] == symbol:
			return item

def get_stock_index(symbol):
	for i in range(len(nasdaq)):
		if nasdaq[i]['symbol'] == symbol:
			return i

def get_stock_symbols():
	return [item['symbol'] for item in nasdaq]

def get_all_tickers():
	nasdaq = os.path.join(os.path.dirname(__file__),'resources', 'companylist.csv')
	data = pd.read_csv(nasdaq)
	print list(data.columns)

	ctr = [x for x in list(data.columns) if x not in ['Symbol', 'Name']]
	data.drop(ctr, axis=1, inplace=True)
	
	# print data.tail

	result = {}
	for s, n in zip(data['Symbol'].values, data['Name'].values):
		result[s] = n

	out = os.path.join(os.path.dirname(__file__),'tickers.json')
	with open(out, 'w') as outfile:
		json.dump(result, outfile)

class Ticker(object):
	# collect all ticker data
	def __init__(self, ticker='TSLA', duration=520, verbose=True):
		self.ticker = ticker
		self.data_dir = os.path.join(os.path.dirname(__file__),'data')
		self.position_dir = os.path.join(os.path.dirname(__file__),'positions')
		self.data = None
		self.info = None
		self.duration = duration # duration in weeks
		self.verbose = verbose		

	def data_file(self):
		return os.path.join(self.data_dir, self.ticker+'.json')

	def data_exists(self):
		if not os.path.exists(self.data_file()):
			if self.verbose:
				print self.data_file(), 'does not exist'
			return False
		return True

	def write_data(self):
		# combine all data
		if self.verbose:
			print self.ticker, 'write_data' 

		data = {}
		data['structure'] = ['date']
		data['structure'].extend(self.data.columns.values)
		data['data'] = []

		entry = None
		for index, row in self.data.iterrows():
   			date_entry = [index.strftime('%d-%m-%Y')]
   			for column in self.data.columns.values:
   				date_entry.append(("%.2f" % row[column]))

   			data['data'].append(date_entry)
		
		combined = {}
		combined['info'] = self.info
		combined['data'] = data
		with open(self.data_file(), 'w') as outfile:
			json.dump(combined, outfile)

	def get_info(self):
		# collect general company information (name, category, ...)
		if self.verbose:
			print self.ticker, 'get_info'

		self.info = get_stock_info(self.ticker)

	def get_data(self, force=False):		
		# get_data through web.DataReader
		# NOTE: since this api is very limited to the amount of data we can query we'll
		# surely add additional methods in the future 
		if self.verbose:
			print self.ticker, 'get_data'

		end = datetime.date.today()
		start = end - relativedelta(weeks=self.duration)		
		self._ohlc_adj_(web.DataReader(self.ticker, "yahoo", start, end))

	def _ohlc_adj_(self, dat):
		# This function adjusts stock data for splits, dividends, etc., returning a data frame with
		# "Open", "High", "Low" and "Close" columns. The input DataFrame is similar to that returned
		# by pandas Yahoo! Finance API.    
		self.data = pd.DataFrame({"open": dat["Open"] * dat["Adj Close"] / dat["Close"],
					   "high": dat["High"] * dat["Adj Close"] / dat["Close"],
					   "low": dat["Low"] * dat["Adj Close"] / dat["Close"],
					   "close": dat["Adj Close"], "volume": dat['Volume']})
	def _ma_(self):
		self.data["20d"] = np.round(self.data["close"].rolling(window = 20, center = False).mean(), 2)
		self.data["50d"] = np.round(self.data["close"].rolling(window = 50, center = False).mean(), 2)
		self.data["200d"] = np.round(self.data["close"].rolling(window = 200, center = False).mean(), 2)

	def get_indicators(self):
		if self.verbose:
			print self.ticker, 'get_indicators'

		self._ma_()

	def position_file(self):
		return os.path.join(self.position_dir, self.ticker+'.json')

	def position_exists(self):
		if not os.path.exists(self.position_file()):
			if self.verbose:
				print self.position_file(), 'does not exist'
			return False
		return True

	def get_positions(self):
		ma_diff_str = "20d - 50d"
		self.data[ma_diff_str] = self.data["20d"] - self.data["50d"]
		self.data["regime"] = np.where(self.data[ma_diff_str] > 0, 1, 0)
		self.data["regime"] = np.where(self.data[ma_diff_str] < 0, -1, self.data["regime"])

		# To ensure that all trades close out, I temporarily change the regime of the last row to 0
		regime_orig = self.data.ix[-1, "regime"]
		# self.data.ix[-1, "regime"] = 0
		self.data["signal"] = np.sign(self.data["regime"] - self.data["regime"].shift(1))
		# # Restore original regime data
		self.data.ix[-1, "regime"] = regime_orig
		
		signals = pd.concat([
            pd.DataFrame({"price": self.data.loc[self.data["signal"] == 1, "close"],
                         "regime": self.data.loc[self.data["signal"] == 1, "regime"],
                         "signal": "open"}),
            pd.DataFrame({"price": self.data.loc[self.data["signal"] == -1, "close"],
                         "regime": self.data.loc[self.data["signal"] == -1, "regime"],
                         "signal": "close"}),
        ])		
		signals.index = pd.MultiIndex.from_product([signals.index], names = ["date", "symbol"])
		signals.sort_index(inplace = True)
		signals.drop('regime', axis=1, inplace=True)
		self.positions = signals

	def last_position(self):
		return self.positions['signal'][-1]

	def write_positions(self):
		if self.verbose:
			print self.ticker, 'write_position'

		data = {}
		data['structure'] = ['date']
		data['structure'].extend(self.positions.columns.values)
		data['data'] = []

		entry = None
		for index, row in self.positions.iterrows():
   			date_entry = [index.strftime('%d-%m-%Y')]
   			for column in self.positions.columns.values:
   				if type(row[column]) == str:
   					date_entry.append(row[column])
   				else:
   					date_entry.append(("%.2f" % row[column]))

   			data['data'].append(date_entry)

   		with open(self.position_file(), 'w') as outfile:
			json.dump(data, outfile)

		if self.verbose:
			print 'done writing', self.position_file()

	def collect_data(self):
		self.get_data()
		self.get_info()
		self.get_indicators()
		self.write_data()

		return self

	def collect_positions(self):
		self.get_data()
		self.get_indicators()
		self.get_positions()
		self.write_positions()

		return self

def get_all_tickers():
	# get all of price data for each NASDAQ stock
	for item in get_stock_symbols():
		print item
		try:
			Ticker(item).collect_data()
		except:
			print 'Failed to generate data for', item

def get_some_tickers(tickers=['BABA', 'FB', 'MSFT', 'NVDA', 'DIS', 'AMD', 'TSLA', 'GOOGL', 'INTC']):
	# get all of the price data for the given NASDAQ tickers	
	for item in tickers:
		Ticker(item).collect_data()

def get_some_positions(tickers=['BABA', 'FB', 'MSFT', 'NVDA', 'DIS', 'AMD', 'TSLA', 'GOOGL', 'INTC']):
	_open = []
	for item in tickers:
		try:
			_ticker = Ticker(ticker=item, verbose=False).collect_positions()
			if _ticker.last_position() == 'open':
				_open.append(item)
		except:
			pass


	print 'open positions:', len(_open), _open

def get_all_positions():
	get_some_positions(get_stock_symbols())

# get_some_tickers()
# print Ticker('NVDA').collect_data()
# print Ticker('NVDA').collect_positions()
# get_some_positions()
get_all_tickers()
get_all_positions()
