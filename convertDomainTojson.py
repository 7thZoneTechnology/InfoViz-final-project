import csv
import json
import collections

def main():
	result = {"type":"FeatureCollection"}
	result["domains"] = []
	
	filename = "domainData.csv"
	rowCount = 0
	with open("_data/"+filename, "rU") as f:
		reader = csv.reader(f, delimiter=';')
		for row in reader:
			if rowCount > 0: 
				# print row
				domainData = {}
				#header: domain;rank;blocked;IP;country;city;lat;long;siteDesc
				#{"type":"Feature","id":"01","geometry":{"type":"Point","coordinates":[9.85000,57.09700]},"properties":{"name":"Aalborg, Denmark", "size":1}}
				domainName = row[0]
				domainRank = row[1]
				domainBlocked = row[2]
				# domainIP = row[3]
				# domainCountry = row[4]
				# domainCity = row[5]
				lat = row[6]
				lng = row[7]
				domainDesc = row[8]

				# if domainRank <=150:
	  	# 			pointSize = 15
		  # 		elif domainRank <=500:
		  # 			pointSize = 10
		  # 		elif domainRank <=1000:
			 #  		pointSize = 5
		  # 		elif domainRank <=3000
		  # 			pointSize = 3
		  # 		else
		  # 			pointSize = 1

				domainData["type"] = "Feature"
				domainData["id"] = rowCount
				domainData["geometry"] = {"type": "Point","coordinates": [lng, lat]}
				domainData["properties"] = {"name": domainName,
											"rank": domainRank,
											"blocked": domainBlocked,
											"desc": domainDesc}
				result["domains"].append(domainData)
			rowCount += 1

	with open("_data/domainData.json", "w") as outfile:
		json.dump(result, outfile)


if __name__ == "__main__":
	main()


