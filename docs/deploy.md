# Deployment Guide

Deploys automatically to an EC2 server via GitHub Actions on every push to `main`. The workflow SSHs into the server, writes the `.env` from GitHub Secrets, pulls the latest code, and rebuilds the Docker containers.

---

## Architecture

```
EC2 (Ubuntu)
├── postgres        — PostgreSQL 17 (named volume, persists across deploys)
├── backend         — Elysia API on port 3000 (built from source)
├── frontend        — React app served by nginx on port 80 (built from source)
└── static          — nginx serving uploaded audio files on port 8080
```

The frontend is compiled at image build time with `VITE_API_URL` baked in. The backend TypeScript is compiled with `tsup` and run with Node.

---

## Server Setup (Ubuntu)

Run these commands once on a fresh Ubuntu EC2 instance.

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

### Loading the `.pem` key

```bash
cat /path/to/your-key.pem | pbcopy   # macOS
```

Paste the full output (including `-----BEGIN RSA PRIVATE KEY-----` header/footer) as the `SSH_PRIVATE_KEY` secret value.

---

## How the Deployment Works

On every push to `main`, the workflow (`.github/workflows/deploy.yml`):

1. SSHs into the server using `appleboy/ssh-action`
2. Writes all secrets to `.env` on the server
3. Runs `git pull origin main`
4. Runs `docker compose -f docker-compose.prod.yml up --build -d`

Docker rebuilds only the images whose source changed (layer caching applies).

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
