// ====== CONFIG & STATE ======
const DEFAULT_SLOTS = ["07:00", "07:40", "08:20", "09:00", "09:40", "10:20", "11:00", "11:40", "12:20", "13:00", "13:40", "14:20", "15:00", "15:40", "16:20", "17:00", "17:40", "18:20", "19:00", "19:40"];
const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];

let db = {
    users: [],
    lessons: [],
    settings: { workingHours: {} }, // { "YYYY-MM-DD": ["07:00", "07:40"] } meaning open slots
    agendaNotes: {} // { "YYYY-MM-DD": { "07:00": "Drive safely" } }
};

let currentUser = null;
let currentWeekOffsetStudent = 0;
let currentWeekOffsetTeacher = 0;
let currentAgendaDate = new Date();

let dbRef = null;

// ====== DB MANAGEMENT ======
function initDB() {
    // Wait for Firebase to be ready (load order)
    if (!window.firebaseDB) {
        window.addEventListener('firebaseReady', setupFirebaseData);
    } else {
        setupFirebaseData();
    }
}

function setupFirebaseData() {
    dbRef = window.firebaseAPI.ref(window.firebaseDB, '/');
    
    // Listen for real-time changes
    window.firebaseAPI.onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            db = {
                users: data.users || [],
                lessons: data.lessons || [],
                settings: data.settings || { workingHours: {} },
                agendaNotes: data.agendaNotes || {}
            };
        } else {
            // First time setup: DB is empty, seed with default teacher
            db.users.push({ id: generateId(), name: 'מורן מזרחי', username: 'moran', password: '123', role: 'teacher' });
            saveDB();
        }
        
        // Check if user session exists and UI needs refresh due to new data
        if (currentUser) {
            // Update current user data in case of admin edits (optional but good practice)
            const updatedUser = db.users.find(u => u.id === currentUser.id);
            if (updatedUser) currentUser = updatedUser;
            
            // Re-render active view
            const activeView = document.querySelector('.view:not(.hidden)');
            if (activeView && activeView.id === 'view-teacher') {
                const activeTab = document.querySelector('.teacher-tab:not(.hidden)');
                if (activeTab.id === 'tab-calendar') renderTeacherCalendar();
                else if (activeTab.id === 'tab-agenda') renderAgendaTab();
                else if (activeTab.id === 'tab-students') renderStudentsTab();
                else if (activeTab.id === 'tab-reports') renderReportsTab();
            } else if (activeView && activeView.id === 'view-student') {
                renderStudentLessons();
                renderStudentCalendar();
            }
        }
    });
}

