# InterviewD - AI-Powered Interview Preparation Platform

![InterviewD Banner]

InterviewD is a cutting-edge interview preparation platform that combines artificial intelligence, real-time video feedback, and comprehensive assessment tools to help candidates prepare for technical interviews. Our platform uses advanced AI technology powered by Azure OpenAI to create realistic interview scenarios, providing personalized feedback and helping candidates improve their interview skills.

## 🌟 Why InterviewD?

- **Realistic Interview Experience**: Practice with our AI-powered talking head avatar that simulates real interview scenarios
- **Comprehensive Preparation**: From technical coding challenges to soft skills assessment
- **Instant Feedback**: Get real-time feedback on your performance, body language, and responses
- **Track Progress**: Monitor your improvement over time with detailed analytics
- **Flexible Practice**: Practice anytime, anywhere, at your own pace

## ✨ Features

- 🤖 **AI Interviewer** - Interactive AI-powered interviewer with talking head avatar
- 📹 **Real-time Video Feedback** - Practice your interview presence with live video feed
- 💻 **Code Editor** - Built-in code editor for technical questions
- 📊 **ATS Resume Check** - Analyze your resume against ATS systems
- 💬 **Chat Interface** - Real-time chat interaction with the AI interviewer
- 📝 **Progress Tracking** - Monitor your improvement across practice sessions
- 🎯 **LeetCode Integration** - Practice with real technical interview questions
- 🔒 **Protected Routes** - Secure authentication system
- 📋 **Interview Tips** - Get real-time feedback and interview tips
- 📈 **Performance Analysis** - Detailed results and feedback after each session

## 🛠️ Tech Stack

### Frontend
- **React.js** - Core frontend framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **PostCSS** - Tool for transforming CSS with JavaScript

### AI & Backend Services
- **Azure OpenAI** - Powers our AI interviewer and natural language processing
- **WebRTC** - Handles real-time video and audio communication
- **Socket.io** - Enables real-time bidirectional communication

### Development Tools
- **ESLint** - JavaScript linting utility
- **Prettier** - Code formatter
- **Git** - Version control
- **Vercel** - Deployment and hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yashsrivasta7a/interviewD.git
```

2. Navigate to the project directory:
```bash
cd interviewD
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📁 Project Structure

```
src/
├── Components/                # React components
│   ├── talkingHead/          # AI interviewer avatar components
│   │   ├── AiInterviewer     # Core AI interviewer logic
│   │   ├── AvatarLoader      # Avatar loading and management
│   │   └── TalkingHead       # Avatar animation and rendering
│   ├── UI/                   # Reusable UI components
│   │   ├── Buttons          # Custom button components
│   │   └── GradientBg       # Gradient background effects
│   ├── ChatPanel            # Interview chat interface
│   ├── CodeEditor           # Code assessment interface
│   ├── VideoFeedPanel       # Video streaming component
│   └── InterviewSetup/      # Interview configuration
├── Pages/                    # Page components
│   ├── Homepage             # Landing page
│   └── InterviewPage        # Main interview interface
└── Utils/                   # Utility functions and services
    ├── azureOpenAiService   # AI service integration
    ├── ResumeParser        # ATS resume analysis
    └── Feedback            # Interview feedback system
```

## 🎯 Features in Detail

### 🤖 AI Interviewer
- **Advanced Avatar Technology**: Realistic talking head avatar with synchronized lip movements and facial expressions
- **Natural Language Processing**: Powered by Azure OpenAI for human-like conversations
- **Dynamic Question Generation**: AI-driven questions based on candidate responses
- **Behavioral Analysis**: Real-time analysis of speech patterns and response quality
- **Adaptive Difficulty**: Questions adapt based on candidate performance

### 🎥 Video Interview System
- **Real-time Video Processing**: High-quality video streaming with minimal latency
- **Body Language Analysis**: AI-powered analysis of posture, gestures, and facial expressions
- **Recording & Playback**: Review your interviews with timestamped feedback
- **Network Optimization**: Adaptive video quality based on connection speed
- **Camera/Mic Testing**: Built-in hardware testing functionality

### 💻 Code Assessment Platform
- **Feature-Rich Editor**: Syntax highlighting, auto-completion, and error detection
- **Multiple Language Support**: Python, JavaScript, Java, C++, and more
- **LeetCode Integration**: Practice with real interview questions
- **Real-time Compilation**: Instant feedback on code execution
- **Code Quality Analysis**: Automated code review and suggestions

### 📊 Performance Analytics
- **Detailed Metrics**: Track improvement across multiple practice sessions
- **Skill Gap Analysis**: Identify areas needing improvement
- **Progress Visualization**: Charts and graphs showing performance trends
- **Custom Reports**: Generate detailed performance reports
- **Improvement Suggestions**: AI-powered recommendations for improvement

### 🔒 Security & Privacy
- **Secure Authentication**: Protected routes and user authentication
- **Data Encryption**: End-to-end encryption for all sensitive data
- **GDPR Compliance**: Full compliance with privacy regulations
- **Secure Video Storage**: Encrypted storage of interview recordings
- **Access Control**: Fine-grained control over data access

## 🤝 Contributing

We welcome contributions to InterviewD! Here's how you can help:

1. **Fork the Repository**
2. **Create your Feature Branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your Changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the Branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear commit messages
- Add appropriate documentation
- Include unit tests for new features
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 Demo

Try out InterviewD at: [https://interview-d.vercel.app](https://interview-d.vercel.app)

## 📞 Contact & Support

- **Creator**: Yash Srivastava
- **GitHub**: [yashsrivasta7a](https://github.com/yashsrivasta7a)
- **Email**: [contact@interviewd.tech](mailto:contact@interviewd.tech)
- **Project Link**: [https://github.com/yashsrivasta7a/interviewD](https://github.com/yashsrivasta7a/interviewD)
- **Issues**: [Report a bug](https://github.com/yashsrivasta7a/interviewD/issues)

## 🙏 Acknowledgments

- Thanks to Azure OpenAI for providing the AI capabilities
- Special thanks to all contributors who have helped shape InterviewD
- Inspired by real interview experiences and feedback from the developer community
