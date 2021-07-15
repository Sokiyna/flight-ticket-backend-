const express = require('express');
const app = express();
const http = require('http');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const server = http.createServer(app);
const io = require('socket.io')(http);
const adminroom = 'adminroom';
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');
let username=""
io.listen(server);

app.use(cors());
// app.get('/hi', (req, res) => {
//   res.send('Hello World');
// });

io.on('connection', (socket) => {
  // console.log('clie.nt connected', socket.id);
  //2a
  socket.on('join', (payload) => {
    socket.join(adminroom);
  });
  socket.on('sendRequest', (payload) => {
    socket
      .in(adminroom)
      .emit('newReq', { ...payload, id: uuidv4(), socketId: socket.id });
  });
  socket.on('sendmsg', (payload) => {
    // console.log("test"+JSON.stringify(payload))
    username=payload.userName
    console.log(payload)
    socket
    .in(adminroom)
.emit('sentMsg', { ...payload, id: uuidv4(), socketId:socket.id});
// console.log(payload)
  });

  socket.on('handle', (payload) => {
    // console.log(payload.flag)
    if(payload.flag==true)
    {
    socket.to(payload.studentId).emit('results', { name: payload.name,
      flag2 :true ,
        randomNum : faker.date.future().toLocaleDateString(),
    txt:"Your jorney has been accepted it will be in"
    });
  }
  else
  {
    socket.to(payload.studentId).emit('results', { name: payload.name,
      flag2 :false ,
  txt:"Sorry Your jorney hasn't been accepted" 
  });
  }
  });


  socket.on('replayTo', (payload) => {

//  socket.to(payload.studentId).emit('results', { name: payload.name,
//       randomNum : '',
//   txt:"Sorry Your jorney hasn't been accepted" 
//   });
//   }

console.log(payload)
    socket.broadcast.emit('replaiedtoUsers', payload,username);
//payload.userId
  });




  socket.on('disconnect', () => {
    socket.to(adminroom).emit('offlineStaff', { id: socket.id });

    console.log("offline")
  });
});
server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});