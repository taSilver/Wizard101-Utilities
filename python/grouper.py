from bs4 import BeautifulSoup as soup
import re
import json

gearList = dict()

with open('gearList.json') as inf:
	gearList = json.load(inf)

def inputGroup():
	gearType = input('Gear Type:')
	try:
		gearList[gearType]
	except:
		gearList[gearType] = dict()
	group = input('Group:')
	try:
		gearList[gearType][group]
	except:
		gearList[gearType][group] = []
	number = int(input('Number of items:'))
	for x in range(number):
		item = input('URL:')
		gearList[gearType][group].append(item)
	gearList[gearType][group] = removeDuplicates(gearList[gearType][group])

def editGroup():
	print("\n Existing gear types:")
	keyList = []
	i = 0
	for key in gearList:
		keyList.append(key)
		print(str(i) + ". " + key)
	gearType = keyList[int(float(input("Choose gear type: ")))]
	print(gearType)
	print("\n Existing groups:")
	keyList = []
	i = 0
	for key in gearList[gearType]:
		keyList.append(key)
		print(str(i) + ". " + key)	
	group = keyList[int(float(input("Choose group: ")))]
	number = int(input('Number of items to add: '))
	for x in range(number):
		item = input('URL:')
		gearList[gearType][group].append(item)
	gearList[gearType][group] = removeDuplicates(gearList[gearType][group])

def removeDuplicates(listCheck):
	output = list()
	seen = set()
	for value in listCheck:
		if value not in seen:
			output.append(value)
			seen.add(value)
	return output

if (input('Start?') == 'y'):
	end = 'n'
	while (end != 'y'):
		mode = input("Add to Group (add) or New Group (new)?")
		if (mode == "new"):
			inputGroup()
		elif (mode == "add"):
			editGroup()
		end = input("End?")
	with open('gearList.json', 'w+') as outfile:
		json.dump(gearList, outfile)
	print(gearList)