function saveDB() {
    if (dbRef) {
        window.firebaseAPI.set(dbRef, db);
    }
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ====== UTILS ======
function getStartOfWeek(date, offsetWeeks = 0) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (offsetWeeks * 7);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

function formatDisplayDate(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getWeekDays(startDate) {
    const days = [];
    for (let i = 0; i < 6; i++) { // Sun to Fri
        const nextDay = new Date(startDate);
        nextDay.setDate(startDate.getDate() + i);
        days.push(formatDate(nextDay));
    }
    return days;
}

function isPast(dateStr, timeStr) {
    const now = new Date();
    const target = new Date(`${dateStr}T${timeStr}`);
    return target < now;
}

function timeDiffHours(dateStr, timeStr) {
    const now = new Date();
    const target = new Date(`${dateStr}T${timeStr}`);
    const diffMs = target - now;
    return diffMs / (1000 * 60 * 60);
}

function getNextSlot(timeStr) {
    const idx = DEFAULT_SLOTS.indexOf(timeStr);
    if (idx !== -1 && idx < DEFAULT_SLOTS.length - 1) {
        return DEFAULT_SLOTS[idx + 1];
    }
    return null;
}

// ====== MODALS ======
function showAlert(msg) {
    document.getElementById('alert-text').innerText = msg;
    document.getElementById('alert-modal').classList.remove('hidden');
}
document.getElementById('alert-close').addEventListener('click', () => {
    document.getElementById('alert-modal').classList.add('hidden');
});

// ====== ROUTING & AUTH ======
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    
    // Manage Nav active state
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    if (viewId === 'view-home') document.getElementById('nav-home').classList.add('active');
    if (viewId === 'view-login') document.getElementById('nav-login').classList.add('active');
    if (viewId === 'view-student' || viewId === 'view-teacher') document.getElementById('nav-dashboard').classList.add('active');
}

function updateNav() {
    if (currentUser) {
        document.getElementById('nav-login').classList.add('hidden');
        document.getElementById('nav-dashboard').classList.remove('hidden');
        document.getElementById('nav-logout').classList.remove('hidden');
    } else {
        document.getElementById('nav-login').classList.remove('hidden');
        document.getElementById('nav-dashboard').classList.add('hidden');
        document.getElementById('nav-logout').classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById('login-username').value;
    const passVal = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;
    
    const user = db.users.find(u => u.username === userVal && u.password === passVal);
    
    if (user) {
        document.getElementById('login-error').classList.add('hidden');
        currentUser = user;
        if (remember) {
            localStorage.setItem('driving_app_user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('driving_app_user', JSON.stringify(user));
        }
        document.getElementById('login-form').reset();
        loadDashboard();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

function performLogout() {
    currentUser = null;
    localStorage.removeItem('driving_app_user');
    sessionStorage.removeItem('driving_app_user');
    updateNav();
    switchView('view-home');
}

function checkAuth() {
    const saved = localStorage.getItem('driving_app_user') || sessionStorage.getItem('driving_app_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateNav();
    } else {
        updateNav();
    }
}

// ====== DASHBOARD ENTRY ======
function loadDashboard() {
    updateNav();
    if (!currentUser) return switchView('view-login');
    
    if (currentUser.role === 'teacher') {
        switchView('view-teacher');
        loadTeacherDashboard();
    } else {
        switchView('view-student');
        loadStudentDashboard();
    }
}

// ====== STUDENT DASHBOARD ======
function loadStudentDashboard() {
    document.getElementById('student-name').innerText = currentUser.name;
    renderStudentLessons();
    renderStudentCalendar();
}

document.getElementById('prev-week').addEventListener('click', () => { currentWeekOffsetStudent++; renderStudentCalendar(); });
document.getElementById('next-week').addEventListener('click', () => { currentWeekOffsetStudent--; renderStudentCalendar(); });
document.getElementById('lesson-type').addEventListener('change', renderStudentCalendar);

function renderStudentLessons() {
    const container = document.getElementById('student-lessons');
    const myLessons = db.lessons.filter(l => l.studentId === currentUser.id);
    
    // Sort Earliest to Latest
    myLessons.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    container.innerHTML = '';
    
    if (myLessons.length === 0) {
        container.innerHTML = '<p class="text-muted">אין לך שיעורים קרובים.</p>';
        return;
    }
    
    myLessons.forEach(l => {
        const isPastLesson = isPast(l.date, l.time);
        const hoursLeft = timeDiffHours(l.date, l.time);
        
        const div = document.createElement('div');
        div.className = `lesson-item ${isPastLesson ? 'past' : ''}`;
        
        let cancelBtn = '';
        if (!isPastLesson) {
            if (hoursLeft > 24) {
                cancelBtn = `<button class="btn btn-danger btn-sm mt-2" onclick="cancelLesson('${l.id}')">בטל שיעור</button>`;
            } else {
                cancelBtn = `<p class="text-danger mt-2" style="font-size:0.85rem;"><i class="fa-solid fa-triangle-exclamation"></i> לא ניתן לבטל (פחות מ-24 שעות)</p>`;
            }
        }
        
        div.innerHTML = `
            <h4>${formatDisplayDate(l.date)} | ${l.time}</h4>
            <div class="lesson-meta">
                <span><i class="fa-solid fa-clock"></i> ${l.duration} דקות</span>
                ${isPastLesson ? '<span>הושלם</span>' : '<span>עתידי</span>'}
            </div>
            ${cancelBtn}
        `;
        container.appendChild(div);
    });
}

function renderStudentCalendar() {
    const container = document.getElementById('student-calendar');
    const label = document.getElementById('current-week-label');
    const type = document.getElementById('lesson-type').value; // 'single' or 'double'
    
    const startOfWeek = getStartOfWeek(new Date(), currentWeekOffsetStudent);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5);
    label.innerText = `${formatDisplayDate(formatDate(startOfWeek))} - ${formatDisplayDate(formatDate(endOfWeek))}`;
    
    const weekDays = getWeekDays(startOfWeek);
    container.innerHTML = '';
    
    weekDays.forEach((dateStr, idx) => {
        const col = document.createElement('div');
        col.className = 'cal-col';
        col.innerHTML = `<div class="cal-header">${DAY_NAMES[idx]}<br>${formatDisplayDate(dateStr)}</div>`;
        
        DEFAULT_SLOTS.forEach(timeStr => {
            const slot = document.createElement('div');
            const past = isPast(dateStr, timeStr);
            
            // Check if teacher is open here
            const dayHours = db.settings.workingHours[dateStr] || [];
            const isOpen = dayHours.includes(timeStr);
            
            // Check if booked
            const lessonObj = getLessonAt(dateStr, timeStr);
            
            slot.className = 'cal-slot disabled';
            slot.innerText = timeStr;
            
            if (past || !isOpen) {
                slot.title = "לא פנוי";
            } else if (lessonObj) {
                if (lessonObj.studentId === currentUser.id) {
                    slot.className = 'cal-slot my-lesson';
                    slot.title = "שיעור שלך";
                } else {
                    slot.className = 'cal-slot taken';
                    slot.title = "תפוס";
                }
            } else {
                // Check if double lesson is possible (next slot must be open and not taken)
                let canBook = true;
                if (type === 'double') {
                    const nextTime = getNextSlot(timeStr);
                    if (!nextTime || !dayHours.includes(nextTime) || getLessonAt(dateStr, nextTime)) {
                        canBook = false;
                    }
                }
                
                if (canBook) {
                    slot.className = 'cal-slot free';
                    slot.title = "פנוי - לחץ לקביעת שיעור";
                    slot.onclick = () => bookLesson(dateStr, timeStr, type);
                }
            }
            
            col.appendChild(slot);
        });
        
        container.appendChild(col);
    });
}

function getLessonAt(dateStr, timeStr) {
    return db.lessons.find(l => {
        if (l.date !== dateStr) return false;
        if (l.time === timeStr) return true;
        if (l.duration === 80) {
            const nextSlot = getNextSlot(l.time);
            if (nextSlot === timeStr) return true;
        }
        return false;
    });
}

function bookLesson(dateStr, timeStr, type) {
    const duration = type === 'double' ? 80 : 40;
    
    // Double check it's not taken right before saving
    if (getLessonAt(dateStr, timeStr)) return showAlert("הזמן נתפס, אנא בחר מועד אחר.");
    if (type === 'double') {
        const next = getNextSlot(timeStr);
        if (getLessonAt(dateStr, next)) return showAlert("הזמן הבא נתפס, לא ניתן לקבוע שיעור כפול.");
    }
    
    db.lessons.push({
        id: generateId(),
        studentId: currentUser.id,
        date: dateStr,
        time: timeStr,
        duration: duration,
        paid: false
    });
    
    saveDB();
    showAlert(`שיעור ${duration} דקות נקבע בהצלחה!`);
    // Mock teacher notification (in real app, send push/email)
    console.log(`Teacher notification: תלמיד בשם ${currentUser.name} קבע שיעור בתאריך ${formatDisplayDate(dateStr)} בשעה ${timeStr}`);
    
    renderStudentLessons();
    renderStudentCalendar();
}

function cancelLesson(lessonId) {
    const lesson = db.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const hoursLeft = timeDiffHours(lesson.date, lesson.time);
    if (hoursLeft < 24) return showAlert("לא ניתן לבטל שיעור פחות מ-24 שעות לפני תחילתו.");
    
    db.lessons = db.lessons.filter(l => l.id !== lessonId);
    saveDB();
    showAlert("השיעור בוטל בהצלחה.");
    renderStudentLessons();
    renderStudentCalendar();
}

document.getElementById('btn-share-location').addEventListener('click', () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            document.getElementById('location-details').innerHTML = `
                <p>המיקום צורף בהצלחה!</p>
                <a href="${link}" target="_blank" class="btn btn-secondary mt-2">פתח במפה</a>
            `;
            document.getElementById('location-modal').classList.remove('hidden');
        }, err => {
            showAlert("שגיאה בקבלת מיקום, אנא וודא ששירותי המיקום דלוקים.");
        });
    } else {
        showAlert("הדפדפן אינו תומך בשיתוף מיקום.");
    }
});

