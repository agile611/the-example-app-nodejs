## The node.js example app

The node.js example app teaches the very basics of how to work with Contentful:

- consume content from the Contentful Delivery and Preview APIs
- model content
- edit content through the Contentful web app

## Requirements

* Node 8
* Git
* Contentful CLI (only for write access)

Without any changes, this app is connected to a Contentful space with read-only access. To experience the full end-to-end Contentful experience, you need to connect the app to a Contentful space with read _and_ write access. This enables you to see how content editing in the Contentful web app works and how content changes propagate to this app.

## Common setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/contentful/the-example-app.nodejs.git
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
You can also run this app as a Docker container:

Step 1: Clone the repo

```bash
git clone https://github.com/contentful/the-example-app.nodejs.git
```

Step 2: Build the Docker image

```bash
docker build -t the-example-app.nodejs .
```

Step 3: Run the Docker container locally:

```bash
docker run -p 3000:3000 -d the-example-app.nodejs
```

## Jenkins integration

How to build in Jenkins

```bash
docker stop the-example-app
docker rm the-example-app
docker build -t the-example-app.nodejs .
docker tag the-example-app.nodejs:latest the-example-app
docker run --name the-example-app -p 3000:3000 -d the-example-app
```

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
docker tag bb38976d03cf yourhubusername/verse_gapminder:firsttry
```

Step 4: Push your image to the Docker hub
```bash 
docker push yourhubusername/verse_gapminder:firsttry
```

