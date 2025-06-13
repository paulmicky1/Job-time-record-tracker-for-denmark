# DAX - Danish Income Tracker

## Overview
DAX is a comprehensive income tracking application designed specifically for individuals working in Denmark. It helps users manage their work hours, track income across multiple jobs, and maintain detailed financial records while adhering to Danish tax regulations.

## Features

### 1. Multi-Job Management
- Add and manage multiple jobs with different hourly rates
- Track work hours for each job separately
- Set job-specific details including start dates and descriptions

### 2. Income Tracking
- Real-time income calculations based on hours worked
- Monthly and yearly income summaries
- Detailed breakdown of earnings by job
- Export functionality for financial records (Excel/CSV)

### 3. Tax Management
- Danish tax bracket integration
- Automatic tax calculations
- Tax settings management
- Support for different tax card types

### 4. User-Friendly Interface
- Clean, intuitive design
- Dark mode support
- Responsive layout for both mobile and web
- Multi-language support

### 5. Data Security
- Secure authentication system
- Data encryption
- Privacy-focused design
- Regular backups

## Technical Stack

### Frontend
- React Native
- Expo
- TypeScript
- NativeWind (Tailwind CSS)

### Backend
- Supabase
- PostgreSQL
- Row Level Security (RLS)

### Authentication
- Supabase Auth
- Secure session management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Usage

### Adding a Job
1. Navigate to the Jobs section
2. Click "Add Job"
3. Enter job details:
   - Job name
   - Hourly rate
   - Start date
   - Description (optional)

### Recording Work Hours
1. Go to the Tracking page
2. Select the job
3. Enter hours worked
4. Add any relevant notes
5. Save the entry

### Viewing Income Reports
1. Access the Income page
2. Choose between monthly or yearly view
3. View detailed breakdowns
4. Export data as needed

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Author
PAUL MICKY D COSTA

## Support
For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments
- Danish Tax Agency (SKAT) for tax regulations
- Supabase team for the excellent backend service
- Expo team for the amazing development platform 