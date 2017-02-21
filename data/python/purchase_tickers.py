
sc = 3371.55 * .77
tc = 3563.86 * .77
s = 3500.0
a = 2829.0
b = 4010.0

total = s+a+b+sc+tc


QCOM = (25 * 56.88) + 10 # Done
IDCC = (12 * 99.95) + 10 # Done
FFIV = (10 * 143.24) + 10 # Done
NFLX = (11 * 142.01) + 10 # Done
ICUI = (8 * 150.05) + 10 # Done
TSRO = (5 * 182.56) + 10
AMZN = (5 * 844.14) + 10
ISRG = (5 * 721.47) + 10 
 
print 'purchase:', QCOM + FFIV + IDCC + NFLX +ISRG + ICUI + TSRO + AMZN
print 'available:',total

# print QCOM + IDCC + FFIV
print NFLX + ICUI

