# MySchool Frontend

React.js frontend for the MySchool educational platform.

## Tech Stack

- React.js 19
- Material UI (MUI)
- Redux Toolkit
- React Router v7
- Axios

## Setup

### Install Dependencies

```bash
yarn install
```

### Environment Configuration

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Run Development Server

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

### Build for Production

```bash
yarn build
```

Output will be in the `build` folder.

## Project Structure

```
src/
├── components/       # UI Components
├── LMS/             # Learning Management System
├── Routes/          # Application routing
├── redux/           # State management
├── assests/         # Static assets
└── App.js           # Root component
```

## Available Scripts

- `yarn start` - Development server
- `yarn build` - Production build
- `yarn test` - Run tests

## Deployment

See `/deployment/HOSTINGER_DEPLOYMENT.md` for deployment guide.

---

**Developed by**: Abhishek & Mahesh
