import os
import json

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