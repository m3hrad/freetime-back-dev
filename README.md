# Freetime Backend

## macOS

### local database

- Install postgres locally : brew install postgres
- Create a cluster: initdb /usr/local/var/freetime_postgres
- Run database(every time before running the server locally): postgres -D /usr/local/var/freetime_postgres
- Login using the default user: psql postgres
- Create database: CREATE DATABASE freetime;
- Create user freetime PASSWORD 'freetime';

### run the app

- npm install
- npm start

## Windows

### pgAdmin4

- Install windows installer from https://www.postgresql.org/download/windows/
- User added in Login/Group roles
- username:mahyar
- password:bros123456
- new server created:
- name: localhost

### PSQL:

 - install PSQL, set the password: 123456
 - In command propmt type: psql -U postgres postgres
 - password: 123456
 - type: CREATE DATABASE freetime;
 - type: Create user freetime PASSWORD 'freetime';
 - in pgAdmin4, connect database "freetime"
 - npm install
 - npm start
