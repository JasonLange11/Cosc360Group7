# Cosc-360
Group 7

## Start up Project
- Go into the server folder
- Copy the .env.example file and save it as .env in server


### Standard Method (MongoDB Atlas)
- In project root folder
- docker compose up -d

### Alternate Method (localhost) 
- In project root folder
- docker compose --profile localdb up -d

### Website hosted at
- [localhost:5173 ](http://localhost:5173)

## Optional seed the project data
### Note that running this will overwrite the database
- In project root folder
- docker compose exec server npm run seed
