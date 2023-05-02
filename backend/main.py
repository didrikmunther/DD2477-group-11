from elasticsearch import Elasticsearch
from flask import Flask, request
import sys
import sqlite3

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

app = Flask(__name__)
con = sqlite3.connect("db.db")
es = Elasticsearch("http://elastic:9200")


def init_db():
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user (
            id integer primary key
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS keywords (
            user_id integer,
            keyword string,
            count integer,
            FOREIGN KEY(user_id) REFERENCES user(id)
        );
    """)


@app.route("/log_user_movie")
def log_user_click(movie_id):
    eprint("Logging user movie", movie_id)


def get_user_preferences(user_id):
    return {
        'nasa': 10,
        'bears': 20
    }


@app.route("/search", methods=["POST"])
def search():
    try:        
        payload = request.get_json()
    except KeyError:
        return {'error': 'Require query parameter \'q\''}
    
    pf = 0.5 # personal_factor
    qf = 1.0 - pf # query_factor
    preferences = get_user_preferences(0)
   
    query = payload['query']
    page = payload['page']
    size = 10

    query_matches = [{
        'match': {
            'keywords': {
                'query': query,
                'fuzziness': 1 * qf
            },
        }
    },{
        'match': {
            'title': {
                'query': query,
                'fuzziness': 1,
                'boost': 2.0 * qf
            }
        }
    },{
        'match': {
            'overview': {
                'query': query,
                'fuzziness': 1,
                'boost': 1.2 * qf
            }
        }
    }]

    total_keywords = sum(preferences[k] for k in preferences)
    personalized_matches = [{
        'match': {
            'keywords': {
                'query': k,
                'boost': pf * preferences[k] / total_keywords
            }
        }
    } for k in preferences]

    resp = es.search(index='movies', size=size, from_=page*size, query={
        'bool': {
            'should': [
                *query_matches,
                *personalized_matches,
            ]
        }
    })
    return resp.body


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host='0.0.0.0', port=3000)