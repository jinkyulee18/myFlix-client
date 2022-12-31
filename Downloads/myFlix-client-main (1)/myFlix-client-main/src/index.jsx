import React from 'react';
import { createRoot } from "react-dom/client";
import { mainView } from "./components/main-view/";
import { movieCard } from './components/movie-view';
import "./index.scss";

const App = () => {
 return (
    <div>
        <mainView />
        <movieCard />
    </div>

 )
};

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(<App />);
