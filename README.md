# Road Safety Predictive Platform

AI-powered predictive road safety platform for accident prevention and proactive risk mitigation.

## Product Vision

To become India's leading predictive road safety platform that transforms how cities prevent accidents by shifting from reactive response to proactive risk mitigation through AI-powered intelligence.

## Target Audience

- **Traffic Police Commissioners**: Need actionable intelligence for accident prevention
- **Urban Planning Engineers**: Require data for infrastructure improvement decisions
- **Road Safety Policy Analysts**: Analyze patterns and trends for policy recommendations

## Core Features

- **Accident Data Management**: Complete CRUD operations for accident records
- **Location-based Tracking**: GPS coordinates and location-based accident mapping
- **Severity Classification**: Categorize accidents by severity levels
- **Risk Scoring**: Calculate and track risk scores for accident-prone areas
- **Historical Data Analysis**: Store and query historical accident data

## Technology Stack

- **Backend Framework**: FastAPI (Python)
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Data Validation**: Pydantic
- **Architecture**: Modular Monolith

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

## Installation

1. **Clone the repository** (if applicable)

2. **Create a virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r backend/requirements.txt
```

4. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

## Running the Application

### Development Mode

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Accidents

- `POST /api/v1/accidents/` - Create a new accident record
- `GET /api/v1/accidents/` - Get all accident records (with optional filters)
- `GET /api/v1/accidents/{accident_id}` - Get a specific accident record
- `PUT /api/v1/accidents/{accident_id}` - Update an accident record
- `DELETE /api/v1/accidents/{accident_id}` - Delete an accident record

### Health Check

- `GET /health` - Check API health status
- `GET /` - API information

## Database Schema

### Accident Model

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| location | String | Accident location |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| severity | String | Severity level (Low, Medium, High, Critical) |
| date_time | DateTime | Accident date and time |
| weather_condition | String | Weather at time of accident |
| road_condition | String | Road condition |
| traffic_density | String | Traffic density level |
| vehicle_type | String | Type of vehicle involved |
| casualties | Integer | Number of casualties |
| injuries | Integer | Number of injuries |
| description | Text | Detailed description |
| risk_score | Float | Calculated risk score (0-100) |
| is_predicted | Boolean | Whether this is a predicted accident |
| created_at | DateTime | Record creation timestamp |
| updated_at | DateTime | Record update timestamp |

## Example API Usage

### Create an Accident Record

```bash
curl -X POST "http://localhost:8000/api/v1/accidents/" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "MG Road, Bangalore",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "severity": "High",
    "weather_condition": "Rainy",
    "road_condition": "Wet",
    "traffic_density": "Heavy",
    "casualties": 0,
    "injuries": 2,
    "description": "Two-vehicle collision at intersection"
  }'
```

### Get All Accidents

```bash
curl -X GET "http://localhost:8000/api/v1/accidents/"
```

### Filter by Severity

```bash
curl -X GET "http://localhost:8000/api/v1/accidents/?severity=High"
```

## Project Structure

```
.
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection and session
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── requirements.txt     # Python dependencies
│   └── routers/
│       ├── __init__.py
│       └── accidents.py     # Accident CRUD endpoints
├── .env.example             # Environment variables template
└── README.md               # This file
```

## Architecture

The application follows a **Modular Monolith** architecture with clear separation of concerns:

- **Routers**: Handle HTTP requests and responses
- **Models**: Define database schema using SQLAlchemy ORM
- **Schemas**: Validate request/response data using Pydantic
- **Database**: Manage database connections and sessions
- **Config**: Centralized configuration management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| APP_NAME | Application name | Road Safety Predictive Platform |
| DATABASE_URL | Database connection string | sqlite:///./road_safety.db |
| SECRET_KEY | Secret key for JWT tokens | (change in production) |
| CORS_ORIGINS | Allowed CORS origins | ["http://localhost:3000"] |
| DEBUG | Debug mode | False |

## Security Considerations

- Change `SECRET_KEY` in production to a strong random string
- Use PostgreSQL or MySQL in production instead of SQLite
- Implement authentication and authorization for production use
- Enable HTTPS in production
- Configure proper CORS origins
- Implement rate limiting for API endpoints

## Future Enhancements

- AI-powered accident prediction models
- Real-time accident risk mapping
- Integration with traffic management systems
- Mobile application for field data collection
- Advanced analytics and reporting dashboards
- Integration with weather and traffic APIs

## License

[Specify your license here]

## Support

For issues and questions, please contact the development team.
