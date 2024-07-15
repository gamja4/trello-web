import { BrowserRouter, Route, Router, Routes } from "../node_modules/react-router-dom/dist/index";
import "./App.css";
import KanbanBoard from "./components/KanbanBoard";
import BoardList from "./components/BoardList.tsx";
import Intro from "./pages/Intro";

function App() {
  // return <KanbanBoard />;
  return <BrowserRouter>
    <Routes>
    <Route path="/" element={<Intro />} />
      <Route path="/boards" element={<BoardList />} />
      <Route path="/board/:boardId" element={<KanbanBoard />} />
    </Routes>
  </BrowserRouter>
}

export default App;