document.getElementById('location-close').addEventListener('click', () => {
    document.getElementById('location-modal').classList.add('hidden');
});

// ====== TEACHER DASHBOARD ======
document.querySelectorAll('.teacher-nav .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.teacher-nav .btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        document.querySelectorAll('.teacher-tab').forEach(t => t.classList.add('hidden'));
        
        const tabId = e.target.id.replace('btn-', '');
        document.getElementById(tabId).classList.remove('hidden');
        
        if (tabId === 'tab-students') renderStudentsTab();
        if (tabId === 'tab-reports') renderReportsTab();
        if (tabId === 'tab-calendar') renderTeacherCalendar();
        if (tabId === 'tab-agenda') renderAgendaTab();
    });
});

document.getElementById('t-prev-week').addEventListener('click', () => { currentWeekOffsetTeacher++; renderTeacherCalendar(); });
document.getElementById('t-next-week').addEventListener('click', () => { currentWeekOffsetTeacher--; renderTeacherCalendar(); });
document.getElementById('agenda-prev-day').addEventListener('click', () => { currentAgendaDate.setDate(currentAgendaDate.getDate() + 1); renderAgendaTab(); });
document.getElementById('agenda-next-day').addEventListener('click', () => { currentAgendaDate.setDate(currentAgendaDate.getDate() - 1); renderAgendaTab(); });

