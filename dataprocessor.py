import csv
import collections
from bs4 import BeautifulSoup
import urllib2
import sys
import re

def main():
	fileprefix = "gfw-blocking-data-probe-1-2014-04-07-part-"

	datatable = collections.OrderedDict()

	for count in range(1, 5):
		filename = fileprefix + str(count) + ".csv"
		rowcount = 1
		domainCount = 0
		print filename

		with open(filename, "rU") as f:
			reader = csv.reader(f)
			for row in reader:
				if rowcount >1:
					domain = row[4]
					if domain != "":
						ipaddress = row[11]
						country = row[13]
						city = row[14]
						latlong = row[15]
						rank = int(row[5])
						dnsFlag = row[8]
						httpFlag = row[9]
						blocked = -1

						# check if at least either DNS or HTTP is blocked
						#0 for dns, 1 for HTTP, 2 for both, 3 for dns, http and IP
						if dnsFlag == "Y" and httpFlag == "N":
							blocked = 0 
						elif dnsFlag == "N" and httpFlag == "Y":
							blocked = 1
						elif dnsFlag == "Y" and httpFlag == "Y":
							blocked = 2
							ipFlag = row[10]
							if ipFlag == "Y":
								blocked = 3
						if domain == "tubewolf.com":
					 		print filename, domain, blocked
						#we only store domain that has at least either DNS or HTTP blocked
						# if blocked =-1, i.e neither DNS or HTTP is blocked, skip record
						if blocked !=-1 and ipaddress != "" and latlong != "None/None" and latlong !="":
							try:
								slash_pos = latlong.index("/")
								lat = float(latlong[:slash_pos])
								lon = float(latlong[slash_pos+1:])
							except Exception as e:
								print repr(e)
								print domain
								raise
							if domain not in datatable:
								domainInfo = ""
								# crawl Domain description from Alexa.com for domain that is either in the top 150 blocked list
								# or is blocked by at least both DNS and HTTP
								if blocked >1 or domainCount <150:
									try:
										domainInfo = crawler(domain)

										if domainInfo:
											domainInfo = domainInfo.encode('utf-8')
									except Exception as e:
										print domain, repr(e)
										domainInfo = "A description has not been provided for this site."
								
								datatable[domain] = {"rank": rank, 
													"blocked": blocked,
													"IP": ipaddress,
													"country": country,
													"city": city,
													"lat": lat, 
													"long": lon,
													"siteDesc":domainInfo}
								domainCount +=1
								
								

							else: #domain is already in the datatable
								# update DNS and HTTP block information
								if datatable[domain]["blocked"] <blocked:
									datatable[domain]["blocked"] = blocked
				rowcount +=1
		count +=1

	#sort the data by rank?

	with open("_data/domainData.csv", "w") as f:
		writer = csv.writer(f, delimiter = ";")
		# if count == 1:
		header = ["domain", "rank", "blocked", "IP", "country", "city", "lat", "long", "siteDesc"]
		writer.writerow(header)

		for domain in datatable:
			writer.writerow([domain, 
							datatable[domain]["rank"],
							datatable[domain]["blocked"],
							datatable[domain]["IP"],
							datatable[domain]["country"],
							datatable[domain]["city"],
							datatable[domain]["lat"],
							datatable[domain]["long"],
							datatable[domain]["siteDesc"]])

def crawler(domain):
	domainInfo = ""
	# try:
	# 	ur = urllib2.urlopen("http://www.alexa.com/siteinfo/"+domain).read()

	# 	soup = BeautifulSoup(ur)
	# 	infoSection = soup.find(text=re.compile("Site Description")).find_parent().find_parent()
		
	# 	# infoSection = soup.find("div", class_ = "row-fluid siteinfo-site-summary")
	# 	# emails = infoSection.find_all(href=re.compile("mailto"))
	# 	domainInfo = infoSection.find_next_sibling().string
	# 	if domainInfo == "":
	# 		domainInfo = "A description has not been provided for this site."
		
	# except urllib2.URLError, e:
	# 	print "Cannot open domain %s, error code: %s" %(domain,e)
	# 	domainInfo = "A description has not been provided for this site."

	# except:
	# 	print "Something wrong with parsing domain %s, %s" %(domain,sys.exc_info()[0])
	# 	domainInfo = "A description has not been provided for this site."
	return domainInfo


if __name__ == "__main__":
	main()
				

