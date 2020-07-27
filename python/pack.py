from bs4 import BeautifulSoup as soup
import re
import requests
import json
import time

n = 0
multiLink = ["http://www.wizard101central.com/wiki/Item:Terror%27s_Hoard_Pack", "http://www.wizard101central.com/wiki/Item:Immortal%27s_Lore_Pack","http://www.wizard101central.com/wiki/Item:Keeper%27s_Lore_Pack","http://www.wizard101central.com/wiki/Item:Shaman%27s_Lore_Pack","http://www.wizard101central.com/wiki/Item:Wysteria_Lore_Pack","http://www.wizard101central.com/wiki/Item:Gloomthorn_Nightmare_Pack","http://www.wizard101central.com/wiki/Item:Harrowing_Nightmare_Pack","http://www.wizard101central.com/wiki/Item:Winter_Wonder_Pack","http://www.wizard101central.com/wiki/Item:Winterland_Pack","http://www.wizard101central.com/wiki/Item:Yuletide_Pack","http://www.wizard101central.com/wiki/Item:Alphoi_Hoard_Pack","http://www.wizard101central.com/wiki/Item:Ghulture%27s_Hoard_Pack","http://www.wizard101central.com/wiki/Item:Professor%27s_Hoard_Pack","http://www.wizard101central.com/wiki/Item:Road_Warrior%27s_Hoard_Pack"]
packLinks = dict()
while n<len(multiLink):
	url = multiLink[n][:4]+ 's' + multiLink[n][4:]
	req = requests.get(url)
	#grabbing page
	page_html = req.text
	#html parser
	page_soup = soup(page_html, "html.parser")
	i=0
	while i < 2:
		if i == 0:
			item = "Clothing"
		else:
			item = "Wands"
		name = re.findall(">Item:(.*?) Pack</span>", str(page_soup))[0]
		packLinks[name] = dict()
		packLinks[name][item] = dict()
		items = re.findall(item + "</b></div>(.*?)</td>", str(page_soup))
		if items == []:
			items = re.findall("Gear</b></div>(.*?)</td>", str(page_soup))
		if items == []:
			items = re.findall("Set</b></div>(.*?)</td>", str(page_soup))
		itemNames = re.findall("<i>(.*?)</i>", str(items))

		x=0
		while x<len(itemNames):
			itemDivs = re.findall("width:106px;\">(.*?)<br/></div>", str(items))
			itemLinks = re.findall("href=\"(.*?)\" title", str(itemDivs[x]))
			itemLevels = ["http://www.wizard101central.com" + x for x in itemLinks]
			y=0
			while y<len(itemLevels):
				if "redlink=1" in itemLevels[y]:
					del itemLevels[y]
				else:
					y+=1
			if "\\" in itemNames[x]:
				itemNames[x] = itemNames[x].replace("\\", "")
			packLinks[name][item][itemNames[x]] = itemLevels

			x+=1
		i+=1
	n+=1
	time.sleep(5)

print(packLinks)