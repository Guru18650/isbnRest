schedule = require("node-schedule")
mysqldump = require("mysqldump")
require("dotenv").config();
schedule.scheduleJob("0 0 * * *", () => {
  backup();
});

function backup() {
  var d = new Date().getTime();
  mysqldump({
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    dumpToFile: "C:/dumps/dump"+d+".sql",
  });
}

