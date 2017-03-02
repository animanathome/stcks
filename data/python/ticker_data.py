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

# https://pypi.python.org/pypi/TA-Lib/
# https://mrjbq7.github.io/ta-lib/doc_index.html
from talib import abstract

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
		start = end - relativedelta(days=self.duration)		
		self._ohlc_adj_(web.DataReader(self.ticker, "yahoo", start, end))
		self.data.reset_index(level=0, inplace=True)

	def get_overlap_studies(self):
		# https://mrjbq7.github.io/ta-lib/func_groups/overlap_studies.html
		if self.verbose:
			print self.ticker, 'get_overlap_studies'

		_a = ['open', 'high', 'low', 'close', 'volume']
		inputs = {_a[i]:self.data[_a[i]].values for i in range(len(_a))}
		
		# simple moving average
		self.data['os_sma_20'] = abstract.SMA(inputs, timeperiod=20)
		self.data['os_sma_50'] = abstract.SMA(inputs, timeperiod=50)
		self.data['os_sma_200'] = abstract.SMA(inputs, timeperiod=200)

		# bollinger bands
		self.data['os_bbu_20'], self.data['os_bbm_20'], self.data['os_bbl_20'] = abstract.BBANDS(inputs, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)

		# double exponential moving average
		self.data['os_dema_20'] = abstract.DEMA(inputs, timeperiod=20)

		# exponential moving average
		self.data['os_ema_20'] = abstract.EMA(inputs, timeperiod=20)

		# midpoint over period
		self.data['os_mp_14'] = abstract.MIDPOINT(inputs, timeperiod=14)

		# parabolic SAR
		self.data['os_sar'] = abstract.SAR(inputs, acceleration=0, maximum=0)

		# triple exponential moving average
		self.data['os_tema_5'] = abstract.TEMA(inputs, timeperiod=5)

		# triangular moving average
		self.data['os_trima_30'] = abstract.TRIMA(inputs, timeperiod=30)

		# weighted moving average
		self.data['os_wma_30'] = abstract.WMA(inputs, timeperiod=30)	

	def get_momentum_indicators(self):
		# https://mrjbq7.github.io/ta-lib/func_groups/momentum_indicators.html
		if self.verbose:
			print self.ticker, 'get_momentum_indicators'

		_a = ['open', 'high', 'low', 'close', 'volume']
		inputs = {_a[i]:self.data[_a[i]].values for i in range(len(_a))}

		# average directional movement index
		self.data['mi_adx_14'] = abstract.ADX(inputs, timeperiod=14)

		# average directional movement index rating
		self.data['mi_adxr_14'] = abstract.ADX(inputs, timeperiod=14)

		# absolute price oscillator
		self.data['mi_apo'] = abstract.APO(inputs, fastperiod=12, slowperiod=26, matype=0)

		# aroon
		self.data['mi_aroon_d'], self.data['mi_aroon_u'] = abstract.AROON(inputs, timeperiod=14)

		# aroon oscillator
		self.data['mi_aroonosc'] = abstract.AROONOSC(inputs, timeperiod=14)

	def get_volume_indicators(self):
		# https://mrjbq7.github.io/ta-lib/func_groups/volume_indicators.html
		pass

	def get_volatility_indicators(self):
		# https://mrjbq7.github.io/ta-lib/func_groups/volatility_indicators.html
		pass

	def get_overlays(self):
		# get out (sell) position value
		pass

	def collect_data(self):
		self.get_data()
		self.get_overlap_studies()
		self.get_momentum_indicators()
		self.get_volume_indicators()
		self.get_volatility_indicators()
		# self.write_data()
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
