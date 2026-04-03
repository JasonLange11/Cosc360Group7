# Cosc-360
Group 7

## Start up Project

### Standard Method (MongoDB Atlas)
- In project root folder
- docker compose up -d

### Alternate Method (localhost) 
- In project root folder
- docker compose --profiles localdb up -d

## Optional seed the project data
### Note that running this will overwrite the database
- In project root folder
- docker compose exec server npm run seed
