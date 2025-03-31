const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swager.json');

// הגדרת Swagger UI

// יצירת אובייקט Express
const app = express();
const port = 3000;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// התחברות ל-MongoDB עם אפשרויות חיבור
mongoose.connect('mongodb://localhost:27017/lecturesDB')
  .then(() => console.log('✅ חובר בהצלחה ל-MongoDB'))
  .catch((err) => console.error('❌ שגיאה בחיבור ל-MongoDB:', err));

// הגדרת bodyParser (חייב להיות לפני הנתיבים)
app.use(bodyParser.json());

// יצירת סכימה ומודל להרצאות
const lectureSchema = new mongoose.Schema({
  title: String,
  speaker: String,
  duration: Number, // משך ההרצאה בדקות
});

// מודל הרצאות
const Lecture = mongoose.model('Lecture', lectureSchema);

const lectureWithoutIndexSchema = new mongoose.Schema({
  title: String,
  speaker: String,
  duration: Number
}, { autoIndex: false }); // מונע יצירת אינדקס אוטומטי

const LectureWithoutIndex = mongoose.model('LectureWithoutIndex', lectureWithoutIndexSchema);


// יצירת נתיב להוספת הרצאה חדשה (Create)
app.post('/lectures', async (req, res) => {
  const { title, speaker, duration } = req.body;

  try {
    // בדיקה אם כבר קיימת הרצאה עם אותו מרצה
    const existingLecture = await Lecture.findOne({ speaker });

    if (existingLecture) {
      return res.status(400).json({ message: "❌ ההרצאה כבר קיימת עבור מרצה זה" });
    }

    // יצירת הרצאה חדשה ושמירה ב-DB
    const newLecture = new Lecture({ title, speaker, duration });
    const savedLecture = await newLecture.save();

    res.status(201).json({ message: "✅ הרצאה נוספה בהצלחה", lecture: savedLecture });
  } catch (err) {
    res.status(500).json({ error: '❌ שגיאה בשרת', details: err.message });
  }
});

// יצירת פונקציה ליצירת 1000 משתמשים (Lectures)
const generateLectures = (count) => {
  const lectures = [];
  for (let i = 0; i < count; i++) {
    lectures.push({
      title: `Lecture ${i + 1}`,
      speaker: `Speaker${i + 1}@example.com`,
      duration: Math.floor(Math.random() * 60) + 30, // זמן אקראי בין 30 ל-90 דקות
    });
  }
  return lectures;
};

// הכנסת 1000 הרצאות לבסיס הנתונים (מבוצע רק פעם אחת)
const insertLectures = async () => {
  try {
    const lectures = generateLectures(1000);
    await Lecture.insertMany(lectures);
    console.log('✅ נוספו 1000 הרצאות בהצלחה');
    await LectureWithoutIndex.insertMany(lectures);
    console.log('✅ אלף הרצאות נוספו לטבלה בלי אינדקס');
  } catch (err) {
    console.error('❌ שגיאה בהוספת ההרצאות:', err);
  }

};


// קריאה לפונקציה להוספת 1000 הרצאות
insertLectures();

const testPerformance = async () => {
  console.time("חיפוש בטבלה עם אינדקס");
  await Lecture.findOne({ speaker: "Speaker 50000" });
  console.timeEnd("חיפוש בטבלה עם אינדקס");

  console.time("חיפוש בטבלה בלי אינדקס");
  await LectureWithoutIndex.findOne({ speaker: "Speaker 50000" });
  console.timeEnd("חיפוש בטבלה בלי אינדקס");
};

testPerformance();


// שליפת כל ההרצאות (Read)
// שליפת כל ההרצאות עם תמיכה בפאג'ינציה (Pagination)
app.get('/lectures', async (req, res) => {
  try {
    // קבלת מספר העמוד מהבקשה (ברירת מחדל: עמוד 1)
    const page = parseInt(req.query.page) || 1;

    // הגדרת מספר ההרצאות בעמוד
    const limit = 50;

    // חישוב כמות הנתונים שיש לדלג עליה (skip)
    const skip = (page - 1) * limit;

    // שליפת ההרצאות עם הגבלת מספר התוצאות ודילוג על תוצאות קודמות
    const lectures = await Lecture.find().skip(skip).limit(limit);

    // ספירת כמות ההרצאות הכוללת
    const totalLectures = await Lecture.countDocuments();

    // חישוב כמות העמודים
    const totalPages = Math.ceil(totalLectures / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalLectures,
      perPage: limit,
      lectures
    });
  } catch (err) {
    res.status(500).json({ error: '❌ שגיאה בקריאת ההרצאות', details: err.message });
  }
});


// עדכון הרצאה לפי מזהה (Update)
app.put('/lectures/:id', async (req, res) => {
  const { id } = req.params;
  const { title, speaker, duration } = req.body;

  try {
    const updatedLecture = await Lecture.findByIdAndUpdate(id, { title, speaker, duration }, { new: true });

    if (!updatedLecture) {
      return res.status(404).json({ error: '❌ לא נמצאה הרצאה עם מזהה זה' });
    }

    res.status(200).json({ message: "✅ ההרצאה עודכנה בהצלחה", lecture: updatedLecture });
  } catch (err) {
    res.status(500).json({ error: '❌ שגיאה בעדכון ההרצאה', details: err.message });
  }
});

// מחיקת הרצאה לפי מזהה (Delete)
app.delete('/lectures/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLecture = await Lecture.findByIdAndDelete(id);

    if (!deletedLecture) {
      return res.status(404).json({ error: '❌ לא נמצאה הרצאה עם מזהה זה' });
    }

    res.status(200).json({ message: "✅ ההרצאה נמחקה בהצלחה" });
  } catch (err) {
    res.status(500).json({ error: '❌ שגיאה במחיקת ההרצאה', details: err.message });
  }
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`🚀 השרת רץ על http://localhost:${port}`);
});