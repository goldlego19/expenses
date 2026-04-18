import { Routes, Route } from "react-router-dom";
import Expenses from "./pages/Expenses";

function App() {
  return (
    <Routes>
      {/* This makes the Expenses app your main home page */}
      <Route path="/" element={<Expenses />} />
    </Routes>
  );
}

export default App;
