const express = require('express');
const app = express();
const http = require('http');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const server = http.createServer(app);
const io = require('socket.io')(http);
const staffRoom = 'staff';
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

io.listen(server);

app.use(cors());
// app.get('/hi', (req, res) => {
//   res.send('Hello World');
// });

io.on('connection', (socket) => {
  // console.log('clie.nt connected', socket.id);
  //2a
  socket.on('join', (payload) => {
    // socket.join will put the socket in a private room
    socket.join(staffRoom);
    socket.to(staffRoom).emit('onlineStaff', { name: payload.name, id: socket.id });
  });
  socket.on('createTicket', (payload) => {
    // 2
    socket
      .in(staffRoom)
      .emit('newTicket', { ...payload, id: uuidv4(), socketId: socket.id });
  });
  //sendmsg
  socket.on('sendmsg', (payload) => {

    socket
      .in(staffRoom)
      .emit('sentMsg', {msg:payload.msg,time:payload.created_at, id: uuidv4(), socketId: socket.id ,userName:payload.userName});
  });

socket.on('replay', (payload) => {

  socket
    .to(payload.id)
    .emit('replaymsg', {msg:payload.msg,time:payload.created_at});
});
  socket.on('handle', (payload) => {

    // console.log(payload.flag)
    if(payload.flag==true)
    {
    socket.to(payload.studentId).emit('claimed', { name: payload.name,
        randomNum : faker.date.future().toLocaleDateString(),
    txt:"Your jorney has been accepted it will be in"
    });
  }
  else
  {
    socket.to(payload.studentId).emit('claimed', { name: payload.name,
      randomNum : '',
  txt:"Sorry Your jorney hasn't been accepted" 
  });
  }
  
  });
  socket.on('disconnect', () => {
    socket.to(staffRoom).emit('offlineStaff', { id: socket.id });
  });
});
server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});