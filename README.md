# Cosc-360-
Group 7

## Start up Project

### Standard Method (MongoDB Atlas)
- Stay in project root folder
- docker compose up -d

### Alternate Method (localhost) 
- Stay in project root folder
- docker compose --profiles localdb up -d

## Optional seed the project data
### Note that running this will overwrite your local DB
- in project root folder
- docker compose exec server npm run seed
