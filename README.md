# Telegram Mini App - Mess Management System

A modern Telegram Mini App for managing mess services, built with React and Vite.

## 🚀 Features

- **Student Dashboard** - View personal info, current bills, and quick actions
- **Bill Management** - View bills, submit payments, track payment status
- **QR Scanner** - Mark attendance by scanning student QR codes
- **Profile Management** - View and manage student profile information
- **Real-time Updates** - Instant feedback and notifications

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Tailwind CSS with Telegram theme
- **State Management**: Zustand
- **HTTP Client**: Axios
- **QR Scanner**: @yudiel/react-qr-scanner
- **Icons**: Heroicons
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd telegram-mini-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Edit `src/services/apiService.js` and update the `API_BASE_URL`:

   ```javascript
   const API_BASE_URL = "https://your-backend-url.com/api";
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Build the project**

   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Configure Telegram Bot

1. **Register Mini App with @BotFather**

   - Send `/newapp` to @BotFather
   - Follow the prompts to create your Mini App
   - Set the Web App URL to your Vercel deployment URL

2. **Set Menu Button**
   - Send `/setmenubutton` to @BotFather
   - Configure the button to open your Mini App

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_APP_NAME=Mess Management
```

### Backend Integration

The app expects the following API endpoints:

- `POST /auth/telegram-login/` - Telegram authentication
- `GET /auth/profile/` - Get user profile
- `GET /mess/bills/current/` - Get current bill
- `GET /mess/bills/all/` - Get all bills
- `POST /mess/bills/{id}/payment/` - Submit payment
- `POST /mess/attendance/mark/` - Mark attendance
- `GET /mess/attendance/my/` - Get user attendance
- `POST /mess/mess-cuts/` - Apply for mess cut
- `GET /mess/mess-cuts/my/` - Get user mess cuts
- `GET /mess/scanner/stats/` - Get scanner statistics

## 📱 Usage

### For Students

1. **Dashboard** - View current bill and quick actions
2. **Bills** - View all bills and submit payments
3. **Profile** - View personal information and QR code

### For Staff (Scanner Access)

1. **QR Scanner** - Scan student QR codes to mark attendance
2. **Meal Selection** - Choose breakfast, lunch, or dinner
3. **Instant Feedback** - Get immediate confirmation of attendance marking

## 🎨 Customization

### Theming

The app uses a Telegram-native color scheme defined in `tailwind.config.js`:

```javascript
colors: {
  telegram: {
    bg: '#17212b',
    secondary: '#242f3d',
    accent: '#64b5ef',
    text: '#ffffff',
    hint: '#708499',
  }
}
```

### Components

All components are modular and can be easily customized:

- `src/components/dashboard/` - Dashboard components
- `src/components/bills/` - Bill management components
- `src/components/scanner/` - QR scanner components
- `src/components/profile/` - Profile components
- `src/components/common/` - Shared components

## 🔒 Security

- **Telegram Authentication** - Uses Telegram's secure authentication
- **JWT Tokens** - Secure API communication
- **CORS Configuration** - Properly configured for Telegram domains
- **Input Validation** - Client-side and server-side validation

## 📊 Performance

- **Lazy Loading** - Components loaded on demand
- **Optimized Images** - Automatic image optimization
- **Minimal Bundle** - Tree-shaking and code splitting
- **Fast Loading** - Vite's fast development and build

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working in QR Scanner**

   - Ensure HTTPS is enabled
   - Check browser permissions
   - Test on actual device (not desktop browser)

2. **Telegram WebApp not loading**

   - Verify the URL is correctly set in @BotFather
   - Check CORS configuration
   - Ensure SSL certificate is valid

3. **API calls failing**
   - Check the API base URL configuration
   - Verify backend is running and accessible
   - Check authentication token storage

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.
