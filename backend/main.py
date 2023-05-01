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


@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/search")
def search():
    try:
        query = request.args.to_dict()['q']
    except KeyError:
        return {'error': 'Require query parameter \'q\''}

    preferences = get_user_preferences(0)

    resp = es.search(index='movies', size=5, query={
        'multi_match': {
            'query': query,
            'fuzziness': 2,
            'fields': ['keywords', 'overview', 'production_companies']
        }
    })
    return resp.body


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host='0.0.0.0', port=3000)