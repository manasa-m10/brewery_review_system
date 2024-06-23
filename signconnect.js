const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const uri = 'mongodb+srv://manasamurali1014:SH2kZPCnnv3TsM4J@brs.lvk3lpx.mongodb.net/?retryWrites=true&w=majority&appName=BRS';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String
});

userSchema.pre('save', async function (next) {
  if (this.isNew && this.password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
  }
  next();
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next(); 
  }
});

app.post('/signup', cors({ origin: '//C:/Users/VivekMurali/OneDrive/Documents/BRS/signup.html' }), async (req, res) => {
  console.log('Received signup request:', req.body);
  const { name, username, password } = req.body;

  try {
    const newUser = new User({ name, username, password });

    const savedUser = await newUser.save();

    res.status(201).json({ message: 'User signed up and saved', data: savedUser }); 
  } catch (error) {
    console.error('Error saving user:', error);
    let errorMessage = 'Error signing up.';

    if (error.code === 11000) { 
      errorMessage = 'Username already exists.';
    }

    res.status(400).json({ message: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