function loadTeacherDashboard() {
    renderTeacherCalendar();
    
    // Populate select lists
    populateStudentSelects();
    updateActiveStudentsCount();
}

function updateActiveStudentsCount() {
    const students = db.users.filter(u => u.role === 'student');
    document.getElementById('active-students-count').innerText = students.length;
}

function populateStudentSelects() {
    const students = db.users.filter(u => u.role === 'student');
    
    // Force book select
    let opts = '<option value="" disabled selected>בחר...</option>';
    students.forEach(s => opts += `<option value="${s.id}">${s.name}</option>`);
    document.getElementById('force-book-student').innerHTML = opts;
    
    // Reports select
    let rOpts = '<option value="all">הכל</option>';
    students.forEach(s => rOpts += `<option value="${s.id}">${s.name}</option>`);
    document.getElementById('report-student-filter').innerHTML = rOpts;
}

function renderTeacherCalendar() {
    const container = document.getElementById('teacher-calendar');
    const label = document.getElementById('t-current-week-label');
    
    const startOfWeek = getStartOfWeek(new Date(), currentWeekOffsetTeacher);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5);
    label.innerText = `${formatDisplayDate(formatDate(startOfWeek))} - ${formatDisplayDate(formatDate(endOfWeek))}`;
    
    const weekDays = getWeekDays(startOfWeek);
    container.innerHTML = '';
    
    weekDays.forEach((dateStr, idx) => {
        const col = document.createElement('div');
        col.className = 'cal-col';
        col.innerHTML = `<div class="cal-header">${DAY_NAMES[idx]}<br>${formatDisplayDate(dateStr)}</div>`;
        
        DEFAULT_SLOTS.forEach(timeStr => {
            const slot = document.createElement('div');
            const past = isPast(dateStr, timeStr);
            const dayHours = db.settings.workingHours[dateStr] || [];
            const isOpen = dayHours.includes(timeStr);
            const lesson = getLessonAt(dateStr, timeStr);
            
            slot.innerText = timeStr;
            
            if (past) {
                // If past, disable it, don't let them click. (requirement: remove past days/hours)
                // Actually they shouldn't even interact with past slots.
                slot.className = 'cal-slot disabled';
            } else {
                if (lesson) {
                    const student = db.users.find(u => u.id === lesson.studentId);
                    slot.className = 'cal-slot taken';
                    slot.title = student ? student.name : 'תלמיד';
                    // Teacher shouldn't toggle a booked slot easily without cancelling
                    slot.onclick = () => showAlert(`שיעור קבוע לתלמיד: ${slot.title}`);
                } else {
                    slot.className = `cal-slot ${isOpen ? 'active-slot' : ''}`;
                    slot.onclick = () => toggleTeacherHour(dateStr, timeStr);
                }
            }
            col.appendChild(slot);
        });
        container.appendChild(col);
    });
}

function toggleTeacherHour(dateStr, timeStr) {
    if (!db.settings.workingHours[dateStr]) {
        db.settings.workingHours[dateStr] = [];
    }
    const idx = db.settings.workingHours[dateStr].indexOf(timeStr);
    if (idx === -1) {
        db.settings.workingHours[dateStr].push(timeStr);
    } else {
        db.settings.workingHours[dateStr].splice(idx, 1);
    }
    saveDB();
    renderTeacherCalendar();
}

