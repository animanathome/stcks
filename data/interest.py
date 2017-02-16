
def projections(start=50000, montly_contributions_per_year=[1000, 1500, 2000, 2500, 2500, 2500, 2500, 2500, 2500, 2500], years=10):
	# what about tax? how does that apply to investments and how does it get determined? Values earned on increasing stock value
	# what is the max amount of yearly contributions for (TSFA and RSP)?

	result = start
	for i in range(years):
		# contributions
		result+=(montly_contributions_per_year[i]*12)

		# interest
		result+=result*.2


	return '{:>10,}'.format(result)

print projections(50000, [1000, 1500, 2000, 2500, 2500, 2500, 2500, 2500, 2500, 2500], 10)
print projections(0, [500, 500, 500, 500, 500, 500, 500, 500, 500, 500], 10)

def credit_card(use=1000, cost=0, interest=0.0075):
	return (use*interest)-cost

print credit_card(21866, cost=0, interest=0.0075)
print credit_card(21866, cost=100, interest=0.01)

# TAX
# http://www.cra-arc.gc.ca/esrvc-srvce/tx/ndvdls/myccnt/menu-eng.html

# RRSP
# source: http://www.rbcroyalbank.com/products/rrsp/contribution-limits.html
# 2014	$24,270 (4 months)
# 2015	$24,930
# 2016	$25,370
# 2017	$26,010
# Your allowable RRSP contribution for the current year is the lower of:
# 18% of your earned income from the previous year, or
# The maximum annual contribution limit for the taxation year, or
# The remaining limit after any company sponsored pension plan contributions.

RRSP_MAX = ((24270 * .4)+24930+25370)
RRSP_CAD = 33251
RRSP_USD = (21216 * 1.30)
print 'RRSP - max:'+'{:>10,}'.format(RRSP_MAX)+', current:'+'{:>10,}'.format(RRSP_CAD + RRSP_USD)

# TFSA
# source: https://en.wikipedia.org/wiki/Tax-Free_Savings_Account
# 2014	$5,500	
# 2015	$10,000
# 2016	$5,500
# 2017	$5,500

TFSA_MAX = ((5500 * .4)+10000+5500)
TFSA_CAD = 2695.57
TFSA_USD = 4562.77 * 1.30
print 'TFSA - max:'+'{:>10,}'.format(TFSA_MAX)+', current:'+'{:>10,}'.format(TFSA_CAD + TFSA_USD)

