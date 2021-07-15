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
const mongoose = require('mongoose');

io.listen(server);

const queue = {
  tickets: [],
  staff: [],
};

mongoose.connect('mongodb://localhost:27017/ordars', { useNewUrlParser: true, useUnifiedTopology: true });
const orderSchema = new mongoose.Schema({
  clientName: String,
  address: String,
  phone: String,
  Airlines:String,
  id:String,
});
const orderModel = mongoose.model('ordars', orderSchema);

class Order {
  constructor(tickets) {
    this. clientName = tickets. clientName;
    this.address = tickets.address;
    this.Airlines = tickets.Airlines;
    this.id = tickets.id;

  }
}
app.get('/admin', getOrderHandler);


function getOrderHandler(req, res) {
  console.log(queue.tickets)
  const dataTickets = queue.tickets.map(element => {
    return new Order(element);
  })
  res.send(dataTickets);
  console.log(dataTickets);
}

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
    const flightData = { ...payload, id: uuidv4(), socketId: socket.id };
    queue.tickets.push(flightData);
    console.log(flightData);
    socket
      .in(adminroom)
      .emit('newReq', { ...payload, id: uuidv4(), socketId: socket.id });
  });
  socket.on('sendmsg', (payload) => {
    // console.log("test"+JSON.stringify(payload))
    socket
    .in(adminroom)
.emit('sentMsg', { ...payload, id: uuidv4(), socketId:socket.id});
// console.log(payload)
  });
  //sendmsg

// socket.on('replay', (payload) => {

//   socket
//     .to(payload.id)
//     .emit('replaymsg', {msg:payload.msg,time:payload.created_at});
// });
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


  socket.on('replayTo', (payload) => {

//  socket.to(payload.studentId).emit('claimed', { name: payload.name,
//       randomNum : '',
//   txt:"Sorry Your jorney hasn't been accepted" 
//   });
//   }
    socket.broadcast.emit('replaiedtoUsers', payload);

  });




  socket.on('disconnect', () => {
    socket.to(adminroom).emit('offlineStaff', { id: socket.id });

    console.log("offline")
  });
});
server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});