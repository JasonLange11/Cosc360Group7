# Cosc-360
Group 7

## Start up Project
- The default hand-in Docker setup does not require a server/.env file

### Hand-in Method (Local MongoDB)
- In project root folder
- docker compose down -v
- docker compose up -d --build

This starts the app and local MongoDB together. The server now runs the seed command every time the container starts, so `docker compose up -d` will always reset the seeded data.

### Atlas Method
- In project root folder
- docker compose -f docker-compose.atlas.yml up -d --build

- This uses the Atlas URI from server/.env, does not start the local Mongo container.

### Website hosted at
- [localhost:5173](http://localhost:5173)

## Manual seed commands
### Note that the overwrite command will replace existing data
- In project root folder
- docker compose exec server npm run seed

## Testing
- In the root folder
- npm install
- npm test