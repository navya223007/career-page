import { BrowserRouter, Routes, Route } from "react-router-dom";
import CareerPage from "./CareerPage";
import AdminPage from "./AdminPage";
import JobList from "./JobList";
import ApplyForm from "./ApplyForm";
import "./career.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CareerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/apply" element={<ApplyForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
