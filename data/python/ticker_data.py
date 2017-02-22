import os
import json
import numpy as np
import pandas as pd
import pandas_datareader.data as web
from pandas.tseries.offsets import *
import datetime
from dateutil.relativedelta import relativedelta
from data import Data
from ticker_info import get_all_tickers

class TickerData(Data):
	# collect all ticker data
	def __init__(self, ticker='TSLA', duration=520, subdir='data', verbose=True):
		super(TickerData, self).__init__(ticker, subdir, verbose)
		self.duration = duration

	def _ohlc_adj_(self, dat):
		# This function adjusts stock data for splits, dividends, etc., returning a data frame with
		# "Open", "High", "Low" and "Close" columns. The input DataFrame is similar to that returned
		# by pandas Yahoo! Finance API.    
		self.data = pd.DataFrame({"open": dat["Open"] * dat["Adj Close"] / dat["Close"],
					   "high": dat["High"] * dat["Adj Close"] / dat["Close"],
					   "low": dat["Low"] * dat["Adj Close"] / dat["Close"],
					   "close": dat["Adj Close"], "volume": dat['Volume']})

	def get_data(self, force=False):
		# get_data through web.DataReader
		# NOTE: since this api is very limited to the amount of data we can query we'll
		# surely add additional methods in the future 
		if self.verbose:
			print self.ticker, 'get_data'

		end = datetime.date.today()
		start = end - relativedelta(weeks=self.duration)		
		self._ohlc_adj_(web.DataReader(self.ticker, "yahoo", start, end))

	def _ma_(self):
		self.data["20sma"] = np.round(self.data["close"].rolling(window = 20, center = False).mean(), 2)
		self.data["50sma"] = np.round(self.data["close"].rolling(window = 50, center = False).mean(), 2)
		self.data["200sma"] = np.round(self.data["close"].rolling(window = 200, center = False).mean(), 2)

	def _bb_(self):
		 # deviation
		self.data['dev'] = self.data['close'] - self.data['20sma']
		# deviation squared
		self.data['devs'] = self.data['dev']**2 
		# 20 day period average of deviation squared
		self.data['20ddevs'] = self.data['devs'].rolling(20).sum()/20 
		# standard deviation
		self.data['sdev'] = self.data['20ddevs'].apply(np.sqrt) 
		# bollinger upper band
		self.data['bub'] = self.data["20sma"] + (self.data['sdev'] *2) 
		# bolling lower band
		self.data['blb'] = self.data["20sma"] - (self.data['sdev'] *2) 

	def get_indicators(self):
		if self.verbose:
			print self.ticker, 'get_indicators'

		self._ma_()
		self._bb_()

	def get_overlays(self):
		# get out (sell) position value
		pass

	def collect_data(self):
		self.get_data()
		self.get_indicators()
		self.write_data()
		return self

def get_some_ticker_data(tickers=['BABA', 'FB', 'MSFT', 'NVDA', 'DIS', 'AMD', 'TSLA', 'GOOGL', 'INTC']):
	for ticker in tickers:
		try:
			TickerData(ticker).collect_data()
		except:			
			pass

def get_all_ticker_data():
	for ticker in get_all_tickers(False):
		try:
			TickerData(ticker).collect_data()
		except:			
			pass

if __name__ == '__main__':
	# result = get_ticker_value_info()
	# print 'result:', result
	# TickerInfo().collect_data()
	get_some_ticker_data()
