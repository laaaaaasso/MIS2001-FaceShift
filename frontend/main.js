import { bootstrapApp } from "./src/app.js";

const root = document.getElementById("app");
if (!root) {
  throw new Error("Missing #app root element in index.html");
}
bootstrapApp(root);
