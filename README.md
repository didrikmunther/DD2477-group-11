# Search Project

## To run the project

Create a `.env` file with the following content:

```env
ELASTIC_PASSWORD=abc123
KIBANA_PASSWORD=abc123
CLUSTER_NAME=docker-cluster
STACK_VERSION=8.7.0
LICENSE=basic
MEM_LIMIT=1073741824
KIBANA_PORT=5601
ES_PORT=9200
ENTERPRISE_SEARCH_PORT=3002
ENCRYPTION_KEYS=secret
PYTHONWARNINGS="ignore:Unverified HTTPS request"
```

Run: `docker-compose up`

### Access Kibana

Go to <http://localhost:5601/app/home#/> and login with username elastic, password abc123.

## Insert Movie Database into Elasticsearch

Go the the backend folder `cd ./backend`.

Run the dataloader script `python3 dataloader.py`.
