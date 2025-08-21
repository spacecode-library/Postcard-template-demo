# Postcard Frontend

A React-based frontend application for the Postcard marketing platform.

## Features

- User authentication (Sign up, Login)
- Comprehensive onboarding flow
  - Company URL entry with enrichment
  - Template selection
  - Company information setup
  - Template customization
  - Targeting and budget configuration
  - Campaign review
- Responsive design based on Figma specifications

## Prerequisites

- Node.js (v20.19+ or v22.12+)
- npm or yarn
- Backend API running on http://localhost:3000

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
VITE_API_URL=http://localhost:3000/api
```

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Build

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts (Auth)
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   └── onboarding/    # Onboarding flow
├── services/          # API services
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Authentication Flow

1. User signs up or logs in
2. If onboarding not completed, redirected to onboarding
3. After onboarding, user accesses dashboard

## Onboarding Steps

1. **URL Entry**: Enter business website URL
2. **Template Selection**: Choose postcard template
3. **Company Info**: Fill company details
4. **Template Editor**: Customize template
5. **Targeting & Budget**: Set audience and budget
6. **Review**: Confirm campaign settings