from bs4 import BeautifulSoup as soup
import re
import requests
import json
import time
import ast
import os

gear = dict()
itemTypeList = ["Hat", "Robe", "Boots", "Wand", "Athame", "Amulet", "Ring", "Deck"]
finishedItems = []
groupList = []


if input('Update gear list files? ') == 'y':
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

for itemType in itemTypeList:
	tempGear = []
	with open('gear/%s.json' % itemType, 'r+') as inf:
		tempGear = json.load(inf)
	print(itemType)
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
				print (group)
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
					if (re.findall("</b>: (.*?)\n</p>", str(page_soup))[0]== "Any Level"):
						gear[group][school]["Level"] = 0
					else:
						gear[group][school]["Level"] = int(re.findall("Level (.*?)\+", str(page_soup))[0])
					gear[group][school]["Name"] = name
					gear[group][school]["Type"] = gearType
					gear[group][school]["url"] = itemLinks[i]

					stats = re.findall("<dd>(.*?)\n</dd>", str(page_soup))

					if(gearType == "Deck"):
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
					while(n<limit):
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
	except:
		pass
	with open('gear/%s.json' % itemType, 'w+') as outfile:
		json.dump(tempGear, outfile)
with open('gear/finishedItems.json', 'w+') as outfile:
 	json.dump(finishedItems, outfile)

#TODO
	# Import dictionary from file and convert into url list
	# Figure out how I'm going to sort into groups
	# Figure out how I'll order and access

##DD list
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