// Force book
document.getElementById('form-force-book').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = document.getElementById('force-book-student').value;
    const dateStr = document.getElementById('force-book-date').value;
    const timeStr = document.getElementById('force-book-time').value;
    const type = document.getElementById('force-book-type').value;
    const duration = type === 'double' ? 80 : 40;
    
    if (isPast(dateStr, timeStr)) return showAlert("לא ניתן לקבוע שיעור בזמן עבר.");
    
    // Normalize timeStr to handle possible HTML time input format "HH:MM:SS" etc
    const simpleTime = timeStr.substr(0, 5); 
    if(!DEFAULT_SLOTS.includes(simpleTime)) return showAlert(`שעה לא תקינה. עליך לבחור אחת מ: ${DEFAULT_SLOTS.join(', ')}`);
    
    if (getLessonAt(dateStr, simpleTime)) return showAlert("הזמן נתפס.");
    if (type === 'double' && getLessonAt(dateStr, getNextSlot(simpleTime))) return showAlert("הזמן הבא נתפס, לא ניתן לקבוע שיעור כפול.");
    
    db.lessons.push({
        id: generateId(),
        studentId: studentId,
        date: dateStr,
        time: simpleTime,
        duration: duration,
        paid: false
    });
    
    saveDB();
    showAlert("השיעור נקבע בהצלחה.");
    document.getElementById('form-force-book').reset();
    renderTeacherCalendar();
});

// Agenda Tab
function renderAgendaTab() {
    const list = document.getElementById('agenda-list');
    const label = document.getElementById('agenda-date-label');
    const dateStr = formatDate(currentAgendaDate);
    const dayName = DAY_NAMES[currentAgendaDate.getDay()] || '';
    
    label.innerText = `${dayName} | ${formatDisplayDate(dateStr)}`;
    list.innerHTML = '';
    
    // Create rows for each default slot
    DEFAULT_SLOTS.forEach(timeStr => {
        const row = document.createElement('div');
        row.className = 'agenda-row';
        
        // Find lesson
        const lessonObj = db.lessons.find(l => l.date === dateStr && (l.time === timeStr || (l.duration === 80 && getNextSlot(l.time) === timeStr)));
        let lessonBadge = '';
        if (lessonObj) {
            const student = db.users.find(u => u.id === lessonObj.studentId);
            lessonBadge = `<div class="lesson-card">שיעור: ${student?.name} (${lessonObj.duration} דק')</div>`;
        }
        
        // Find note
        const dayNotes = db.agendaNotes[dateStr] || {};
        const note = dayNotes[timeStr] || '';
        
        row.innerHTML = `
            <div class="agenda-time">${timeStr}</div>
            <div class="agenda-content">
                ${lessonBadge}
                <textarea class="agenda-textarea ${note ? 'has-text' : ''}" placeholder="הערות אישיות לזמן זה..." onblur="saveAgendaNote('${dateStr}', '${timeStr}', this.value)" rows="1">${note}</textarea>
            </div>
        `;
        list.appendChild(row);
    });
}

window.saveAgendaNote = function(dateStr, timeStr, text) {
    if (!db.agendaNotes[dateStr]) db.agendaNotes[dateStr] = {};
    db.agendaNotes[dateStr][timeStr] = text;
    saveDB();
};

// Students Tab
document.getElementById('add-student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-student-name').value;
    const user = document.getElementById('new-student-user').value;
    const pass = document.getElementById('new-student-pass').value;
    
    if (db.users.find(u => u.username === user)) return showAlert("שם משתמש תפוס.");
    
    db.users.push({ id: generateId(), name, username: user, password: pass, role: 'student' });
    saveDB();
    showAlert("תלמיד נשמר בהצלחה.");
    document.getElementById('add-student-form').reset();
    populateStudentSelects();
    updateActiveStudentsCount();
    renderStudentsTab();
});

function renderStudentsTab() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';
    const students = db.users.filter(u => u.role === 'student');
    
    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><a href="#" onclick="openReportForStudent('${s.id}')" style="color:var(--primary); font-weight:600;">${s.name}</a></td>
            <td>${s.username}</td>
            <td>
                <button class="btn btn-icon text-danger" onclick="deleteStudent('${s.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.openReportForStudent = function(studentId) {
    document.querySelectorAll('.teacher-nav .btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-tab-reports').classList.add('active');
    document.querySelectorAll('.teacher-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById('tab-reports').classList.remove('hidden');
    
    document.getElementById('report-student-filter').value = studentId;
    renderReportsTab();
};

