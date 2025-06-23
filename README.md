# 🤖 AI Web Scraping Agent

An intelligent, goal-driven web scraping agent powered by **Gemini 1.5 Flash** and **Playwright**. Simply describe what you want to extract from any website, and the AI will analyze the objective, create a scraping plan, and execute it with human-like browser automation.

![AI Web Scraping Agent](https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

- 🧠 **AI-Powered Analysis**: Gemini 1.5 Flash analyzes your scraping objectives and generates intelligent extraction plans
- 🎭 **Human-like Automation**: Playwright browser automation with realistic delays and behavior patterns
- 📊 **Real-time Monitoring**: Live progress tracking with detailed logs and status updates
- 🎯 **Goal-Driven Approach**: Simply describe what you want - no need to write selectors or scripts
- 📱 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 🔄 **Auto-Polling**: Real-time updates without manual refresh
- 📥 **Data Export**: Export scraped data as JSON files
- 🔍 **Smart Filtering**: Search and filter extracted data with ease

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-web-scraping-agent.git
   cd ai-web-scraping-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   VITE_API_URL=http://localhost:3001/api
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 How It Works

1. **Describe Your Goal**: Tell the AI what data you want to extract (e.g., "Get product names and prices from this e-commerce site")

2. **AI Analysis**: Gemini 1.5 Flash analyzes your objective and the target website to create an intelligent scraping plan

3. **Browser Automation**: Playwright executes the plan with human-like behavior - scrolling, waiting, clicking as needed

4. **Data Extraction**: Smart selectors identify and extract the relevant data from the page

5. **Results**: View, search, filter, and export your extracted data

## 📋 Example Use Cases

- **E-commerce**: Extract product names, prices, descriptions, and reviews
- **News Sites**: Scrape article titles, content, authors, and publication dates
- **Job Boards**: Collect job titles, companies, locations, and requirements
- **Real Estate**: Gather property listings, prices, and details
- **Social Media**: Extract posts, engagement metrics, and user information
- **Research**: Collect data from academic papers, reports, and databases

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Playwright** for browser automation
- **Google Generative AI** (Gemini 1.5 Flash)

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for fast development

## 📁 Project Structure

```
ai-web-scraping-agent/
├── backend/
│   ├── services/
│   │   ├── gemini.ts          # Gemini AI integration
│   │   └── scraper.ts         # Playwright automation
│   ├── types/
│   │   └── index.ts           # TypeScript definitions
│   └── server.ts              # Express server
├── src/
│   ├── components/
│   │   ├── ObjectiveForm.tsx  # Scraping objective input
│   │   ├── TaskCard.tsx       # Task status display
│   │   ├── LogViewer.tsx      # Real-time logs
│   │   └── ResultsViewer.tsx  # Data visualization
│   ├── services/
│   │   └── api.ts             # API client
│   ├── hooks/
│   │   └── usePolling.ts      # Real-time updates
│   └── App.tsx                # Main application
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | Required |
| `PORT` | Backend server port | 3001 |
| `VITE_API_URL` | Frontend API URL | http://localhost:3001/api |

### Playwright Configuration

The scraper is configured with:
- Headless browser mode (set to `false` for debugging)
- Realistic user agent and viewport
- Anti-detection measures
- Human-like delays and behavior

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/objectives` | Create new scraping objective |
| `GET` | `/api/objectives` | List all objectives |
| `GET` | `/api/objectives/:id` | Get objective details |
| `GET` | `/api/objectives/:id/logs` | Get objective logs |
| `DELETE` | `/api/objectives/:id` | Delete objective |
| `GET` | `/api/health` | Health check |

## 🚦 Development

### Running in Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or run separately
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

### Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:backend
```

### Linting

```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and research purposes. Always respect websites' robots.txt files and terms of service. Be mindful of rate limiting and avoid overloading servers. The developers are not responsible for any misuse of this software.

## 🙏 Acknowledgments

- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI-powered analysis
- [Playwright](https://playwright.dev/) for reliable browser automation
- [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI
- [Lucide](https://lucide.dev/) for the amazing icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ai-web-scraping-agent/issues) page
2. Create a new issue with detailed information
3. Join our [Discussions](https://github.com/yourusername/ai-web-scraping-agent/discussions)

---

**Made with ❤️ by [Riahi Yassine](https://github.com/RiahiYassinn)**

⭐ Star this repository if you find it helpful!
