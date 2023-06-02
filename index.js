


let express = require('express');
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
let fs = require('fs');

 
app.use(express.urlencoded({
    extended: true
})); 
app.use(express.static('public')); 
 
users = [];
io.on('connection', function(socket){
   console.log('A user connected');
   socket.on('setUsername', function(data){
      console.log(data);
      if(users.indexOf(data) > -1){
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data); 
         socket.emit('userSet', {username: data});
      }
   });
   socket.on('msg', function(data){ 
      //Send message to everyone
      io.sockets.emit('newmsg', data); 
   });
   socket.on('fileUpload', function(data) {
      const fileName = data.fileName.trim();
      const fileData = data.filedata;
      if(fileData) {
         console.log('file receive in back');
         console.log(fileName) ;
      }
      const decodedData = Buffer.from(fileData, 'base64');

    // Specify the path where the file will be saved
    const filePath = 'public/images/' + fileName;

    // Save the file to the file system
    fs.writeFile(filePath, decodedData, function(err) {
      if (err) {
        console.error('Error saving file:', err);
        return;
      }

      console.log('File saved successfully:', filePath);
    });
    
    let typeofFile = filePath.split('.');
    let myfile_ext = typeofFile[typeofFile.length - 1];
    let img_exist = ['jpeg' , 'jpg' , 'png' ,'gif' , 'svg' , 'bmp'] ;
     let file_value = img_exist.some(x => x == myfile_ext);
      
    let img_link = 'http://localhost:3000/images/' + fileName ;
    let send_data = { 
      imglink : img_link, 
      imgname : fileName,  
      imgbool : file_value , 
      user: data.user
    }
    io.sockets.emit('filedata', send_data); 
   
   });
});
//group conccetion
var hero = io.of('/heros');
hero.on('connection', function(socket){
     hero.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    // socket.emit('newclientconnect',{ description: 'Hey, welcome!'});
     socket.broadcast.emit('newclientconnect',{ description: clients + ' clients connected!'})
     socket.on('disconnect', function () {
      clients--;
      hero.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
   });
});
 

// app.get('/', (req, res)=>{
//     console.log("app route work")
//     res.send('welcome here');
    
// });    

// app.get('/site', function(req, res){ 
//    res.render('index.html');
// });

http.listen(3000, function(){ 
   console.log('listening on *:3000'); 
});  

 
       