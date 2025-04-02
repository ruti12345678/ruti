const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/lecturesDB')
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });





const userSchema = new mongoose.Schema({
  name: String,
  age: Number
});

// יצירת מודל (Model) מתוך הסקימה
const User = mongoose.model('User', userSchema);

// יצירת אובייקט חדש (Document) והוספתו לבסיס הנתונים
const newUser = new User({
  name: 'ruti',
  age: 34
});

newUser.save()
  .then(() => {
    console.log('User saved to database');
  })
  .catch((err) => {
    console.error('Error saving user:', err);
  });