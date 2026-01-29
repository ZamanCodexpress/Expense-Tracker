# Expense Tracker

A client-side expense tracking web application built using **HTML, CSS, and vanilla JavaScript**. The application allows users to record, manage, and analyze personal expenses with persistent storage and visual analytics.

---

## Description

This project is a **single-page frontend application** that enables users to track daily expenses by category and date. It provides real-time summaries and visual insights using charts, while storing data locally in the browser.

The goal of the project is to demonstrate practical frontend development skills, including:

* DOM manipulation
* State management
* Data visualization

All of this is achieved **without relying on frameworks**.

---

## Features

* Create, edit, and delete expense entries
* Categorize expenses with optional descriptions
* Filter expenses by category and date range
* Persistent storage using the browser **LocalStorage API**
* Automatic calculation of:

  * Total expenses
  * Weekly expenses
  * Monthly expenses
* Data visualization using **Chart.js**
* Responsive layout for desktop and mobile devices

---

## Technologies Used

* HTML5
* CSS3
* JavaScript (ES6+)
* Chart.js
* Web Storage API (LocalStorage)

---

## Setup and Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   ```

   **OR** download the project as a `.zip` file and extract it.

2. Open `index.html` in a modern web browser.

No additional dependencies or build steps are required.

---

## Implementation Details

* Application state is managed in memory and synchronized with LocalStorage
* Expenses are sorted by date so recent entries appear first
* Analytics are recalculated and re-rendered on every data change
* Charts are destroyed and recreated to ensure accurate visualization updates
* UI logic, data handling, and analytics calculations are logically separated

---

## Limitations

* Data is stored per browser and device only
* Currency is fixed and not configurable
* No backend, authentication, or multi-user support

---

## License

This project is open-source and intended for **educational and portfolio use**.
