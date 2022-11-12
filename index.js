import express from "express";
import dotenv from "dotenv";
import main from "./route/main.js";
import api from "./route/api.js";
import os from "os";



dotenv.config();

const app = express();

app
  .set("view engine", "ejs")
  .set("views", "views")
  .use(express.static("public"))
  .use(express.urlencoded({ extended: true }))
  .use("/", main)
  .use("/api", api)
  .use((r) => r.res.render("./pages/404", { title: "404" }));

async function start() {
  try {
    app.listen(process.env.PORT, () =>
      console.log(
        `Сервер запущен! http://${os.hostname()}:${process.env.PORT}`
      )
    );
  } catch (e) {
    console.log(e);
  }
}
start();
