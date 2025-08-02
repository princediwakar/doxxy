// Import React polyfill FIRST to prevent useLayoutEffect errors
import './lib/react-polyfill'
// Import SSR polyfill for additional protection
import './lib/ssr-polyfill'

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
