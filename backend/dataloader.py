from elasticsearch import Elasticsearch
import pandas as pd 
import json
import csv

def indexTMDB(filename):
    f = open(filename,"r")
    reader = csv.DictReader(f)
    for i,row in enumerate(reader):
        if i == 4553: continue
        movie = {
            "budget" : float(row["budget"]),
            "genres" : [genre["name"] for genre in json.loads(row["genres"])],
            "keywords" : [keyword["name"] for keyword in json.loads(row["keywords"])],
            "original language" : row["original_language"],
            "title" : row["title"],
            "overview" : row["overview"],
            "popularity" : float(row["popularity"]),
            "production companies" : [company["name"] for company in json.loads(row["production_companies"])],
            "production countries" : [country["name"] for country in json.loads(row["production_countries"])],
            "release date" : row["release_date"],
            "revenue" : int(row["revenue"]),
            "runtime" : row["runtime"],
            "spoken languages" : [language["name"] for language in json.loads(row["spoken_languages"])],
            "status" : row["status"],
            "tagline" : row["tagline"],
            "vote average" : float(row["vote_average"])
        }
        es.index(index = "movies", id = i, document = movie)


if __name__ == "__main__":
    es = Elasticsearch("http://localhost:9200") # Create an elastic search instance

    try:
        es.indices.delete(index='movies') #remove the index
    except:
        pass

    es.indices.create(index = "movies") # Create the movie index that we will use
    indexTMDB("./data/movies.csv") # Insert the movies
    es.indices.refresh(index="movies")
    print("The Number of inserted movies is ",es.count(index="movies")['count']) 
    res = es.get(index="movies", id=1)
    print("the first document is ",res['_source'])