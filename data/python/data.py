import os
import json
import numpy as np
import pandas as pd
import pandas_datareader.data as web
from pandas.tseries.offsets import *
import datetime
import simplejson

class Data(object):
	def __init__(self, ticker, subdir='data', verbose=False):
		self.ticker = ticker		
		self.data_dir = None
		self.data = None
		self.verbose = verbose

		self.set_dir_name(subdir)

	def set_dir_name(self, name):
		self.data_dir = os.path.join(os.path.dirname(__file__), '..', name)

		if not os.path.exists(self.data_dir):
			os.makedirs(self.data_dir)

	def data_file(self):
		return os.path.join(self.data_dir, self.ticker+'.json')

	def data_exists(self):
		if not os.path.exists(self.data_file()):
			if self.verbose:
				print self.data_file(), 'does not exist'
			return False
		return True

	def read_data(self):
		with open(self.data_file()) as json_data:
			d = json.load(json_data)

		self.data = pd.DataFrame(d['data'], columns=d['structure'])
		self.data['date'] = pd.to_datetime(self.data['date'])

	def write_data(self):
		# combine all data
		if self.verbose:
			print self.ticker, 'write_data'

		data = {}
		# data['structure'] = []
		# data['structure'].extend([str(item).lower() for item in self.data.columns.values])
		data['data'] = {}
		data['dates'] = []

		entry = None
  		for column in self.data:
  			if column == 'Date':
  				data['dates'] = [self.data[column][i].strftime('%m-%d-%Y') for i in range(len(self.data[column].values))]
  			else:
  				chart = 'line'
  				if column == "volume":  					
  					chart = 'bar'

  				data['data'][column] = {
  					'chart': chart,
  					'entries':[float('{:.2f}'.format(item)) for item in self.data[column].values]
  				}
		
		if self.verbose:
			print '\t', self.data_file() 

		with open(self.data_file(), 'w') as outfile:
			simplejson.dump(data, outfile, ignore_nan=True)

	def get_value(self, column, index):
		return self.data[column].values[index]

	def init(self):
		if not self.data_exists():
			return
		self.read_data()
		return self
		