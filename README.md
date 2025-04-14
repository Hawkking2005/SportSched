# SportSched - Sports Facility Reservation System

A full-stack web application for managing sports facility reservations. Built with Django (backend) and React (frontend).

## Features

- User authentication (login/register)
- View sports facilities and courts
- Make reservations for specific time slots
- View and manage your reservations
- Maximum 2 reservations per user
- Prevents booking multiple courts at the same time
- Modern and responsive UI

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm (comes with Node.js)

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

2. Install backend dependencies:
```bash
pip install django djangorestframework django-cors-headers dj-rest-auth django-allauth channels
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create a superuser (for admin access):
```bash
python manage.py createsuperuser
```

5. Start the Django server:
```bash
python manage.py runserver
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd sports-reservation-frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Initial Setup

1. Access the admin panel at `http://localhost:8000/admin`
2. Log in with your superuser credentials
3. Create at least one Sport Facility
4. Create courts for each facility
5. The system will automatically generate time slots for the courts

## Usage

1. Register a new account or log in
2. Browse available facilities
3. Select a court
4. Choose a date and available time slot
5. Make a reservation
6. View and manage your reservations in the "My Reservations" section

## Important Notes

- Users can have a maximum of 2 active reservations
- Users cannot book multiple courts at the same time slot
- Time slots are generated from 12 PM to 8 PM
- Each time slot duration is set by the facility's slot_duration setting

## Development

- Backend API documentation available at `http://localhost:8000/api/`
- Frontend code is in the `sports-reservation-frontend` directory
- Backend code is in the `sports_reservation_backend` directory

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

