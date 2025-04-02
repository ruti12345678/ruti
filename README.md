# Lecture Management API

## תיאור הפרויקט

API נוגש לניהול ניהול וניהול הרצאות הקשורות בבסיס הנתונים MongoDB. הפרויקט מתשק ב-Express.js וכולל API עם Swagger.

## דרישות מערכת

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/) (אם רוצים להריץ עם Docker Compose)

## התקנה והפעלה

### התקנת התלותיות

1. ודא ש-Node.js ו-MongoDB מותקנים.
2. שכפלת את הפרויקט והתקן את התלותיות עם:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   npm install
   ```

### הרצת הפרויקט

1. הפעלת MongoDB בסביביתיך העצוגה:
   ```bash
   mongod
   ```
2. הרצת השרת:
   ```bash
   node index.js
   ```
   השרת יעלה על `http://localhost:3000`.

### הרצה עם Docker Compose

להרצה בשימוש Docker Compose:

1. ודא ש-Docker מותקן.
2. בפקודה הבאה להריץ את כל השירות:
   ```bash
   docker-compose up -d
   ```
3. לעצירת השירות:
   ```bash
   docker-compose down
   ```

## נקודות API

- **יצירת הרצאה חדשה** (`POST /lectures`)
- **שליפת כל ההרצאות עם פאג'ינציה** (`GET /lectures?page=1`)
- **עדכון הרצאה לפי מזהה** (`PUT /lectures/:id`)
- **מחיקת הרצאה לפי מזהה** (`DELETE /lectures/:id`)
- **בדיקת בריאות השרת** (`GET /_/health_check`)

## תיעודת Swagger

ניתן לצפות בתיעוד המלא של ה-API בעזרת Swagger UI בכתובת:

```
http://localhost:3000/api-docs
```

