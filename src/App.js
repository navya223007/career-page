import { BrowserRouter, Routes, Route } from "react-router-dom";
import CareerPage from "./CareerPage";
import AdminPage from "./AdminPage";
import "./career.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CareerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
