

import React from "react";
import ReactDOM from "react-dom";
import Container from "react-bootstrap/Container";
import { MainView } from "./components/main-view/main-view"; // to remove the curly braces from the MainView , add default keyword to the export in main-view.jsx i.e export default Mainview
// Import statement to indicate that you need to bundle `./index.scss`
import "./index.scss";

// Main component (will eventually use all the others)
class MyFlixApplication extends React.Component {
  render() {
    return (
      <Container>
        <MainView />
      </Container>
    );
  }
}

// Finds the root of your app
const container = document.getElementsByClassName("app-container")[0];

// Tells React to render your app in the root DOM element