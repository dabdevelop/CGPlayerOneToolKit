import json

b = {}
with open('account.txt', 'r') as file:
	a = file.readlines()
	for q in a: 
		b[q.strip()] = 0

for q in a:
	b[q.strip()] = 1.6

with open('bounty.json', 'w+') as file2:
	json.dump(b, file2)

