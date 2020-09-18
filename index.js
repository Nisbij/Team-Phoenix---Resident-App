const express = require('express');
const connectUserDB = require('./config/userDB');
const app = express();

//Database connections
connectUserDB();

//Express-parser
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

//including all routes
app.use('/signup', require('./Routes/UserRoutes/signUp'));
app.use('/signin', require('./Routes/UserRoutes/signIn'));
app.use('/test', require('./Routes/PostRoutes/testRoute'));
app.use('/updatelocation', require('./Routes/UserRoutes/update'));
app.use('/posts', require('./Routes/PostRoutes/post'));
app.use('/googlesignup', require('./Routes/UserRoutes/googleSignUp'));
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
