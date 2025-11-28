// Note: React polyfills have been removed as they were causing hook resolution conflicts
// React hooks are now handled natively by React 18

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
