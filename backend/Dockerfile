FROM python:3.8 as base
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y npm
RUN npm i -g nodemon

COPY requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 3000
CMD nodemon main.py