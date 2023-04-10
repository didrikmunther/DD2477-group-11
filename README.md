# Search Project

## To run the project

`docker-compose up --force-recreate --build`

## To generate enrollment token

`docker ps | grep elasticsearch`

`docker exec -it <elastic search container id> sh`

`bin/elasticsearch-create-enrollment-token --scope kibana`
