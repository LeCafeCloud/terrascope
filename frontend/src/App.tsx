import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Visualization from './pages/Visualization';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/visualize" element={<Visualization />} />
            </Routes>
        </BrowserRouter>
    );
}
