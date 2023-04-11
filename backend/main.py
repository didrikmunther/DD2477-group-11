import requests
from flask import Flask

app = Flask(__name__)



@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/init_index")
def init_index():
    res = requests.put('http://localhost:9200/documents', data={
        "mappings": {
            "properties": {
                "content": {
                    "type": "text"
                }
            }
        }
    })

    print(res)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3001)