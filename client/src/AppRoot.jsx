import {Navigate,Route,Routes} from 'react-router-dom';
import {Landing} from './pages/Landing';
import {Public} from './pages/Public';

export default function App(){
 return <Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/c/:slug" element={<Public/>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>;
}
