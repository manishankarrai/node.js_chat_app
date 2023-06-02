let express = require("express");
let app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
let fs = require("fs");
//require('./db/dbconnection');
require("dotenv").config();
const port = process.env.port;
const { User } = require("./model/user.model");
const { Message } = require("./model/msg.model");
const { GroupMsg } = require("./model/group_msg.model");
const { Group } = require("./model/group.model");
const { emit } = require("process");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(express.static("public_3"));

io.use((socket, next) => {
  console.log("-------------------");

  next();
});
let userAuth = (socket , next)=> {
   if(!socket.userId){
       socket.emit('usererror', "user not login , please login again");
   } 
   next();
}

// Handle socket connection
io.on("connection", (socket) => {
  //starting point of any person
  socket.on("join", (userId) => {
    // Store the user ID in the socket object for future reference
    console.log(`User ${userId} joined`);

    User.findOne({ _id: userId })
      .then((data) => {
        socket.userId = userId;
        let allGroup = data.user_group;
        let allContact = data.user_contact;
        if (allGroup[0]) {
          for (let x of allGroup) {
            socket.join(x.usergroup_id);
          }
        }
        if (allContact[0]) {
          for (let y of allContact) {
            socket.join(x.usercontact_id);
          }
        }

        socket.emit("joininfo", data);
        console.log(socket.userId + " some one join ");
        io.emit("forall", "someone join the room " + userId);
      })
      .catch((data) => {
        //error emitting throught it and all comdition terminate
      });

    //
    //join info is important for see user online
  });

  socket.on("privateMessage", userAuth ,(data) => {
    const { recipientId, message } = data;

    // Find the recipient socket by their user ID
    const recipientSocket = io.sockets.in(recipientId);

    if (recipientSocket) {
      // Send the private message to the recipient
      recipientSocket.emit("privateMessage", {
        senderId: socket.userId,
        message: message,
      });
      //upload message data ;
      console.log("sokcet.userId", socket.userId);
      let msg_data = {
        sender_id: socket.userId,
        receiver_id: recipientId,
        message: message,

        value: false,
      };
      Message(msg_data)
        .then((data) => {
          console.log("message data save", data);
        })
        .catch((err) => {
          console.log("there is an error in saving message");
        });
    }
  });
  socket.on("privategroup",userAuth  ,(data) => {
    console.log("data come in private section");
    console.log("group id");
    console.log(data.groupId);

    const { groupId, message } = data;
    console.log(typeof groupId);
    //   const groupSocket = io.socket.in('12345');
    io.to(groupId).emit("privategroup", {
      senderId: socket.userId,
      message: message,
    });
    let G_msg_data = {
      sender_id: socket.userId,
      group_id: groupId,
      message: message,

      value: false,
    };
    GroupMsg(G_msg_data)
      .save()
      .then((data) => {
        console.log(" group message is save succefull");
      })
      .catch((err) => {
        console.log("error in uploading message in db");
      });
    console.log("emit event ");
  });

  // Handle socket disconnectionL
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    socket.broadcast.emit("user_disconnect", {
      description: clients + " clients connected!",
    });
    User.findOne({ _id: socket.userId })
      .then((data) => {
        let allGroup = data.user_group;
        let allContact = data.user_contact;
        if (allGroup[0]) {
          for (let x of allGroup) {
            socket.leave(x.usergroup_id);
          }
        }
        if (allContact[0]) {
          for (let y of allContact) {
            socket.leave(x.usercontact_id);
          }
        }
      })
      .catch((data) => {
        //error emitting throught it and all comdition terminate
      });
  });
});

//crate user
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
//

app.post("/creategroup", async (req, res) => {
  let data = {
    groupname: req.body.groupname , 
    groupcreatedby: req.body.groupcreatedby ,
    groupcreatedby_id: req.body.groupcreatedby_id,
    groupadmin: req.body.groupadmin 
  }
  let result = await Group(data).save();

  res.send({message: "group created successfully" , value: true , data: result});

});

http.listen(port, function () {
  console.log(`server live on ${port} `);
});
