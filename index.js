const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('totally_real_school.db');

app.use(express.json());

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_name TEXT NOT NULL,
    course_id INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_name TEXT NOT NULL,
    department TEXT
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    section_id INTEGER,
    faculty_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id)
  );
`);

function toNull(value) {
  return value === '' || value === undefined ? null : value;
}

app.get('/real_api/courses', (req, res) => {
  const rows = db.prepare('SELECT * FROM courses ORDER BY id').all();
  res.json(rows);
});

app.post('/real_api/courses', (req, res) => {
  const { course_name } = req.body;
  db.prepare('INSERT INTO courses (course_name) VALUES (?)').run(course_name);
  res.json({ message: 'Course added' });
});

app.put('/real_api/courses/:id', (req, res) => {
  const { course_name } = req.body;
  db.prepare('UPDATE courses SET course_name = ? WHERE id = ?').run(course_name, req.params.id);
  res.json({ message: 'Course updated' });
});

app.delete('/real_api/courses/:id', (req, res) => {
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Course deleted' });
});

app.get('/real_api/sections', (req, res) => {
  const rows = db.prepare(`
    SELECT sections.id, sections.section_name, sections.course_id, courses.course_name
    FROM sections
    LEFT JOIN courses ON sections.course_id = courses.id
    ORDER BY sections.id
  `).all();
  res.json(rows);
});

app.post('/real_api/sections', (req, res) => {
  const { section_name, course_id } = req.body;
  db.prepare('INSERT INTO sections (section_name, course_id) VALUES (?, ?)')
    .run(section_name, toNull(course_id));
  res.json({ message: 'Section added' });
});

app.put('/real_api/sections/:id', (req, res) => {
  const { section_name, course_id } = req.body;
  db.prepare('UPDATE sections SET section_name = ?, course_id = ? WHERE id = ?')
    .run(section_name, toNull(course_id), req.params.id);
  res.json({ message: 'Section updated' });
});

app.delete('/real_api/sections/:id', (req, res) => {
  db.prepare('DELETE FROM sections WHERE id = ?').run(req.params.id);
  res.json({ message: 'Section deleted' });
});

app.get('/real_api/students', (req, res) => {
  const rows = db.prepare('SELECT * FROM students ORDER BY id').all();
  res.json(rows);
});

app.post('/real_api/students', (req, res) => {
  const { student_name, email } = req.body;
  db.prepare('INSERT INTO students (student_name, email) VALUES (?, ?)').run(student_name, email);
  res.json({ message: 'Student added' });
});

app.put('/real_api/students/:id', (req, res) => {
  const { student_name, email } = req.body;
  db.prepare('UPDATE students SET student_name = ?, email = ? WHERE id = ?')
    .run(student_name, email, req.params.id);
  res.json({ message: 'Student updated' });
});

app.delete('/real_api/students/:id', (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ message: 'Student deleted' });
});

app.get('/real_api/faculty', (req, res) => {
  const rows = db.prepare('SELECT * FROM faculty ORDER BY id').all();
  res.json(rows);
});

app.post('/real_api/faculty', (req, res) => {
  const { faculty_name, department } = req.body;
  db.prepare('INSERT INTO faculty (faculty_name, department) VALUES (?, ?)').run(faculty_name, department);
  res.json({ message: 'Faculty added' });
});

app.put('/real_api/faculty/:id', (req, res) => {
  const { faculty_name, department } = req.body;
  db.prepare('UPDATE faculty SET faculty_name = ?, department = ? WHERE id = ?')
    .run(faculty_name, department, req.params.id);
  res.json({ message: 'Faculty updated' });
});

app.delete('/real_api/faculty/:id', (req, res) => {
  db.prepare('DELETE FROM faculty WHERE id = ?').run(req.params.id);
  res.json({ message: 'Faculty deleted' });
});

app.get('/real_api/enrollments', (req, res) => {
  const rows = db.prepare(`
    SELECT enrollments.id,
           enrollments.student_id,
           enrollments.section_id,
           enrollments.faculty_id,
           students.student_name,
           sections.section_name,
           faculty.faculty_name
    FROM enrollments
    LEFT JOIN students ON enrollments.student_id = students.id
    LEFT JOIN sections ON enrollments.section_id = sections.id
    LEFT JOIN faculty ON enrollments.faculty_id = faculty.id
    ORDER BY enrollments.id
  `).all();
  res.json(rows);
});

app.post('/real_api/enrollments', (req, res) => {
  const { student_id, section_id, faculty_id } = req.body;
  db.prepare('INSERT INTO enrollments (student_id, section_id, faculty_id) VALUES (?, ?, ?)')
    .run(toNull(student_id), toNull(section_id), toNull(faculty_id));
  res.json({ message: 'Enrollment added' });
});

app.put('/real_api/enrollments/:id', (req, res) => {
  const { student_id, section_id, faculty_id } = req.body;
  db.prepare('UPDATE enrollments SET student_id = ?, section_id = ?, faculty_id = ? WHERE id = ?')
    .run(toNull(student_id), toNull(section_id), toNull(faculty_id), req.params.id);
  res.json({ message: 'Enrollment updated' });
});

app.delete('/real_api/enrollments/:id', (req, res) => {
  db.prepare('DELETE FROM enrollments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Enrollment deleted' });
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>School Registration App</title>
</head>
<body>
  <h1>The School Registration App</h1>
  <p>Brought to you by Totally real school</p>

  <h2>Courses</h2>
  <input id="course_name" placeholder="Course name">
  <button id="add_course_btn">Add Course</button>
  <ul id="course_list"></ul>

  <h2>Sections</h2>
  <input id="section_name" placeholder="Section name">
  <input id="section_course_id" placeholder="Course ID">
  <button id="add_section_btn">Add Section</button>
  <ul id="section_list"></ul>

  <h2>Students</h2>
  <input id="student_name" placeholder="Student name">
  <input id="student_email" placeholder="Email">
  <button id="add_student_btn">Add Student</button>
  <ul id="student_list"></ul>

  <h2>Faculty</h2>
  <input id="faculty_name" placeholder="Faculty name">
  <input id="faculty_department" placeholder="Department">
  <button id="add_faculty_btn">Add Faculty</button>
  <ul id="faculty_list"></ul>

  <h2>Enrollments</h2>
  <input id="enrollment_student_id" placeholder="Student ID">
  <input id="enrollment_section_id" placeholder="Section ID">
  <input id="enrollment_faculty_id" placeholder="Faculty ID">
  <button id="add_enrollment_btn">Add Enrollment</button>
  <ul id="enrollment_list"></ul>

  <script>
    async function getData(url) {
      const response = await fetch(url);
      return response.json();
    }

    async function sendData(url, method, data) {
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      loadAll();
    }

    function clearInputs() {
      document.getElementById('course_name').value = '';
      document.getElementById('section_name').value = '';
      document.getElementById('section_course_id').value = '';
      document.getElementById('student_name').value = '';
      document.getElementById('student_email').value = '';
      document.getElementById('faculty_name').value = '';
      document.getElementById('faculty_department').value = '';
      document.getElementById('enrollment_student_id').value = '';
      document.getElementById('enrollment_section_id').value = '';
      document.getElementById('enrollment_faculty_id').value = '';
    }

    async function loadCourses() {
      const data = await getData('/real_api/courses');
      const list = document.getElementById('course_list');
      list.innerHTML = '';

      data.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = 'ID: ' + item.id + ' - ' + item.course_name + ' ';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = async function() {
          const newName = prompt('Enter new course name:', item.course_name);
          if (newName !== null) {
            await sendData('/real_api/courses/' + item.id, 'PUT', { course_name: newName });
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async function() {
          await sendData('/real_api/courses/' + item.id, 'DELETE', {});
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    }

    async function loadSections() {
      const data = await getData('/real_api/sections');
      const list = document.getElementById('section_list');
      list.innerHTML = '';

      data.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = 'ID: ' + item.id + ' - ' + item.section_name + ' - Course ID: ' + (item.course_id || '') + ' ';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = async function() {
          const newName = prompt('Enter new section name:', item.section_name);
          const newCourseId = prompt('Enter new course ID:', item.course_id || '');
          if (newName !== null) {
            await sendData('/real_api/sections/' + item.id, 'PUT', {
              section_name: newName,
              course_id: newCourseId
            });
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async function() {
          await sendData('/real_api/sections/' + item.id, 'DELETE', {});
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    }

    async function loadStudents() {
      const data = await getData('/real_api/students');
      const list = document.getElementById('student_list');
      list.innerHTML = '';

      data.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = 'ID: ' + item.id + ' - ' + item.student_name + ' - ' + (item.email || '') + ' ';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = async function() {
          const newName = prompt('Enter new student name:', item.student_name);
          const newEmail = prompt('Enter new email:', item.email || '');
          if (newName !== null) {
            await sendData('/real_api/students/' + item.id, 'PUT', {
              student_name: newName,
              email: newEmail
            });
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async function() {
          await sendData('/real_api/students/' + item.id, 'DELETE', {});
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    }

    async function loadFaculty() {
      const data = await getData('/real_api/faculty');
      const list = document.getElementById('faculty_list');
      list.innerHTML = '';

      data.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = 'ID: ' + item.id + ' - ' + item.faculty_name + ' - ' + (item.department || '') + ' ';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = async function() {
          const newName = prompt('Enter new faculty name:', item.faculty_name);
          const newDepartment = prompt('Enter new department:', item.department || '');
          if (newName !== null) {
            await sendData('/real_api/faculty/' + item.id, 'PUT', {
              faculty_name: newName,
              department: newDepartment
            });
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async function() {
          await sendData('/real_api/faculty/' + item.id, 'DELETE', {});
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    }

    async function loadEnrollments() {
      const data = await getData('/real_api/enrollments');
      const list = document.getElementById('enrollment_list');
      list.innerHTML = '';

      data.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent =
          'ID: ' + item.id +
          ' - Student: ' + (item.student_name || 'None') +
          ' - Section: ' + (item.section_name || 'None') +
          ' - Faculty: ' + (item.faculty_name || 'None') + ' ';
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = async function() {
          const newStudentId = prompt('Enter new student ID:', item.student_id || '');
          const newSectionId = prompt('Enter new section ID:', item.section_id || '');
          const newFacultyId = prompt('Enter new faculty ID:', item.faculty_id || '');
          await sendData('/real_api/enrollments/' + item.id, 'PUT', {
            student_id: newStudentId,
            section_id: newSectionId,
            faculty_id: newFacultyId
          });
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async function() {
          await sendData('/real_api/enrollments/' + item.id, 'DELETE', {});
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    }

    document.getElementById('add_course_btn').onclick = async function() {
      const course_name = document.getElementById('course_name').value;
      await sendData('/real_api/courses', 'POST', { course_name: course_name });
      clearInputs();
    };

    document.getElementById('add_section_btn').onclick = async function() {
      const section_name = document.getElementById('section_name').value;
      const course_id = document.getElementById('section_course_id').value;
      await sendData('/real_api/sections', 'POST', { section_name: section_name, course_id: course_id });
      clearInputs();
    };

    document.getElementById('add_student_btn').onclick = async function() {
      const student_name = document.getElementById('student_name').value;
      const email = document.getElementById('student_email').value;
      await sendData('/real_api/students', 'POST', { student_name: student_name, email: email });
      clearInputs();
    };

    document.getElementById('add_faculty_btn').onclick = async function() {
      const faculty_name = document.getElementById('faculty_name').value;
      const department = document.getElementById('faculty_department').value;
      await sendData('/real_api/faculty', 'POST', { faculty_name: faculty_name, department: department });
      clearInputs();
    };

    document.getElementById('add_enrollment_btn').onclick = async function() {
      const student_id = document.getElementById('enrollment_student_id').value;
      const section_id = document.getElementById('enrollment_section_id').value;
      const faculty_id = document.getElementById('enrollment_faculty_id').value;
      await sendData('/real_api/enrollments', 'POST', {
        student_id: student_id,
        section_id: section_id,
        faculty_id: faculty_id
      });
      clearInputs();
    };

    function loadAll() {
      loadCourses();
      loadSections();
      loadStudents();
      loadFaculty();
      loadEnrollments();
    }

    loadAll();
  </script>
</body>
</html>
  `);
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
