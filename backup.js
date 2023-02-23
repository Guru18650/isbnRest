import schedule from "node-schedule";
import mysqldump from "mysqldump";
require("dotenv").config();

schedule.scheduleJob("0 0 * * *", () => {
  backup();
});

function backup() {
  mysqldump({
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    dumpToFile: "./dump.sql",
  });
}
