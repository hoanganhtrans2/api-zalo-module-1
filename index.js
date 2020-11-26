const cors = require("cors");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
require("dotenv").config();

const PORT = process.env.PORT;

const userRoutes = require("./routes/users.routes");
const loginRoutes = require("./routes/login.routes");
const friendRoutes = require("./routes/friend.routes");
const chatRoutes = require("./routes/chat.routes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// io.on("connection", (socket) => {
//   socket.on("connectnotify", (room) => {
//     socket.join(room.id);
//   });
//   socket.on("userconnect", (data) => {
//     io.in(data.id).emit("notify", data.model);
//   });
// });

app.use(cors());

app.use("/api/user", userRoutes);

app.use("/api", userRoutes);

app.use("/api/friend", friendRoutes);

app.use("/api", loginRoutes);

app.use("/api", chatRoutes);

http.listen(PORT, () => {
  console.log(`Api listening at http://localhost:${PORT}`);
});

/* lỗi
  app.listen(PORT, () => {
  console.log(`Api listening at http://localhost:${PORT}`);
});
*/
