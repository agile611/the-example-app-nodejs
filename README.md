## The Example node.js example app

The node.js example app teaches the very basics of how to work with Contentful:

- consume content from the Contentful Delivery and Preview APIs
- model content
- edit content through the Contentful web app

## Requirements

* Node 8.9.3 (see `.nvmrc`)
* Git
* Contentful CLI (only for write access)

Without any changes, this app is connected to a Contentful space with read-only access. To experience the full end-to-end Contentful experience, you need to connect the app to a Contentful space with read _and_ write access. This enables you to see how content editing in the Contentful web app works and how content changes propagate to this app.

## Common setup

Clone the repo and install the dependencies.

```bash
cd the-example-app.nodejs
```

```bash
npm install
```

## Steps for read-only access

To start the express server, run the following

```bash
npm run start:dev
```

Open [http://localhost:3000](http://localhost:3000) and take a look around.

## Create the Docker Container

You can run this app as a Docker container using either of the two provided Dockerfiles:

### Option 1: Standard Dockerfile (node:alpine base)

```bash
# Build the Docker image
docker build -t the-example-app-nodejs .

# Run the Docker container locally
docker run --name the-example-app-nodejs -p 3000:3000 -d the-example-app-nodejs
```

### Option 2: Multi-architecture Dockerfile (DockerfileAlpine)

This Dockerfile supports building for multiple architectures:
- `linux/386`
- `linux/amd64`
- `linux/arm/v6`
- `linux/arm/v7`
- `linux/arm64/v8`
- `linux/ppc64le`
- `linux/riscv64`
- `linux/s390x`

#### Build for a single architecture (local testing)

```bash
# Build for current architecture
docker build -t the-example-app-nodejs:alpine -f DockerfileAlpine .

# Run locally
docker run --name the-example-app-nodejs-alpine -p 3000:3000 -d the-example-app-nodejs:alpine
```

#### Build for multiple architectures (requires Docker Buildx)

```bash
# Create and use a buildx builder (one-time setup)
docker buildx create --name multiarch --use --bootstrap

# Build and push for all supported architectures
docker buildx build \
  --platform linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/riscv64,linux/s390x \
  -t your-registry/your-image:tag \
  -f DockerfileAlpine \
  --push \
  .
```

> **Note:** Multi-arch builds require `--push` to a registry (Docker Hub, GHCR, etc.) as the manifest list cannot be loaded locally with `docker load`.

## Jenkins Integration

How to build in Jenkins using the standard Dockerfile:

```bash
docker stop the-example-app
docker rm the-example-app
docker build -t the-example-app.nodejs .
docker tag the-example-app.nodejs:latest the-example-app
docker run --name the-example-app -p 3000:3000 -d the-example-app
```

You can also use the provided Jenkinsfiles:
- `Jenkinsfile` - Basic pipeline
- `JenkfinsFileWithVariables` - Pipeline with variables
- `NodeJsJenkinsfile` - Node.js specific pipeline
- `BuildDockerJenkinsfile` - Docker build pipeline

## Upload your example to Docker Hub

Step 1: Log into the Docker Hub
```bash
docker login
```

Step 2: Check the image id of the image you created
```bash
docker images
```

Step 3: Tag your image accordingly with your Docker hub user
```bash
docker tag <image-id> yourhubusername/your-repo:tag
```

Step 4: Push your image to the Docker hub
```bash 
docker push yourhubusername/your-repo:tag
```

## Dockerfile Details

### Dockerfile (Standard)
- Base: `node:alpine`
- Uses default `node` user
- Simple, single-architecture build

### DockerfileAlpine (Multi-arch)
- Base: `alpine:3.24`
- Explicitly installs `nodejs` and `npm` via `apk`
- Creates dedicated `nodejs` user (UID 1000) for security
- Uses `npm ci --only=production` for faster, reproducible builds
- Supports 8 architectures via Docker Buildx
- Better layer caching with package files copied first
