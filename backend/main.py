import requests
from flask import Flask
import sys

import dataloader

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/init_index")
def init_index():
    eprint('Got request')

    res = requests.put('http://es03:9200/documents', data={
        "mappings": {
            "properties": {
                "content": {
                    "type": "text"
                }
            }
        }
    })

    eprint('Res here', res)

    return {}


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3000)