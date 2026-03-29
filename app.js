require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const ownersRouter = require('./routes/ownersRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');
const index = require('./routes/index');
const config = require('config');
const db=require('./config/mongoose-connection');
const flash = require('connect-flash');
const session = require('express-session');


app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(session({
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: true,
})
);
app.use(flash());// flash ma kya ha vo error da ga fir vo redirect kara ga other page pa tu haam messahe ko vaha ki excess kar sakta ha 




app.use("/owners", ownersRouter);
app.use("/users", usersRouter)
app.use("/products", productsRouter)
app.use("/", index);


app.get('/', (req, res) => {
  res.send('hey');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;