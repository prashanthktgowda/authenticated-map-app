# Authenticated Map App - Intern Assignment

This is a React-based web application that allows authenticated users to plot a route between two points on a map. It includes bonus features like using the device's current location and displaying route information.

## ✅ Features

-   🔐 **Authentication:** Users must sign in with their Google account to access the app.
-   🗺️ **Interactive Map:** Displays a map using Leaflet.
-   📍 **Route Plotting:** Users can click two points on the map (Point A and Point B) to draw a driving route.
-   🛰️ **Use Current Location:** A button allows users to set Point A to their current geographical location.
-   📊 **Route Details:** Shows the total distance and estimated travel time for the plotted route.
-   📱 **Responsive Design:** The layout adjusts for a better experience on mobile devices.
-   ⏳ **Loading States:** Provides user feedback when the app is loading or finding the user's location.

## 💻 Tech Stack

-   **Frontend:** React (Create React App)
-   **Authentication:** Firebase Authentication (Google Sign-In)
-   **Mapping:** React Leaflet
-   **Routing:** Leaflet Routing Machine

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or later)
-   npm or yarn
-   A Google account for Firebase setup

### Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/prashanthktgowda/authenticated-map-app.git
    cd authenticated-map-app
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Firebase:**
    -   Create a Firebase project and a web app within it.
    -   Enable Google Sign-In as an authentication method.
    -   Create a `.env` file in the project root.
    -   Copy your Firebase web app configuration into the `.env` file. The keys must be prefixed with `REACT_APP_`.

    ```.env
    REACT_APP_FIREBASE_API_KEY="YOUR_API_KEY"
    REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    REACT_APP_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
    REACT_APP_FIREBASE_APP_ID="YOUR_APP_ID"
    ```

4.  **Run the application:**
    ```sh
    npm start
    ```
    The app will be available at `http://localhost:3000`.