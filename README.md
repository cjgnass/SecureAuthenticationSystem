Before running the project, make sure you have Docker and Docker Compose installed.

### Download Links

- **Windows / macOS:** [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

Verify Docker installation by typing:

```bash
docker --version
docker compose version
```

**Once Docker is installed open Docker Desktop.**

Start the app by typing:

```bash
docker compose up -d
```

Stop the app by typing:

```bash
docker compose down -v
```

To add users type:

```bash
docker compose exec backend node scripts/addUser.js <username> <password>
```

Example:

```bash
docker compose exec backend node scripts/addUser.js admin mysecurepassword
```
