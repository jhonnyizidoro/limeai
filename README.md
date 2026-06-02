```
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::limeai/*"
  }]
}
```

```bash
sudo dnf update -y
sudo dnf install docker -y
sudo systemctl start docker
sudo systemctl enable docker
```

```bash
sudo dnf install git -y
git config --global credential.helper store
git clone https://github.com/jhonnyizidoro/limeai.git # username and token will be requested
```
