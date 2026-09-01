# Cineby - Open Source Cinematic Database

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/next.js-%23000000.svg?style=flat&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)

Cineby is an open-source, informational metadata search engine designed to help users explore and discover data about cinema, television, and cast members. Powered by TMDB (The Movie Database), it serves purely as an educational index to organize cast, crew, and cinematic releases into a beautiful and responsive user interface.

## 📖 Educational & Informational Purpose (Fair Use)

This project was built primarily for educational purposes and cinematic research. 
Cineby utilizes poster artwork, promotional materials, and movie metadata under the principles of **Fair Use** for informational and discovery purposes.

**Important Legal Disclaimer:**
* Cineby **does not** host, store, stream, or distribute any media files or copyrighted video content.
* The application is shipped as a purely empty shell (Bring Your Own Content). 
* Any video playback capability is determined entirely on the client-side via user-configured local storage.
* Automated DMCA scrapers flagging this repository or deployed instances for "streaming" are misdirected, as no such files reside on this infrastructure.

## ✨ Features

- **Rich Metadata Exploration:** Browse top movies, trending TV shows, and detailed actor profiles.
- **BYOC Architecture:** A Bring Your Own Content system that allows users to supply their own personal third-party player template links securely via `localStorage`.
- **Zero Tracking:** No user data or viewing history is sent to a backend server. Everything stays securely on the user's browser.
- **Fully Responsive:** Beautifully designed using Tailwind CSS, adapting smoothly to mobile, tablet, and desktop layouts.

## 🚀 Getting Started

To run this project locally, you will need Node.js and a valid TMDB API Read Access Token.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cineby.git
cd cineby
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of the project and add the following variables:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_DIRECT_LINK=your_monetization_link_here (optional)
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
