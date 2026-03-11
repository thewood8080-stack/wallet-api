// server.js - נקודת הכניסה לאפליקציה
// קובץ זה מפעיל את השרת על הפורט המוגדר

const app = require('./app');

// הפורט נלקח ממשתני סביבה, ואם לא קיים - ברירת מחדל 5050
const PORT = process.env.PORT || 5050;

// מפעילים את השרת ומדפיסים הודעה כשהוא עולה
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
