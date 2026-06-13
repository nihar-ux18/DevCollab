import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import QueryProvider from './app/providers/QueryProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
<QueryProvider>
  <App />
</QueryProvider>
);
