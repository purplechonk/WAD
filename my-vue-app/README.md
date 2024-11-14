# sLoop

sLoop is a web application built using Vue 3 and Vite.

## Live Deployment
[https://sloop-smu.onrender.com/](https://sloop-smu.onrender.com/)

## Setup Instructions

1. **Navigate to the project directory**  
   Ensure you are within the `my-vue-app` folder. If not, navigate to it:
   ```
   cd my-vue-app
   ```
2. **Install dependencies**
    Run the following command to install the necessary npm packages:
    ```
    npm install
    ```
3. **Run the development server**
    Start the development server by executing:
    ```
    npm run dev
    ```
4. **View the application**
    Once the server is running, open your browser and navigate to http://localhost:5173
    (or the specified localhost link in your terminal) to view the application.

## Dummy Google Account for Access:
1. **Sign in via Google**
    You will be prompted with the Google Sign In pop-up upon login. Please use the following account:
    ```
    chonkyisnotchonky@gmail.com
    Chonky_Is_A_cutie_PIE
    ```

## Usage Notes:
3D Map Pop-up Notice: When accessing the 3D Map feature for the first time, a banner will appear indicating that it is an experimental feature.
This pop-up is for development purposes only and appears in the following files:
    ```
    ./components/General/Map.vue
    ./composables/googleMapHelper
    ```