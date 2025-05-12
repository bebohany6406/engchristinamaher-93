
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create the root once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById("root")!).render(<App />);
});
