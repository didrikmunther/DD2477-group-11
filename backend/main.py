from elasticsearch import Elasticsearch
from flask import Flask, request
import sys
import sqlite3
from collections import Counter

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
        cur.execute("""
            CREATE TABLE IF NOT EXISTS log (
                user_id integer,
                query string,
                FOREIGN KEY(user_id) REFERENCES user(id)
            );
        """)
        con.commit()
        cur.close()


def get_log(user_id):
    try:
        with conn() as con:
            cur = con.cursor()
            cur.execute("""SELECT query FROM log WHERE user_id=?""", (user_id,))
            rows = cur.fetchall()
            cur.close()
    except sqlite3.Error as error:
        eprint(error)

    return [v[0] for v in rows]


def log_query(user_id, query):
    try:
        with conn() as con:
            cur = con.cursor()
            cur.execute("""INSERT INTO log (user_id, query) VALUES (?, ?)""", (user_id, query))
            cur.close()
    except sqlite3.Error as error:
        eprint(error)


def get_starred(user_id):
    try:
        with conn() as con:
            cur = con.cursor()
            cur.execute("""SELECT movie_id FROM stars WHERE user_id=?""", (user_id,))
            rows = cur.fetchall()
            cur.close()
    except sqlite3.Error as error:
        eprint(error)

    return [v[0] for v in rows]


@app.route("/get_stars", methods=["POST"])
def get_starred_req():
    try:
        payload = request.get_json()
        user_id = payload['user_id']
    except KeyError:
        return {'error': 'Require query parameter \'user_id\''}


    return get_starred(user_id)


@app.route("/log_star", methods=["POST"])
def log_star():
    try:        
        payload = request.get_json()
        movie_id = payload['movie']
        value = payload['value']
        user_id = payload['user_id']
    except KeyError:
        return {'error': 'Require query parameter \'movie\''}

    eprint("Logging user movie", payload, value)

    try:
        with conn() as con:
            cur = con.cursor()

            if value:
                cur.execute("""
                    INSERT INTO stars (user_id, movie_id) VALUES (?, ?)
                """, (user_id, movie_id))
            else:
                cur.execute("""
                    DELETE FROM stars WHERE user_id=? AND movie_ID=?
                """, (user_id, movie_id))

            con.commit()
            cur.close()
    except sqlite3.Error as error:
        eprint(error)

    return get_starred(user_id)


def get_movie(movie_id):
    return es.get(index='movies', id=movie_id)


def get_user_preference(movies, field):
    return Counter(sum([movie['_source'][field] for movie in movies], []))


def get_keyword_preference(movies):
    return get_user_preference(movies, 'keywords')


def get_genre_preference(movies):
    return get_user_preference(movies, 'genres')


def get_log_preference(user_id):
    log = get_log(user_id)
    return Counter(log)


def get_user_lang_pref(user_id):
    languages = {}
    movies = [get_movie(id) for id in get_starred(user_id)]
    for m in movies: 
        language = m["_source"]["original language"]
        if language not in languages:
            languages[language] = 1
        else:
            languages[language] = languages[language]+1
    
    return languages


@app.route("/search", methods=["POST"])
def search():
    try:        
        payload = request.get_json()
        query = payload['query']
        page = payload['page']
        user_id = payload['user_id']
    except KeyError:
        return {'error': 'Require query parameter \'q\''}
    
    pf = 0.4 # personal_factor
    qf = 1.0 - pf # query_factor

    movies = [get_movie(id) for id in get_starred(user_id)]

    log_preference = get_log_preference(user_id)
    keyword_preference = get_keyword_preference(movies)
    genre_preference = get_genre_preference(movies)
    languages = get_user_lang_pref(user_id)
   
    # log_query(user_id, query)

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
                'fuzziness': 2,
                'boost': 1* qf
            }
        }
    },{
        'match': {
            'overview': {
                'query': query,
                'fuzziness': 1,
                'boost': 0.5 * qf
            }
        }
    },
    #removed this title boost and just boost the title query above
    # {
    #     'bool': {
    #         "must": [
    #             {
    #             'term': {
    #                 'title.keyword': query
    #             }
    #         }],
    #         'boost': 1*qf
    #     }
    # },
    ]

    #todo: refactor this into a generic function

    total_keywords = sum(log_preference[k] for k in log_preference)
    log_matches = [{
        'bool': {
            'should': {
                'match': {
                    'keywords': {
                        'query': k,
                        'boost': pf * log_preference[k] / total_keywords
                    }
                },
                'match': {
                    'title': {
                        'query': k,
                        'boost': pf * log_preference[k] / total_keywords
                    }
                }
            }
        }
    } for k in log_preference]

    total_keywords = sum(keyword_preference[k] for k in keyword_preference)
    personalized_matches = [{
        'match': {
            'keywords': {
                'query': k,
                'boost': 2*pf * keyword_preference[k] / total_keywords
            }
        }
    } for k in keyword_preference]

    total_keywords = sum(genre_preference[k] for k in genre_preference)
    genre_matches = [{
        'match': {
            'genres': {
                'query': k,
                'boost': 7.5 *pf * genre_preference[k] / total_keywords
            }
        }
    } for k in genre_preference]


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
                *([] if user_id == 0 else [
                    *personalized_matches,
                    *language_matches,
                    *log_matches,
                    *genre_matches
                ])
            ]
        }
    })

    return resp.body

if __name__ == "__main__":
    init_db()

    try:
        from flask_cors import CORS
        CORS(app)
    except ModuleNotFoundError:
        pass

    app.run(debug=True, host='0.0.0.0', port=3000)