from bs4 import BeautifulSoup as soup
import re
import requests
import json
import time

n = 0
multiLink = ["http://www.wizard101central.com/wiki/Item:Avalon_Outlaw%27s_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Epic_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Jewel_Crafter%27s_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Mirage_Raider%27s_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Polarian_Explorer%27s_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Spooky_Carnival_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Witch_Hunter%27s_Bundle_Gift_Card","http://www.wizard101central.com/wiki/Item:Olympian_Bundle_Gift_Card"]
bundleLinks = dict()
while n<len(multiLink):
	url = multiLink[n][:4]+ 's' + multiLink[n][4:]
	req = requests.get(url)
	#grabbing page
	page_html = req.text
	#html parser
	page_soup = soup(page_html, "html.parser")
	name = re.findall(">Item:(.*?) Gift Card</span>", str(page_soup))[0]
	bundleLinks[name] = dict()
	rows = re.findall("e7cda3;\">(.*?)</tr>", str(page_soup))
	x=0
	wand = list()
	hat = list()
	robe = list()
	boots = list()
	while x<len(rows):
		i=0
		while i < 4:
			link = re.findall("href=\"(.*?)\" title", str(rows))[x]
			if "redlink=1" not in link:
				if i == 0:
					wand.append("http://www.wizard101central.com" + link)
				elif i == 1:
					hat.append("http://www.wizard101central.com" + link)
				elif i == 2:
					robe.append("http://www.wizard101central.com" + link)
				elif i == 3:
					boots.append("http://www.wizard101central.com" + link)
			i+=1
		x+=1
	bundleLinks[name]["Wand"] = wand
	bundleLinks[name]["Hat"] = hat
	bundleLinks[name]["Robe"] = robe
	bundleLinks[name]["Boots"] = boots

	n+=1
	time.sleep(5)

print(bundleLinks)