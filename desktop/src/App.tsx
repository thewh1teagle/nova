import { Route, Routes } from "react-router-dom";
import "./globals.css";
import Home from "./pages/Home";
import '~/lib/i18n'

function App() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
