import { Router } from "express";
import pool from "../db.js";
import CORS from "../CORS.js";

const headers = {'Content-Type':'text/html; charset=utf-8',...CORS}

const route = Router();

export default route
  .get("/getcarlist/:class", async (r) => {
    r.res.set(headers);
    if (r.params.class.toString() === "0") {
      const data = await pool.query(
        'SELECT CAR.id, CAR.model, CAR.year, CAR.photo, CL.class, CL.cost, COALESCE(RT.rating,0) AS rating FROM carsharing.cars CAR LEFT JOIN carsharing.class CL ON CAR.class = CL.id LEFT JOIN (SELECT O.id_car, ROUND(AVG(O.rating),2) AS rating FROM carsharing.order O GROUP BY O.id_car) RT ON RT.id_car = CAR.id WHERE CAR.id NOT IN ( SELECT id_car FROM carsharing.order WHERE finish_timestamp IS NULL)  ORDER BY CAR.model'
      );
      r.res.send(data.rows);
    } else {
      const data = await pool.query(
        'SELECT CAR.id, CAR.model, CAR.year, CAR.photo, CL.class, CL.cost, COALESCE(RT.rating,0) AS rating FROM carsharing.cars CAR LEFT JOIN carsharing.class CL ON CAR.class = CL.id LEFT JOIN (SELECT O.id_car, ROUND(AVG(O.rating),2) AS rating FROM carsharing.order O GROUP BY O.id_car) RT ON RT.id_car = CAR.id WHERE CAR.id NOT IN ( SELECT id_car FROM carsharing.order WHERE finish_timestamp IS NULL) AND CAR.class = $1 ORDER BY CAR.model',
        [r.params.class.toString()]
      );
      r.res.send(data.rows);
    }
  })
  .get("/history/:id_user", async (r) => {
    r.res.set(headers);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(tz);
    const data = await pool.query(
      'SELECT CAR.model, to_char(to_timestamp(O.start_timestamp)::timestamp,\'YYYY-MM-DD HH24:MI:SS\') as start_timestamp, to_char(to_timestamp(O.finish_timestamp)::timestamp,\'YYYY-MM-DD HH24:MI:SS\') as finish_timestamp, O.rating, O.summary FROM carsharing.order O LEFT JOIN carsharing.cars CAR ON CAR.id = O.id_car WHERE O.id_user = $1  ',

      [r.params.id_user]
    );

    r.res.send(data.rows);
  })
  .all("/getclasses/", async (r) => {
    r.res.set(headers);
    const data = await pool.query(
      'SELECT id, class FROM carsharing.class'
    );

    r.res.send(data.rows);
  });
