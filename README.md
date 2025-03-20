This is a simple full-stack web application composed of a backend and a frontend. It utilizes Flask for the backend API and ReactJS for the frontend interface.

# Instructions to launch application on INB labs' PCs

## 1. Clone the repository

Open a Terminal, the launch the following commands:

```Bash
git clone https://github.com/francescodelduchetto/CMP9134-2425-basicWebApp
```

## 2. Open Visual Studio Code Container

1. Make sure that Docker is running on your computer. 
2. Open VS Code.
3. Click on the blue icon in the **bottom left corner of the visual studio window** 
     <img width="59" alt="image" src="https://github.com/francescodelduchetto/RBT1001/assets/7307164/adc84af7-daa9-4470-a550-06e017a5cf2c">

4. Select "Reopen in Container..."
5. Locate the folder `CMP9134-2425-basicWebApp`, select it and click Open
6. Wait until the setup is complete.


## 3. Install requirements
:exclamation: The following commands needs to be launched from terminals inside VSCode (click Terminal > New Terminal).

1. Install Python package requirements:
     ```Bash
     pip install -r requirements.txt
     ```
2. Install NodeJs and its requirements:
     ```Bash
     curl -sL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
     ```
     ```Bash
     sudo bash nodesource_setup.sh && sudo apt install -y nodejs
     ```
     ```Bash
     cd frontend
     ```
     ```Bash
     npm install
     ```

## 4. Launch backend
Open a new VSCode Terminal and launch the following commands.

```Bash
cd ../backend
```
```Bash
python main.py
```

## 5. Launch frontend
On a different terminal, launch:

```Bash
cd frontend
```
```Bash
npm run dev
```
This will start the development server for the frontend, usually accessible at http://localhost:5173/.

# ❗If you plan to work with this template on your personal computer, you need the following installation steps as prerequisite

### Setup your environment

1. Make sure you have Docker installed: https://docs.docker.com/engine/install/
2. Make sure you have VSCode installed: https://code.visualstudio.com/download
3. Make sure you have git installed: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
4. Make sure you have the `Docker` and the `Dev Containers` extension in VSCode installed and working: https://code.visualstudio.com/docs/containers/overview and https://code.visualstudio.com/docs/devcontainers/containers
    * ensure docker is working, i.e. try `docker run --rm hello-world` and check it succeeds for your user

## CREDITS:
Adapted from: [https://github.com/Pakheria/Basic-Web-Application](https://github.com/Pakheria/Basic-Web-Application)

