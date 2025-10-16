Prerequisites :  
- Docker installed on both machines
- Docker Desktop is running

On the source machine go to the project root (that contains backend/, frontend/, and docker-compose.yml) and run the following commands.
Build images : 
```bash 
docker compose build
docker compose pull postgres
docker save -o login_app_images.tar login/backend:dev login/frontend:dev postgres:16```

Transfer the tarball to the target machine.

Load images : 
```bash
docker load -i login_app_images.tar```

Create network/volume : 
```bash
docker network create login-net
docker volume create login-db-data```

Start Postgres : 
```bash
docker run -d --name postgres --network login-net -v login-db-data:/var/lib/postgresql/data -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=app_db -p 5432:5432 postgres:16```

Start Backend (4000) : 
```bash
docker run -d --name login-backend --network login-net -p 4000:4000 -e NODE_ENV=development -e PORT=4000 -e SERVER_URL=http://localhost:4000 -e CLIENT_URL=http://localhost:5173 -e ACCESS_SECRET=dev-
access-secret-change-me -e REFRESH_SECRET=dev-refresh-secret-change-me -e DATABASE_URL=postgresql://postgres:password@postgres:5432/app_db login/backend:dev```

Start Frontend (5173) :
```bash
docker run -d --name login-frontend --network login-net -p 5173:5173 -e NODE_ENV=development -e VITE_API_URL=http://localhost:4000 login/frontend:dev```

App is running!

Once the application is running you can go to: [http://localhost:5173/](http://localhost:5173/)

To add users type:
```bash
docker compose exec backend node scripts/addUser.js <username> <password>
```

Example:
```bash
docker compose exec backend node scripts/addUser.js admin mysecurepassword
```
