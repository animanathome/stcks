import os
import json
import numpy as np
import pandas as pd
from data import Data
from ticker_data import TickerData

def balance():
	# get the total value of all positions
	spv = {}
	tv = 0
	ap = active_positions()
	for item in ap:
		t = TickerData(item).init()
		cp = float(t.get_value('close', -1)); # current price	
		pd = ticker_position(item, cp); # position data	
		pv = pd['quantity'] * cp; # position value
		spv[item] = {'pv':pv}		
		tv += pv; # total value

	for item in ap:
		pp = '{:.2f}%'.format((spv[item]['pv']/tv)*100)
		spv[item].update({'pp':pp})

	return spv

def active_positions():
	_folder = os.path.join(os.path.dirname(__file__), '../me')
	return [item.split('.')[0] for item in os.listdir(_folder)]

def ticker_position(ticker, current_price=None):
	print 'ticker_position', ticker, current_price

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
	result = {'price':price, 'quantity':quantity}
	if not current_price:
		return result
	
	# gain/loss
	gl = current_price - price
	tgl = '{:.2f}'.format(quantity * gl)
	glp = '{:.2f}%'.format(((current_price/price)-1)*100)
	result.update({'gl':tgl, 'glp': glp})

	return result


class TickerPositions(Data):
	def __init__(self, ticker='TSLA', duration=520, subdir='positions', verbose=True):
		super(TickerPositions, self).__init__(ticker=ticker, subdir='positions', verbose=verbose)

		# TODO: replace this with init (so we don't have to keep on querying)
		self.td = TickerData(ticker=ticker, duration=duration, verbose=verbose)
		self.td.collect_data()

	def get_positions(self):
		ma_diff_str = "20sma - 50sma"
		self.td.data[ma_diff_str] = self.td.data["20sma"] - self.td.data["50sma"]
		self.td.data["regime"] = np.where(self.td.data[ma_diff_str] > 0, 1, 0)
		self.td.data["regime"] = np.where(self.td.data[ma_diff_str] < 0, -1, self.td.data["regime"])

		# To ensure that all trades close out, I temporarily change the regime of the last row to 0
		regime_orig = self.td.data.ix[-1, "regime"]
		# self.td.data.ix[-1, "regime"] = 0
		self.td.data["signal"] = np.sign(self.td.data["regime"] - self.td.data["regime"].shift(1))
		# # Restore original regime data
		self.td.data.ix[-1, "regime"] = regime_orig
		
		signals = pd.concat([
            pd.DataFrame({"price": self.td.data.loc[self.td.data["signal"] == 1, "close"],
                         "regime": self.td.data.loc[self.td.data["signal"] == 1, "regime"],
                         "signal": "open"}),
            pd.DataFrame({"price": self.td.data.loc[self.td.data["signal"] == -1, "close"],
                         "regime": self.td.data.loc[self.td.data["signal"] == -1, "regime"],
                         "signal": "close"}),
        ])
		signals.index = pd.MultiIndex.from_product([signals.index], names = ["date", "symbol"])
		signals.sort_index(inplace = True)
		signals.drop('regime', axis=1, inplace=True)
		self.data = signals

	def last_position(self):
		return self.data['signal'][-1]

	def collect_data(self):
		self.get_positions()
		self.write_data()

		return self


# if __name__ == '__main__':
# l = TickerPositions('AMD').collect_data()





