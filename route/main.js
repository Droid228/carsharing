import { Router } from "express";
import fs from "fs";
import CryptoJS from "crypto-js";
import pool from "../db.js";
import { v4 } from "uuid";
import os from "os";
import dotenv from "dotenv";

dotenv.config();
const host = os.hostname();
const port = process.env.PORT;
const route = Router();

export default route
  .get("/", (r) => {
    r.res.render("./pages/index", { title: "Главная страница" });
  })
  .get("/register", (r) => {
    r.res.render("./pages/register", { title: "Регистрация" });
  })
  .post("/register", (r) => {
    pool.query(
      'INSERT INTO carsharing.users (id,lastname, firstname, login, password, phone, email) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [
        v4(),
        r.body.last_name,
        r.body.first_name,
        r.body.login,
        CryptoJS.SHA256(r.body.password).toString(),
        r.body.phone,
        r.body.email,
      ],
      (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows[0]);
        }
      }
    );
    // console.log(date);
    r.res.redirect("/");
  })
  .post("/login", async (r) => {
    const res = await pool.query(
      'SELECT id, login, password FROM carsharing.users WHERE login = $1',
      [ r.body.login]
    );
    console.log(res.rows[0]);
    if (res.rows.length!==0 &&
      r.body.login === res.rows[0].login &&
      CryptoJS.SHA256(r.body.password).toString() === res.rows[0].password
    )
      r.res.redirect("/main/" + res.rows[0].id);
    else r.res.send("Fail");
  })
  .get("/main/:id", async (r) => {
    const host = os.hostname();
    const route = Router(); 
    const res = await pool.query(
      'SELECT COUNT(*) AS cnt FROM carsharing.order WHERE id_user = $1 AND finish_timestamp IS NULL',
      [r.params.id]
    );
    console.log(res.rows[0].cnt);
    if (parseInt(res.rows[0].cnt) === 0)
      r.res.render("./pages/main", {
        title: "Главная страница",
        id_user: r.params.id,
        host, port
      });
    else {
      const RENT = await pool.query(
        'SELECT id_user, id_car FROM carsharing.order WHERE id_user = $1 AND finish_timestamp IS NULL',
        [r.params.id]
      );
      console.log(RENT.rows);
      r.res.redirect(
        "/return/" + RENT.rows[0].id_car + "/" + RENT.rows[0].id_user
      );
    }
  })
  .get("/rent/:id_car/:id_user", (r) => {
    pool.query(
      'INSERT INTO carsharing.order (id_user,id_car, start_timestamp) VALUES ($1,$2,$3)',
      [r.params.id_user, r.params.id_car, Math.floor(Date.now() / 1000)],
      (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          r.res.redirect("/return/" + r.params.id_car + "/" + r.params.id_user);
        }
      }
    );
  })
  .get("/return/:id_car/:id_user", (r) => {
    const host = os.hostname();
    const route = Router(); 
    r.res.render("./pages/car_return", {
      title: "Возврат автомобиля",
      data: { id_car: r.params.id_car, id_user: r.params.id_user },
      host, port
    });
  })
  .post("/return/:id_car/:id_user", (r) => {
    pool.query(
      'UPDATE carsharing.order SET finish_timestamp = $1, rating = $2 WHERE id_user = $3 AND id_car = $4 AND finish_timestamp IS NULL',
      [
        Math.floor(Date.now() / 1000),
        parseInt(r.body.rating),
        r.params.id_user,
        r.params.id_car,
      ],
      (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          pool.query(
            'UPDATE carsharing.order SET summary = (SELECT ROUND(CO.cost*(O.finish_timestamp-O.start_timestamp)/60,2) AS COST FROM carsharing.order O LEFT JOIN carsharing.cars CAR ON O.id_car = CAR.id LEFT JOIN carsharing.class CO  ON CAR.class = CO.id WHERE O.id_user = $1 AND O.summary IS NULL) WHERE id_user = $2 AND summary IS NULL',
            [r.params.id_user, r.params.id_user],
            (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                r.res.redirect("/main/" + r.params.id_user);
              }
            }
          );
        }
      }
    );
  })
  .get("/history/:id", (r) => {
    const host = os.hostname();
    const route = Router(); 
    r.res.render("./pages/drive_history", {
      title: "История поездок",
      id_user: r.params.id,
      host, port
    });
  });
