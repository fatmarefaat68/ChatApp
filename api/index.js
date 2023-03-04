const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const fs = require("fs");
const Port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) throw err;
});
// const connectDb = async () => {
//   try {
//     mongoose.set("strictQuery", false);
//     console.log(
//       "database connected...",
//       connect.connection.host,
//       connect.connection.name
//     );
//   } catch (error) {
//     console.log(error.message, " i am error in connect");
//   }
// };

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.use("/auth", require("./routes/user"));
app.use("/", require("./routes/message"));

const server = app.listen(
  Port
  //   ,() => {
  //   console.log(`listening to port...${Port}`);
  // }
);

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  // console.log(req.headers.cookie || "no cookie");

  //for updating status of person if he offline ater online vice versa
  /*
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      connection.terminate();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });
  */
  //read from cookie to this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.includes(";")
      ? cookies.split[";"].find((str) => str.startsWith("token="))
      : cookies;
    const token = tokenCookieString.split("=")[1];
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        const { userId, username } = userData;
        connection.userId = userId;
        connection.username = username;
      });
    }
    // console.log(token);
  }
  // console.log([...wss.clients].map((client) => client.username));

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message);
    const { recipient, text, file } = messageData;
    let filename = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + filename;
      const bufferData = new Buffer(file.data, "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file saved" + path);
      });
    }
    if (recipient && text) {
      //sending to db
      const msg = await new Message({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      msg.save();

      //using filter so if user open in browser and mobile for example (many devices ya3ny)
      [...wss.clients]
        .filter((client) => client.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              recipient,
              sender: connection.userId,
              _id: msg._id,
            })
          )
        );
    }
  });

  //notify everyone about online people
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((client) => ({
          userId: client.userId,
          username: client.username,
        })),
      })
    );
  });
});

//password
/*ZPX9iruwIbbYMKo7*/
