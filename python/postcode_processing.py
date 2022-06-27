import json

with open("../Assets/australian_postcodes.json") as json_file:
    json_dict = json.load(json_file)

# Remove unnecessary key
for individual_dict in json_dict:
    for j in list(individual_dict):
        if j == "postcode" or j == "locality" or j == "state":
            continue
        del individual_dict[j]

# Extract useful data
json_dict = [i for i in json_dict if i["state"] == "NSW" and int(i["postcode"]) >= 2000]

# Delete state key
for i in json_dict:
    del i["state"]

# Test print
print(json_dict)

with open("../Assets/nsw_postcodes.json", "w") as json_file:
    json.dump(json_dict, json_file)
