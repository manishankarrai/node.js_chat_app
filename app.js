let express = require("express");
let app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
let fs = require("fs");
require("./db/dbconnection");
require("dotenv").config();
const port = process.env.port;
const { User } = require("./model/user.model");
const { Message } = require("./model/msg.model");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(express.static("public_2"));

users = [];
io.on("connection", function (socket) {
  console.log("connncetion start");
  socket.broadcast.emit("conn", socket.id);
  let countno = 0;
  let socketId = socket.id;
  console.log("socket id", socketId);

  console.log("A user connected");
  //send data to receiver .. first data come in comman way and then receive
  socket.on("usermessage", function (data) {
    countno = countno + 1;
    console.log("count no ", countno);

    console.log("data come inside message", data);
    socket.broadcast.emit(data.receiver_id, data);

    Message(data)
      .save()
      .then((m) => console.log("success", m))
      .catch((error) => console.log(err));
  });
  // socket.on('messagevalue' , function(data) {
  //    Message.updateOne({_id: req.params.id}, {$set: req.body }).then((m)=> console.log("success")).catch(error => console.log(err)) ;
  // });
  socket.on("setUsername", function (data) {
    console.log(data);
    if (users.indexOf(data) > -1) {
      socket.emit(
        "userExists",
        data + " username is taken! Try some other username."
      );
    } else {
      users.push(data);
      socket.emit("userSet", { username: data });
    }
  });
  socket.on("msg", function (data) {
    //Send message to everyone
    io.sockets.emit("newmsg", data);
  });
  socket.on("fileUpload", function (data) {
    const fileName = data.fileName.trim();
    const fileData = data.filedata;
    if (fileData) {
      console.log("file receive in back");
      console.log(fileName);
    }
    const decodedData = Buffer.from(fileData, "base64");

    // Specify the path where the file will be saved
    const filePath = "public/images/" + fileName;

    // Save the file to the file system
    fs.writeFile(filePath, decodedData, function (err) {
      if (err) {
        console.error("Error saving file:", err);
        return;
      }

      console.log("File saved successfully:", filePath);
    });

    let typeofFile = filePath.split(".");
    let myfile_ext = typeofFile[typeofFile.length - 1];
    let img_exist = ["jpeg", "jpg", "png", "gif", "svg", "bmp"];
    let file_value = img_exist.some((x) => x == myfile_ext);

    let img_link = "http://localhost:3000/images/" + fileName;
    let send_data = {
      imglink: img_link,
      imgname: fileName,
      imgbool: file_value,
      user: data.user,
    };
    io.sockets.emit("filedata", send_data);
  });
});
//group conccetion
let date = new Date().toUTCString();
console.log(date);
var hero = io.of("/heros");
hero.on("connection", function (socket) {
  hero.sockets.emit("broadcast", {
    description: clients + " clients connected!",
  });
  // socket.emit('newclientconnect',{ description: 'Hey, welcome!'});
  socket.broadcast.emit("newclientconnect", { 
    description: clients + " clients connected!",
  });
  socket.on("disconnect", function () {
    clients--;
    hero.sockets.emit("broadcast", {
      description: clients + " clients connected!",
    });
  });
});

// app.get('/', (req, res)=>{
//     console.log("app route work")
//     res.send('welcome here');

// });

// app.get('/site', function(req, res){
//    res.render('index.html');
// });

app.post("/createuser", async (req, res) => {
  let data = req.body;
  console.log(req.body);
  console.log(data);
  let result = await User(data).save();
  console.log(result);
  if (result) {
    res.send({ message: "user create successfully", user: result });
  } else {
    res.send("there is an error , please try again");
  }
});
app.get("/getalluser", async (req, res) => {
  let data = await User.find();
  res.send({ message: "successfully  ", user: data });
});
app.post("/userlogin", async (req, res) => {
  console.log("user come for login", req.body);
  let data = req.body;
  let result = await User.findOne(data);
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(500);
  }
  console.log("user data auth", result);
});
app.post("/addfriend", async (req, res) => {
  let data = req.body;
  console.log(req.body);
  let data_format = {
    usercontact: data.usercontact,
    usercontact_id: data.usercontact_id,
  };
  let find_user = await User.findOne({ _id: data.userid });
  let contact_exist = find_user.user_contact;
  console.log("contact exist", contact_exist);
  // console.log(contact_exist);
  let newdata = contact_exist.push(data_format);
  console.log(contact_exist);
  let result = await User.updateOne(
    { _id: data.userid },
    { $set: { user_contact: contact_exist } }
  );
  if (result) {
    console.log("result pas");
    res.send({ message: "contact add successfullly", value: true });
  } else {
    console.log("result fail");
    res.send({
      message: "somthing error , please try once agin",
      value: false,
    });
  }
});
app.put("/addgroup", async (req, res) => {
  let data = req.body;
  let data_format = {
    usergroup: data.usergroup,
    usergroup_id: data.usergroup_id,
  };
  let find_user = await User.findOne({ _id: data.userid });
  let group_exist = find_user.user_group;
  console.log(group_exist);
  let newdata = group_exist.push(data_format);

  let result = await User.updateOne(
    { _id: data.userid },
    { $set: { user_group: newdata } }
  );
  if (result) {
    res.send({ message: "Group add successfullly", value: true });
  } else {
    res.send({
      message: "somthing error , please try once agin",
      value: false,
    });
  }
});
app.post("/creategroup", async (req, res) => {});

http.listen(port, function () {
  console.log(`server live on ${port} `);
});
