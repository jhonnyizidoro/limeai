# Deployment Guide

Deploys automatically to an EC2 server via GitHub Actions on every push to `main`. The workflow builds Docker images in CI, pushes them to GitHub Container Registry (GHCR), then SSHs into the server to pull and run the pre-built images.

---

## Architecture

```
GitHub Actions (CI)
├── builds backend image  → ghcr.io/jhonnyizidoro/limeai/backend:latest
└── builds frontend image → ghcr.io/jhonnyizidoro/limeai/frontend:latest

EC2 (Ubuntu)
├── postgres        — PostgreSQL 17 (named volume, persists across deploys)
├── backend         — Elysia API on port 3000 (pulled from GHCR)
├── frontend        — React app served by nginx on port 80 (pulled from GHCR)
└── static          — nginx serving uploaded audio files on port 8080
```

The frontend is compiled in CI with `VITE_API_URL` baked in. The backend TypeScript is compiled with `tsup` and run with Node. The server never builds images — it only pulls and runs them.

---

## Server Setup (Ubuntu)

Run these commands once on a fresh Ubuntu EC2 instance.

### Security Group — Inbound Rules

Before anything else, open these ports in the EC2 security group (AWS Console → EC2 → Security Groups → Inbound rules):

| Port | Protocol | Source    | Purpose |
|------|----------|-----------|---------|
| 22   | TCP      | Your IP   | SSH access |
| 80   | TCP      | 0.0.0.0/0 | Frontend (nginx) |
| 3000 | TCP      | 0.0.0.0/0 | Backend API |
| 8080 | TCP      | 0.0.0.0/0 | Audio file serving (if `STORAGE_TYPE=local`) |

Without ports 80 and 3000 open, the app and API will be unreachable from the browser.

### Install Docker

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable docker
sudo systemctl start docker

sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
docker buildx version
```

### Install Git and clone the repo

```bash
sudo apt-get install -y git
git config --global credential.helper store
git clone https://github.com/jhonnyizidoro/limeai.git
```

Note the full path to the cloned repo — you'll need it for the `DEPLOY_PATH` secret.

---

## GitHub Actions Setup

### Required Secrets

Go to the repo on GitHub → **Settings → Secrets and variables → Actions → New repository secret**.

Create the following secrets:

| Secret              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| `SSH_HOST`          | EC2 public hostname or IP (e.g. `ec2-44-197-175-55.compute-1.amazonaws.com`) |
| `SSH_USER`          | SSH username (e.g. `ubuntu`)                                                 |
| `SSH_PRIVATE_KEY`   | Full contents of your `.pem` key file                                        |
| `DEPLOY_PATH`       | Absolute path to the repo on the server (e.g. `/home/ubuntu/limeai`)         |
| `GHCR_TOKEN`        | GitHub PAT with `read:packages` scope — used to pull images from GHCR       |
| `POSTGRES_USER`     | Database username                                                            |
| `POSTGRES_PASSWORD` | Database password                                                            |
| `POSTGRES_DB`       | Database name                                                                |
| `POSTGRES_PORT`     | Database port (typically `5432`)                                             |
| `OPEN_AI_KEY`       | OpenAI API key                                                               |
| `STORAGE_TYPE`      | `local` or `s3`                                                              |
| `UPLOADS_URL`       | Public base URL for audio files (e.g. `http://<server-ip>:8080`)             |
| `VITE_API_URL`      | Backend API URL (e.g. `http://<server-ip>:3000`)                             |
| `AWS_ACCESS_KEY`    | AWS access key — required if `STORAGE_TYPE=s3`                               |
| `AWS_SECRET_KEY`    | AWS secret key — required if `STORAGE_TYPE=s3`                               |
| `AWS_BUCKET`        | S3 bucket name — required if `STORAGE_TYPE=s3`                               |
| `AWS_REGION`        | AWS region — required if `STORAGE_TYPE=s3`                                   |

### Creating the GHCR_TOKEN

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
2. New token → set expiration → Repository access: `jhonnyizidoro/limeai`
3. Permissions: **Packages → Read**
4. Generate → copy token → add as `GHCR_TOKEN` secret in the repo

### Workflow permissions

Go to repo → **Settings → Actions → General → Workflow permissions** → set to **Read and write permissions** → Save.

### Loading the `.pem` key

```bash
cat /path/to/your-key.pem | pbcopy   # macOS
```

Paste the full output (including `-----BEGIN RSA PRIVATE KEY-----` header/footer) as the `SSH_PRIVATE_KEY` secret value.

---

## How the Deployment Works

On every push to `main`, the workflow (`.github/workflows/deploy.yml`):

1. Builds the backend image and pushes to `ghcr.io/jhonnyizidoro/limeai/backend:latest`
2. Builds the frontend image (with `VITE_API_URL` baked in) and pushes to `ghcr.io/jhonnyizidoro/limeai/frontend:latest`
3. SSHs into the server using `appleboy/ssh-action`
4. Writes all secrets to `.env` on the server
5. Runs `git pull origin main` (picks up any `docker-compose.prod.yml` changes)
6. Logs into GHCR and runs `docker compose pull` + `docker compose up -d`

The server never builds images — CI handles it, keeping the server free from memory-intensive build steps.

You can also trigger a manual deploy from **GitHub → Actions → Deploy → Run workflow**.

---

## S3 Bucket Setup

If using `STORAGE_TYPE=s3`, the bucket needs a public read policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

---

## Updating the App

Push to `main` — the GitHub Action handles everything. No manual steps needed.

To check running containers on the server:

```bash
ssh -i your-key.pem ubuntu@<server-ip>
cd /path/to/limeai
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
```
