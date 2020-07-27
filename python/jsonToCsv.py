import json
import re
import csv

file = input("File to Parse: ")
with open('gear/%s.json' % file, 'r') as inf:
	fileToParse = json.load(inf)

referenceDict = {
		'Category': 0,
		'School': 1,
		'Level': 2,
		'Name': 3,
		'url':4,
		'Health':5,
		'Mana':6,
		'Energy':7,
		'Power Pip Chance':8,
		'Shadow Pip Chance':9,
		'Universal Accuracy':10,
		'Fire Accuracy':11,
		'Ice Accuracy':12,
		'Storm Accuracy':13,
		'Myth Accuracy':14,
		'Life Accuracy':15,
		'Death Accuracy':16,
		'Balance Accuracy':17,
		'Shadow Accuracy':18,
		'Universal Critical':19,
		'Fire Critical':20,
		'Ice Critical':21,
		'Storm Critical':22,
		'Myth Critical':23,
		'Life Critical':24,
		'Death Critical':25,
		'Balance Critical':26,
		'Shadow Critical':27,
		'Universal Critical Block':28,
		'Fire Critical Block':29,
		'Ice Critical Block':30,
		'Storm Critical Block':31,
		'Myth Critical Block':32,
		'Life Critical Block':33,
		'Death Critical Block':34,
		'Balance Critical Block':35,
		'Shadow Critical Block':36,
		'Universal Damage':37,
		'Fire Damage':38,
		'Ice Damage':39,
		'Storm Damage':40,
		'Myth Damage':41,
		'Life Damage':42,
		'Death Damage':43,
		'Balance Damage':44,
		'Shadow Damage':45,
		'Universal Resistance':46,
		'Fire Resistance':47,
		'Ice Resistance':48,
		'Storm Resistance':49,
		'Myth Resistance':50,
		'Life Resistance':51,
		'Death Resistance':52,
		'Balance Resistance':53,
		'Shadow Resistance':54,
		'Stun Resistance':55,
		'Universal Pierce':56,
		'Fire Pierce':57,
		'Ice Pierce':58,
		'Storm Pierce':59,
		'Myth Pierce':60,
		'Life Pierce':61,
		'Death Pierce':62,
		'Balance Pierce':63,
		'Shadow Pierce':64,
		'Universal Pip Conversion':65,
		'Fire Pip Conversion':66,
		'Ice Pip Conversion':67,
		'Storm Pip Conversion':68,
		'Myth Pip Conversion':69,
		'Life Pip Conversion':70,
		'Death Pip Conversion':71,
		'Balance Pip Conversion':72,
		'Shadow Pip Conversion':73,
		'Fishing Luck':74,
		'Incoming':75,
		'Outgoing':76,
		'Speed Boost':77,
		'Card':78,
		'Card 2':79,
		'Card 3':80,
		'Card 4':81,
		'Card 5':82,
		'Card 6':83,
		'Card 7':84,
		'Pip':85,
		'Power Pip':86,
		'Fire Mastery':87,
		'Ice Mastery':88,
		'Storm Mastery':89,
		'Myth Mastery':90,
		'Life Mastery':91,
		'Death Mastery':92,
		'Maycast':93,
		'Type':94}
fieldnames = list(referenceDict.keys())

with open('gear/%s.csv' % file, 'w+', newline='') as outfile:
	writer = csv.DictWriter(outfile, fieldnames=fieldnames)
	writer.writeheader()
	for category in fileToParse:
		for school in category:
			for item in category[school]:
				writer.writerow(category[school][item])

#1: Health
	#2: Mana
	#3: Energy
	#4: Power Pip Chance
	#5: Shadow Pip Chance
	#6: Accuracy
	#7: Crit
	#8: Block
	#9: Damage
	#10: Resist
	#11: Stun Resist
	#12: Pierce
	#13: Pip Conversion
	#14: Fishing Luck
	#15: Incoming
	#16: Outgoing
	#17: Speed Boost
	#18: Card
	#19: Card 2
	#20: Card 3
	#21: Card 4
	#22: Card 5
	#23: Card 6
	#24: Card 7
	#25: Pip
	#26: Power Pip
	#27: Mastery
	#28: Maycast
