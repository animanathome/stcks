import numpy as np
import pandas as pd
import pandas_datareader.data as web
from datetime import date, datetime, timedelta
from get_ticker_info import get_all_tickers, get_ticker_info

def ticker_performance(symbol='TSLA', day_range=364):
	start = datetime.today() - timedelta(days=day_range+50)
	end = date.today()

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
	dv = ((fcd['close'][-1]/fcd['close'].max())-1)*100
	if dv >= 0:
		return

	# get the difference between the current price and last weeks
	# get a stock with is recovinger
	if csd['5dm'][-1] < 0:
		return


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
	print sort_tickers()
	# print ticker_performance()