from bs4 import BeautifulSoup as soup
import re, requests, json, time, ast, os, csv

print('Use numbers to navigate this section')


def menu():
	direction = input(' 1. Start List Editor \n 2. Update Gear List Files (needed after editing list) \n 3. Start Webscraping \n 4. Convert JSON to CSV \n 5. Exit \n')
	menu_actions[direction]()

#grouper


def startEditor():
	global gearList
	gearList = dict()
	with open('gearList.json') as inf:
		gearList = json.load(inf)
	end = 'n'
	while end != 'y':
		print("Existing Groups:")
		for key in gearList:
			print("    " + key)
		mode = input("Add to Group (add), New Group (new) or Quit (quit)? ")
		if mode == "new":
			inputGroup()
		elif mode == "add":
			editGroup()
		elif mode == 'quit':
			menu()
		end = input("End List Editor? ")
	with open('gearList.json', 'w+') as outfile:
		json.dump(gearList, outfile)
	print(gearList)


def inputGroup():
	gearType = input('Gear Type:')
	try:
		gearList[gearType]
	except KeyError:
		gearList[gearType] = dict()
	group = input('Group:')
	try:
		gearList[gearType][group]
	except KeyError:
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
		i += 1
	gearType = keyList[int(float(input("Choose gear type: ")))]
	print(gearType)
	print("\n Existing groups:")
	keyList = []
	i = 0
	for key in gearList[gearType]:
		keyList.append(key)
		print(str(i) + ". " + key)
		i += 1
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

#scraper


def updateGearLists():
	gearList = dict()
	with open('gearList.json', 'r') as inf:
		gearList = json.load(inf)
	with open('gear/finishedItems.json', 'r') as inf:
		finishedItems = json.load(inf)
	for key in gearList:
		for item in gearList[key]:
			tempList=[]
			if (item not in finishedItems):
				tempList.append(gearList[key])
		with open('gear/%sUrlList.json' % key, 'w+') as outfile:
			json.dump(tempList, outfile)


