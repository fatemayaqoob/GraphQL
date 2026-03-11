# GraphQL Profile Page

A personal profile dashboard that fetches and displays user data from a GraphQL API, featuring JWT authentication and interactive SVG graphs.

## Features

- **Authentication System**
  - Login with username/email and password
  - JWT-based authentication
  - Secure logout functionality

- **User Profile Dashboard**
  - Basic user information (username, email)
  - Total XP earned
  - Audit ratio calculation
  - Project statistics (completed/failed/success rate)

- **Interactive SVG Graphs**
  - XP Progress Over Time (Line Graph)
  - Project Success Rate (Pie Chart)

- **Recent Projects List**
  - Display of recent project attempts
  - Pass/Fail status visualization

## Technologies

- **HTML5** - Structure and semantic markup
- **CSS3** - Modern styling with flexbox and grid
- **Vanilla JavaScript** - No frameworks, pure JS
- **GraphQL** - API queries for data fetching
- **SVG** - Dynamic graph generation
- **JWT** - Secure authentication

## Setup

1. Clone this repository
2. Open `index.html` in a web browser
3. Login with your credentials
4. View your profile and statistics

## GraphQL Queries Used

The application uses the following GraphQL queries:

1. **User Information**: Fetches basic user data
2. **XP Transactions**: Gets all XP earning transactions with timestamps
3. **Audit Data**: Calculates audit ratio from up/down transactions
4. **Project Progress**: Retrieves project completion data with grades

## File Structure

```
graphql/
├── index.html       # Login page
├── profile.html     # Profile dashboard
├── style.css        # All styling
├── app.js           # Shared utilities
└── README.md        # This file
```

## Hosting

available at `https://fatemayaqoob.github.io/GraphQL`

## API Endpoints

- **Authentication**: `https://learn.reboot01.com/api/auth/signin`
- **GraphQL API**: `https://learn.reboot01.com/api/graphql-engine/v1/graphql`

## Features Implemented

✅ Login page with username/email support  
✅ JWT authentication and storage  
✅ Logout functionality  
✅ User basic information display  
✅ XP calculation and display  
✅ Audit ratio calculation  
✅ Project statistics  
✅ XP progress line graph (SVG)  
✅ Project success pie chart (SVG)  
✅ Recent projects list  
✅ Responsive design  
✅ Error handling  
✅ Loading states  

## License

This project is for educational purposes as part of the school curriculum.