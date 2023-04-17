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
```

Run: `docker-compose up`

### Generate enrollment token

Run the following on the computer running the docker containers:

`docker exec -it $(docker ps | grep elasticsearch | awk '{print $1}') bin/elasticsearch-create-enrollment-token --scope kibana`

### Done

Go to <http://localhost:5601/app/home#/> and login with username elastic, password abc123.
