The client is written in emberjs and the server is written in django.

You need the following dependencies:

pip install django

pip install djangorestframework

pip install django-cors-headers

pip install ofxparse


To setup the server run:

python ./manage.py migrate
python ./manage.py runserver

The database and userfiles have been setup to be one directory below django.


To run the client you'll need to get the ember cli:

npm install -g ember-cli

To setup the client run:

npm install

bower install

To run you would go:

ember s


Note this has the server and client seperate.  You can compile and bring the client to the server with a django command.  This triggers an ember build and then copies
the files to spending_api/static so everything can be run on the server.

python ./manage.py refreshclient

This is seperated this way due to the complications of the ember build.  This could be resolved with a reverse proxy capable server to sit infront of these two pieces.

To generate a package for deploying to the server:

python ./manage.py package

