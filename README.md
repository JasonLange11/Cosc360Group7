# Cosc-360-
Group 7

## Start up Docker Container for Database
- Stay in the project root folder
- Make sure Docker Desktop is running
- docker compose up -d

## Optional seed the project data
### Note that running this will overwrite your local DB
- in project root folder
- npm run seed --prefix server

## Running the project

### Run frontend and backend on localhost 
- Stay in project root folder
- npm install
- npm start

### Alternative Method
The project can be started with the fronted and server individually
if desired.  If so, do the following instead.

#### Run frontend (client) on localhost
- cd client
- npm install
- npm run dev

#### Run backend (server) on localhost
- cd server
- npm install
- npm run dev


#### Seed Data into the Database (Note: THIS WILL REMOVE ALL DATA IN THE DATABASE BEFORE SEEDING THE DATA)
- cd server
- npm run seed