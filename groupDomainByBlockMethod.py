import csv
import json

def main():
	data = {}
	method = ["DNS", "HTTP", "DNS+HTTP", "DNS+HTTP+IP"]
	with open("_data/domainData.csv", "rU") as f:
		reader = csv.reader(f, delimiter=';')
		rowCount = 0
		for row in reader:
			if rowCount > 0:

				#header: domain;rank;blocked;IP;country;city;lat;long;siteDesc
				#result: [DNS: {count:1, domains:[...]}, HTTP: {count: 2, domains: [], BOTH: {count....}}}]
				domainName = row[0]
				domainBlocked = int(row[2])
				if domainBlocked >0: #take out HTTP or DNS single method, since there >1000 HTTP blocked domains
					blockMethod = method[domainBlocked]

					if blockMethod in data:
						data[blockMethod]["count"] +=1
					else:
						data[blockMethod] ={}
						data[blockMethod]["count"] = 1
						data[blockMethod]["domains"]=[]

					data[blockMethod]["domains"].append(domainName)
			rowCount += 1

	result = []
	for s in sorted(data.iteritems(), key=lambda (k, v): v['count'], reverse=True):
		result.append(s)

	with open("_data/countOfDomainsByBlockMethod.json", "w") as outfile:
		json.dump(result, outfile)



if __name__ == "__main__":
	main()


