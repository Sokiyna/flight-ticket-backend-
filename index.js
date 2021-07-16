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
let username = ""
const mongoose = require('mongoose');
let num = 1;
io.listen(server);
app.use(cors());
mongoose.connect('mongodb://localhost:27017/flights', { useNewUrlParser: true, useUnifiedTopology: true });
process.env.MONGODB_URI
const orderSchema = new mongoose.Schema({
  clientName: String,
  address: String,
  phone: String,
  Airlines: String,
  counter2: String
});
const orderModel = mongoose.model('ordars', orderSchema);
io.on('connection', (socket) => {
  // console.log('clie.nt connected', socket.id);
  //2a
  socket.on('join', (payload) => {
    socket.join(adminroom);
  });
  socket.on('sendRequest', async (payload) => {
    payload.counter2 = num++;
    let tst = new Order(payload)
    let newtic = await new orderModel(tst)
    newtic.save();
    console.log(newtic)
    socket
      .in(adminroom)
      .emit('newReq', { ...payload, id: uuidv4(), socketId: socket.id });
  });
  socket.on('sendmsg', (payload) => {
    // console.log("test"+JSON.stringify(payload))
    username = payload.userName
    console.log(payload)
    socket
      .in(adminroom)
      .emit('sentMsg', { ...payload, id: uuidv4(), socketId: socket.id });
    // console.log(payload)
  });
  socket.on('getAllQueuing', async () => {
    const allData = await orderModel.find({}).then(function (orders) {
      return orders
    });
    allData.forEach((data) => {
      socket.emit('newReq', data);
    });
    console.log(allData + "tresdA")
  });
  socket.on('handle', (payload) => {
    // console.log(payload.flag)
    if (payload.flag == true) {
      socket.to(payload.studentId).emit('results', {
        name: payload.name,
        flag2: true,
        randomNum: faker.date.future().toLocaleDateString(),
        txt: "Your jorney has been accepted it will be in"
      });
    }
    else {
      socket.to(payload.studentId).emit('results', {
        name: payload.name,
        flag2: false,
        txt: "Sorry Your jorney hasn't been accepted"
      });
    }
  });
  socket.on('replayTo', (payload) => {
    console.log(payload)
    socket.broadcast.emit('replaiedtoUsers', payload, username);
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
class Order {
  constructor(tickets) {
    this.clientName = tickets.clientName;
    this.address = tickets.address;
    this.Airlines = tickets.Airlines;
    this.phone = tickets.phone
    this.counter2 = tickets.counter2
  }
}