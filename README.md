Prerequisites:
- Docker installed
- A way to transfer files (USB/external drive)

Both machines should have compatible CPU/OS (e.g., x86_64 Linux/Windows). If architectures differ, build with the matching target platform using `--platform`.

## 1) Build images on source machine

From the repository root:

```bash
# Build backend image
docker build -t login/backend:dev ./backend

# Build frontend image
docker build -t login/frontend:dev ./frontend
```

If you need to target a specific platform (e.g., for target machine):
```bash
docker build --platform linux/amd64 -t login/backend:dev ./backend
docker build --platform linux/amd64 -t login/frontend:dev ./frontend
```

Pull the database base image so it is available offline:
```bash
docker pull postgres:16
```

## 2) Save images to portable tar files

```bash
docker save -o login-images.tar login/backend:dev login/frontend:dev postgres:16
```

## 3) Copy repository to target machine

## 4) Load images on target machine

From the repository root:
```bash
docker load -i login-images.tar
```

## 5) Run the stack on target machine

From the repository root:
```bash
# Start containers in the background
docker compose up -d
```

- Backend available at: http://localhost:4000
- Frontend available at: http://localhost:5173

## 6) Add an initial user 

You can create a user directly in the database or use the provided script inside the backend container:

```bash
# Replace <username> and <password> with your desired credentials
docker compose exec backend node scripts/addUser.js <username> <password>
```

## 7) Stopping and cleaning up

```bash
docker compose down  # stop containers but keep db volume

docker compose down -v # stop containers and delete db volume
```

