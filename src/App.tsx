import { BrowserRouter, Route, Router, Routes } from "../node_modules/react-router-dom/dist/index";
import "./App.css";
import KanbanBoard from "./components/KanbanBoard";

function App() {
  // return <KanbanBoard />;
  return <BrowserRouter>
    <Routes>
      <Route path="/board/:boardId" element={<KanbanBoard />} />
    </Routes>
  </BrowserRouter>
}

export default App;
