# Testing Documentation – Platemates

## Overview
Testing was conducted on the core functionalities of Platemates to ensure that the application behaves correctly, provides a smooth user experience, and satisfies all required must-have features defined in the project proposal.

The frontend interface was tested for usability, responsiveness, and clarity. Features such as authentication, meal session management, invite creation, and dashboard updates were tested through multiple user interaction scenarios.

---

# Authentication & Authorization Testing

## Login Validation
When attempting to log in without first registering an account, the system correctly prevents access and displays a popup message:

- “Invalid credentials”

This ensures that only registered users are able to access the application.

## University Email Restriction
Registration was tested using non-University of Auckland email addresses. The system correctly rejected these attempts and displayed the following popup message:

- “Only University of Auckland students can register”

This confirms that registration restrictions for verified University of Auckland students are functioning correctly.

## Successful Registration & Login
After registering with a valid University of Auckland student email address, users were successfully able to:

- Create an account
- Login using registered credentials
- Access the dashboard and protected features

## Logout Functionality
Logout functionality was tested to ensure that authenticated sessions terminate correctly and users are redirected appropriately.

---

# Frontend & User Interface Testing

The frontend interface was tested for responsiveness, layout consistency, and usability.

The UI provides:
- A clean and modern dashboard
- Easy navigation between meal sessions
- Responsive meal cards displaying session information
- Clear buttons for creating, joining, and leaving meal sessions

The Create Meal Session modal was tested to ensure:
- Inputs accept valid data correctly
- Character limits display properly
- Interactive map integration functions correctly
- Date and slot selection work as expected

The interface updates dynamically based on user actions and provides clear visual feedback.

---

# Meal Session / Food Invite Testing

## Dashboard Functionality
The dashboard successfully displays all active meal sessions with the following information:

- Session title
- Session description
- Meal location
- Session time
- Available participant slots
- Session owner

All active sessions load correctly and update dynamically.

## Create Meal Session Feature
Meal session creation was tested successfully.

Users are able to:
- Create meal invites
- Add descriptions
- Select meal locations using the interactive map
- Choose meal start time
- Set maximum participant slots

Newly created sessions appear immediately on the dashboard after creation.

## Join / Leave Meal Session Feature
Join and leave functionalities were tested thoroughly.

Users are able to:
- Join active meal sessions
- Leave joined meal sessions
- View participant count updates in real time

The UI correctly reflects:
- Updated participant numbers
- Joined session status
- Full session status when maximum capacity is reached

## Single Active Session Restriction
Testing confirmed that users can only participate in one active meal session at a time, as required by the project specifications.

## My Meals Section
The “My Meals” feature was tested successfully.

Users can:
- View sessions they have joined
- Separate their joined meals from all available meals

This improves user organization and accessibility.

---

# Real-Time Feature Testing

Real-time updates were tested to ensure frontend synchronization with backend changes.

The system successfully updates:
- Participant counts
- Join/leave status
- Session availability

Changes are reflected immediately on the UI after user interactions.

---

# Map Feature Testing

The interactive map feature was tested during meal session creation.

Testing verified:
- Map loads correctly
- Locations display properly
- Users can visually select meal locations
- Invalid or missing location handling functions correctly

---

# API & Backend Integration Testing

Frontend-backend integration was tested across all core functionalities.

The following API-related functionalities were verified:
- User registration
- User login
- Session creation
- Join/leave meal sessions
- Dashboard data retrieval

Backend database updates were confirmed after user actions, and frontend state updates correctly reflected backend responses.

Error handling was also tested to ensure invalid requests are managed appropriately.

---

# Must-Have Feature Verification

The following must-have requirements were fully implemented and tested successfully:

## User Authentication and Authorization
- Users can register, login, and logout
- Only verified University of Auckland students can register
- Only logged-in users can access Platemates

## Meal Session / Food Invites Dashboard
- Displays all active meal sessions
- Sessions display key details including:
  - Session name
  - Description
  - Location
  - Time
  - Available slots

## Create/Post Meal Session Feature
- Users can create and post meal sessions successfully

## Join/Leave Meal Session Feature
- Users can join and leave meal sessions
- Users can only join one active meal session at a time

---

# Final Testing Summary

End-to-end testing was conducted on all core workflows within the application. Testing confirmed that the main must-have features are functioning correctly and that frontend-backend integration behaves as expected.

Overall, Platemates successfully delivers:
- Secure student authentication
- Shared meal session management
- Real-time interaction updates
- A responsive and user-friendly experience
- Core functionality outlined in the original project proposal