def webscrape():
	gear = dict()
	itemTypeList = ["Hat", "Robe", "Boots", "Wand", "Athame", "Amulet", "Ring", "Deck"]
	finishedItems = []
	for itemType in itemTypeList:
		with open('gear/%s.json' % itemType, 'r+') as inf:
			tempGear = json.load(inf)
		print('Category: ' + itemType)
		path = 'gear/%sUrlList.json' % itemType
		try:
			if os.path.exists(path) and os.path.getsize(path) > 0:
				itemDict = dict()
				groupList = []
				with open(path, 'r') as inf:
					itemDict = json.load(inf)[0]
				for obj in itemDict:
					for item in obj:
						groupList.append(item)
				#setting url
				for item in itemDict:
					group = item
					print('Scraping: ' + group)
					gear[group] = {}	
					itemLinks = itemDict[group]
					i=0
					while i<len(itemLinks):
						url = itemLinks[i][:4]+ 's' + itemLinks[i][4:]
						req = requests.get(url)
				#grabbing page
						page_html = req.text
				#html parser
						page_soup = soup(page_html, "html.parser")
						statOrder = ["Health", "Mana", "Energy", "Power Pip Chance", "Shadow Pip Chance", "Accuracy", "Critical", "Block", "Damage", "Resist", "Stun Resist", "Pierce", "Pip Conversion", "Speed Boost", "Incoming", "Outgoing", "Fishing Luck", "Card 1", "Card 2", "Card 3", "Card 4", "Card 5", "Card 6", "Card 7", "Pip", "Power Pip", "Mastery", "May Cast"]
						school = re.findall("title=\"Category:(.*?) School Items", str(page_soup))[0]
						if re.findall("Not (.*?) Alternate", str(page_soup)):
							school = school + " But " + re.findall("Not (.*?) Alternate", str(page_soup))[0]
							gearType = re.findall("/wiki/File:\(Icon\)\_(.*?)\.png", str(page_soup))[1]
						gear[group][school] = dict()
						name = re.findall(">Item:(.*?)</span>", str(page_soup))[0]
						gearType = re.findall("/wiki/File:\(Icon\)\_(.*?)\.png", str(page_soup))[0]
						gear[group][school]["Category"] = group
						gear[group][school]["School"] = school 
						if re.findall("</b>: (.*?)\n</p>", str(page_soup))[0]== "Any Level":
							gear[group][school]["Level"] = 0
						else:
							gear[group][school]["Level"] = int(re.findall("Level (.*?)\+", str(page_soup))[0])
						gear[group][school]["Name"] = name
						gear[group][school]["Type"] = gearType
						gear[group][school]["url"] = itemLinks[i]

						stats = re.findall("<dd>(.*?)\n</dd>", str(page_soup))

						if gearType == "Deck":
							gear[group][school]["Main Deck Capacity"] = int(re.findall("> (.*?) Spells", str(stats[0]))[0])
							del stats[0]
							gear[group][school]["Max Spell Copies"] = int(re.findall("> (.*?) Spells", str(stats[0]))[0])
							del stats[0]
							if school == "Any":
								gear[group][school]["Side Deck Capacity"] = int(re.findall("> (.*?) Treasure", str(stats[0]))[0])
								del stats[0]
							else:
								gear[group][school]["Max " + school + " Spell Copies"] = gear[group][school]["Side Deck Capacity"] = int(re.findall("Copies:</i> (.*?) Spells", str(stats[0]))[0])
								del stats[0]
								gear[group][school]["Side Deck Capacity"] = int(re.findall("> (.*?) Treasure", str(stats[0]))[0])
								del stats[0]
						
						n=0
						limit = 28
						while n<limit:
							statType = re.findall("\(Icon\)\_(.*?).png", str(stats[n]))
							if n in [3, 4, 14, 15, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27]:
								if stats[n] != '':
									statType = [statOrder[n]]
							if statType:
								if statType[0] == "Global_Alternate":
									statType[0] = "Universal"
								elif statType[1] == "Global_Alternate":
									statType[1] = "Universal"
								if "Pip_Conversion" in statType:
									statType[statType.index("Pip_Conversion")] = "Pip Conversion"
								if "Critical_Block" in statType:
									statType[statType.index("Critical_Block")] = "Block"
								if "Armor_Piercing" in statType:
									statType[statType.index("Armor_Piercing")] = "Pierce"
							value = re.findall("\+(.*?) <a", str(stats[n]))
							valueNum = list()
							x=1
						#convert multi school stats
							while x<len(statType):
								if (len(statType)>x):
									statType[x-1] += ' ' + statType[(len(statType)-1)]
									x+=1
							if(len(statType)>1):
								del statType[(len(statType)-1)]

							x = 0
						#find stat value
							while x<len(statType):
								if 26 <= n <= 27:
									if n == 26:
										valueNum.append("Allows Power Pips with " + re.findall("Not (.*?) Alternate", str(page_soup))[0] + " Spells")
									if n == 27:
										del statType[0]
										x=0
										while x<len(re.findall("title=\"ItemCard:(.*?)\"", str(stats[27]))):
											valueNum.append(re.findall("title=\"ItemCard:(.*?)\"", str(stats[27]))[x])
											statType[x] = "May Cast " + (x+1)
											x += 1
								else:
									valueNum.append(int(re.findall(r'\d+', str(value))[x]))
									if 17 <= n <= 23:
										valueNum[0] = str(valueNum[0]) + ' ' + (re.findall("title=\"ItemCard:(.*?)\">", str(stats[n]))[0])
								gear[group][school][statType[x]]=valueNum[x]
								x+=1

							n += 1
					#sockets
						if gearType == "Wand" or gearType == "Athame" or gearType == "Amulet" or gearType == "Ring" or gearType == "Deck":
							sockets = re.findall("Socket\.png(.*?)\n</dd>", str(page_soup))
							if len(sockets)>0:
								x = 1
								while x<=len(sockets):
									gear[group][school]["Socket "+ str(x)] = sockets[x-1].split("</a> ")[1]
									x += 1
						i+=1
						time.sleep(5)
					finishedItems.append(group)
					tempGear.append(gear)
					gear = dict()
		finally:
			print('Finished group')
		with open('gear/%s.json' % itemType, 'w+') as outfile:
			json.dump(tempGear, outfile)
	print('Dumping gear to file')
	with open('gear/finishedItems.json', 'w+') as outfile:
		json.dump(finishedItems, outfile)
	print('Finished dump')
	menu()

#jsonToCSV


def convertJson():
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
	if input('Convert another file? ') == 'y':
		convertJson()


menu_actions = {
	'1': startEditor,
	'2': updateGearLists,
	'3': webscrape,
	'4': convertJson,
	'5': exit
}

if __name__ == '__main__':
	menu()
