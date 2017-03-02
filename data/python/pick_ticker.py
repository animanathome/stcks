import numpy as np
import pandas as pd
import pandas_datareader.data as web
from datetime import date, datetime, timedelta
from get_ticker_info import get_all_tickers, get_ticker_info


import time                                                
 
def timeit(method):
	def timed(*args, **kw):
		ts = time.time()
		result = method(*args, **kw)
		te = time.time()

		print '%r (%r, %r) %2.2f sec' % (method.__name__, args, kw, te-ts)
		return result

	return timed

def ticker_performance_1(**kwargs):
	# print 'ticker_performance_1', kwargs
	# TODO: open up the range so we can have selec the stock the moment
	# it's moving average is picking up again.

	symbol = 'TSLA'
	if 'symbol' in kwargs:
		symbol = kwargs['symbol']

	day_range = 200
	if 'day_range' in kwargs:
		day_range = kwargs['day_range']
	day_range+= 200
	# print 'day_range:', day_range

	day_offset = 0
	if 'day_offset' in kwargs:
		day_offset = kwargs['day_offset']

	verbose = False
	if 'verbose' in kwargs:
		verbose = kwargs['verbose']

	start = datetime.today() - timedelta(days=day_range+day_offset)
	end = date.today() - timedelta(days=day_offset)

	rsd = web.DataReader(symbol, "yahoo", start, end)
	csd = pd.DataFrame({"open": rsd["Open"] * rsd["Adj Close"] / rsd["Close"],
					   "high": rsd["High"] * rsd["Adj Close"] / rsd["Close"],
					   "low": rsd["Low"] * rsd["Adj Close"] / rsd["Close"],
					   "close": rsd["Adj Close"], "volume": rsd['Volume']})

	# get moving average
	csd["20d"] = np.round(csd["close"].rolling(window = 20, center = False).mean(), 2)
	csd["50d"] = np.round(csd["close"].rolling(window = 50, center = False).mean(), 2)
	csd["200d"] = np.round(csd["close"].rolling(window = 200, center = False).mean(), 2)

	# 50 day moving average momentum
	csd["20dm"] = csd["20d"] - csd["20d"].shift(1)
	csd["50dm"] = csd["50d"] - csd["50d"].shift(1)
	csd["200dm"] = csd["200d"] - csd["200d"].shift(1)

	if verbose:
		print '\t20dm:', csd['20dm'][-1]
		print '\t50dm:', csd['50dm'][-1]
		print '\t200dm:', csd['200dm'][-1]

	if csd['20dm'][-1] < .25:
		# print '20dm escape...'
		return None

	if csd['50dm'][-1] < .225:
		# print '50dm escape...'
		return None

	if csd['200dm'][-1] < .2:
		# print '200dm escape...'
		return None

	fcd = csd[200:]

	sv = fcd['close'][0]
	ev = fcd['close'][-1] 
	df = ev - sv
	pc = (df/sv)*100

	if verbose:
		print '\tstart value:', sv
		print '\tend value:', ev
		print '\tend change:', df
		print '\tpercentage change:', '{:.2f}%'.format(pc)

	return pc

def ticker_performance_2(**kwargs):
	print 'ticker_performance_2', kwargs
	
	symbol = 'TSLA'
	if 'symbol' in kwargs:
		symbol = kwargs['symbol']

@timeit
def test_ticker_performance(method=None, day_range=200, day_offset=200, sample_size=1, verbose=False):
	results = {}
	tickers = get_all_tickers(False)	
	stickers = sorted(tickers.keys())

	if sample_size == -1 or sample_size > len(stickers):
		sample_size = len(stickers)

	for i in range(sample_size):
		try:
			result = method(symbol=stickers[i], 
							day_range=day_range,
							day_offset=day_offset, 
							verbose=verbose)
			if result:
				results[stickers[i]] = result
		except:
			pass

	sresults = sorted(results, key=results.get)
	sresults.reverse()
	return sresults

def ticker_performance(symbol='TSLA', day_range=364):
	start = datetime.today() - timedelta(days=(2*day_range)+50)
	end = date.today() - timedelta(days=day_range+50)

	rsd = web.DataReader(symbol, "yahoo", start, end)
	csd = pd.DataFrame({"open": rsd["Open"] * rsd["Adj Close"] / rsd["Close"],
					   "high": rsd["High"] * rsd["Adj Close"] / rsd["Close"],
					   "low": rsd["Low"] * rsd["Adj Close"] / rsd["Close"],
					   "close": rsd["Adj Close"], "volume": rsd['Volume']})

	# get moving average
	csd["5d"] = np.round(csd["close"].rolling(window = 20, center = False).mean(), 2)
	csd["20d"] = np.round(csd["close"].rolling(window = 20, center = False).mean(), 2)
	csd["50d"] = np.round(csd["close"].rolling(window = 50, center = False).mean(), 2)

	# 50 day moving average momentum
	csd["50dm"] = csd["50d"] - csd["50d"].shift(1)
	csd["20dm"] = csd["20d"] - csd["20d"].shift(1)
	csd["5dm"] = csd["5d"] - csd["5d"].shift(1)

	fcd = csd[50:]

	# get the mean momentum for the year
	# get an overall positive momentum
	om = fcd['50dm'].mean()
	if om < 0:
		return

	# get the difference between years max and current value
	# get a stock which is currently below its previously max value
	# dv = ((fcd['close'][-1]/fcd['close'].max())-1)*100
	# if dv >= 0:
	# 	return

	# get the difference between the current price and last weeks
	# get a stock with is recovinger
	# if csd['5dm'][-1] < 0:
	# 	return


	# print symbol, om, dv	
	return om, dv

def sort_tickers():
	tickers = get_all_tickers(False)	
	stickers = sorted(tickers.keys())
	
	perf = {}
	fperf = {}
	for ticker in stickers:
		try:
			m, v = ticker_performance(ticker)
		except:
			continue

		if m < 0:
			continue
		
		perf[ticker] = m
		fperf[ticker] = {'m':m, 'pvd':v}

	sperf = sorted(perf, key=perf.get)
	sperf.reverse()
	for idx, item in enumerate(sperf[:50]):
		print idx, get_ticker_info(item)['str'], '[', item, '] m:', fperf[item]['m'], 'pvd:', '{:.2f}%'.format(fperf[item]['pvd'])

if __name__ == '__main__':
	# print sort_tickers()
	# print ticker_performance()

	# ticker_performance_1()
	# ticker_performance_1(symbol='AAPL', verbose=True)
	print test_ticker_performance(method=ticker_performance_1, day_range=200, day_offset=200, sample_size=-1)