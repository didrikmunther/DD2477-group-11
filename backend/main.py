from elasticsearch import Elasticsearch
from flask import Flask, request
import sys
import sqlite3

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

app = Flask(__name__)
es = Elasticsearch("http://elastic:9200")


# Connect to db
def conn():
    return sqlite3.connect("db.db")

def init_db():
    with conn() as con:
        cur = con.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user (
                id integer primary key
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS stars (
                user_id integer,
                movie_id integer,
                FOREIGN KEY(user_id) REFERENCES user(id)
                PRIMARY KEY(user_id, movie_id)
            );
        """)
        con.commit()
        cur.close()

@app.route("/get_stars", methods=["GET"])
def get_starred():
    try:
        with conn() as con:
            cur = con.cursor()
            cur.execute("""SELECT movie_id FROM stars WHERE user_id=?""", (0,))
            rows = cur.fetchall()
            cur.close()
    except sqlite3.Error as error:
        eprint(error)

    return [v[0] for v in rows]

@app.route("/log_star", methods=["POST"])
def log_star():
    try:        
        payload = request.get_json()
        movie_id = payload['movie']
        value = payload['value']
    except KeyError:
        return {'error': 'Require query parameter \'movie\''}

    eprint("Logging user movie", payload, value)

    try:
        with conn() as con:
            cur = con.cursor()

            if value:
                cur.execute("""
                    INSERT INTO stars (user_id, movie_id) VALUES (?, ?)
                """, (0, movie_id))
            else:
                cur.execute("""
                    DELETE FROM stars WHERE user_id=? AND movie_ID=?
                """, (0, movie_id))

            con.commit()
            cur.close()
    except sqlite3.Error as error:
        eprint(error)

    return get_starred()


def get_user_preferences(user_id):
    return {
        'nasa': 10,
        'bears': 20
    }
def get_user_lang_pref(user_id):
    return {
        'en': 1
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
    languages = get_user_lang_pref(0)
   
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
                'boost': 2* qf
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
    },{
        'bool': {
            "must": [
                {
                'term': {
                    'title.keyword': query
                }
            }],
            'boost': 1*qf
        }
    },]

    total_keywords = sum(preferences[k] for k in preferences)
    personalized_matches = [{
        'match': {
            'keywords': {
                'query': k,
                'boost': pf * preferences[k] / total_keywords
            }
        }
    } for k in preferences]


    total_languages = sum(languages[k] for k in languages)
    language_matches = [{
        'match': {
            'original language': {
                'query': k,
                'boost': 2*pf*languages[k] / total_languages
            }
        }
    }for k in languages]

    resp = es.search(index='movies', size=size, from_=page*size, query={
        'bool': {
            'should': [
                *query_matches,
                *personalized_matches,
                *language_matches,
            ]
        }
    })
    return resp.body


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host='0.0.0.0', port=3000)


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r