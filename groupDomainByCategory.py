import csv
import json

def main():
	data = {} 
	with open("_data/domainWithCategories.csv", "rU") as f:
		reader = csv.reader(f)
		rowcount = 0
		for row in reader:
			#Domains,Categories,Rank,Traffic,Country
			if rowcount >0:
				category = row[1].strip().upper()
				if category not in data:
					data[category]={"count": 1}
					data[category]["domains"] = []
				else:
					data[category]["count"] +=1
				data[category]["domains"].append(row[0].strip());
			rowcount +=1

	result = []
	for s in sorted(data.iteritems(), key=lambda (k, v): v['count'], reverse=True):
		result.append(s)

	with open("_data/countOfDomainsByCategory.json", "w") as outfile:
		json.dump(result, outfile)

	

if __name__ == "__main__":
	main()
				

