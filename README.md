This is a simple full-stack web application composed of a backend and a frontend. It utilizes Flask for the backend API and ReactJS for the frontend interface. Additionally, it makes use of Docker to ensure easy enviroment setup on any machine to replicate functionality.

## 1. Clone the repository

Open a Terminal, the launch the following commands:

```
git clone https://github.com/alexreynlds/software-engineering
```

## 2. Open a terminal and cd to the location of the root of the folder

When running 

```
tree -L 1
```
if you have tree installed it should return:
```
╰─ tree -L 1
.
├── backend
├── docker-compose.yml
├── frontend
├── node_modules
├── package-lock.json
├── package.json
├── prettier.config.js
└── README.md
```


## 3. Build the containers
From this directory, type:

```
docker-compose build --no-cache
```

Which should build the two containers

## 4. Launch the containers
After building has completed you can run the containers by typing:

```
docker-compose up
```

## 5. Open frontend
Now that the containers are live navigate to:

```
http://localhost:5173/dashboard
```

In a web browser of your choice.

```
If needed, that backend can be found at port 5050
```