window.deleteStudent = function(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק תלמיד זה?')) {
        db.users = db.users.filter(u => u.id !== id);
        // Maybe delete their lessons too, or keep them for history? Let's keep for history but it's optional.
        saveDB();
        populateStudentSelects();
        updateActiveStudentsCount();
        renderStudentsTab();
    }
};

// Reports Tab
document.getElementById('report-student-filter').addEventListener('change', renderReportsTab);

function renderReportsTab() {
    const tbody = document.getElementById('reports-table-body');
    const filterId = document.getElementById('report-student-filter').value;
    tbody.innerHTML = '';
    
    let lessons = [...db.lessons];
    if (filterId !== 'all') {
        lessons = lessons.filter(l => l.studentId === filterId);
    }
    
    // Sort Earliest to Latest
    lessons.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    // Summary Counters
    let cntCompleted = 0;
    let cntPlanned = 0;
    let cntPaid = 0;
    let cntUnpaid = 0;
    
    lessons.forEach(l => {
        const past = isPast(l.date, l.time);
        if (past) cntCompleted++;
        else cntPlanned++;
        
        if (l.paid) cntPaid++;
        else cntUnpaid++;
        
        const student = db.users.find(u => u.id === l.studentId);
        const stName = student ? student.name : 'לא ידוע';
        
        const tr = document.createElement('tr');
        
        let payBadge = l.paid ? 
            `<span class="status-badge status-paid" onclick="togglePayment('${l.id}')">שולם</span>` : 
            `<span class="status-badge status-unpaid" onclick="togglePayment('${l.id}')">לא שילם</span>`;
            
        let noteIcon = l.note ? '<i class="fa-solid fa-comment-dots text-primary" title="יש הערה"></i>' : '<i class="fa-regular fa-comment"></i> הוסף';
            
        tr.innerHTML = `
            <td>${formatDisplayDate(l.date)}</td>
            <td>${l.time}</td>
            <td>${stName}</td>
            <td>${l.duration === 40 ? 'בודד' : 'כפול'}</td>
            <td>${payBadge}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openNoteModal('${l.id}')" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
                    ${noteIcon} הערה
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Update summary UI if the elements exist
    if (document.getElementById('summary-completed')) {
        document.getElementById('summary-completed').innerText = cntCompleted;
        document.getElementById('summary-planned').innerText = cntPlanned;
        document.getElementById('summary-paid').innerText = cntPaid;
        document.getElementById('summary-unpaid').innerText = cntUnpaid;
    }
}

window.togglePayment = function(id) {
    const idx = db.lessons.findIndex(l => l.id === id);
    if (idx !== -1) {
        db.lessons[idx].paid = !db.lessons[idx].paid;
        saveDB();
        renderReportsTab();
    }
};

// Lesson Notes Modal
let currentNoteLessonId = null;
window.openNoteModal = function(id) {
    const lesson = db.lessons.find(l => l.id === id);
    if(lesson) {
        currentNoteLessonId = id;
        document.getElementById('lesson-note-text').value = lesson.note || '';
        document.getElementById('note-modal').classList.remove('hidden');
    }
};

document.getElementById('note-cancel').addEventListener('click', () => {
    document.getElementById('note-modal').classList.add('hidden');
});

document.getElementById('note-save').addEventListener('click', () => {
    if(currentNoteLessonId) {
        const idx = db.lessons.findIndex(l => l.id === currentNoteLessonId);
        if (idx !== -1) {
            db.lessons[idx].note = document.getElementById('lesson-note-text').value;
            saveDB();
            renderReportsTab();
        }
    }
    document.getElementById('note-modal').classList.add('hidden');
});


// ====== EVENT LISTENERS ======
document.getElementById('nav-home').addEventListener('click', () => switchView('view-home'));
document.getElementById('nav-login').addEventListener('click', () => switchView('view-login'));
document.getElementById('nav-dashboard').addEventListener('click', loadDashboard);
document.getElementById('nav-logout').addEventListener('click', performLogout);
document.getElementById('login-form').addEventListener('submit', handleLogin);

// Init
initDB();
checkAuth();
const currentActive = document.querySelector('.view:not(.hidden)');
if(!currentActive || !currentUser) {
    switchView('view-login');
}
