import os
import pandas as pd

def get_ticker_info(symbol='TSLA'):
	# print 'get_ticker_info', symbol
	# Collect symbol, name, sector, marketcap and industry from each company that's on the NASDAQ

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
		return {'name': data.iloc[index]['Name'], 'symbol':symbol}
	except:
		# symbol is not part of the file...
		pass

if __name__ == '__main__':
	result = get_ticker_info()
	print 'result:', result