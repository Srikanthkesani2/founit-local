import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Pages/Home';
import Browse from './Pages/Browse';
import PostItem from './Pages/PostItem';
import MyItems from './Pages/MyItems';
import Messages from './Pages/Messages';
import Profile from './Pages/Profile';
import ItemDetail from './Pages/ItemDetail';
import AdminPanel from './Pages/AdminPanel';
import { createPageUrl } from './utils';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path={createPageUrl('Home')} element={<Home />} />
        <Route path={createPageUrl('Browse')} element={<Browse />} />
        <Route path={createPageUrl('PostItem')} element={<PostItem />} />
        <Route path={createPageUrl('MyItems')} element={<MyItems />} />
        <Route path={createPageUrl('Messages')} element={<Messages />} />
        <Route path={createPageUrl('Profile')} element={<Profile />} />
        <Route path={createPageUrl('ItemDetail')} element={<ItemDetail />} />
        <Route path={createPageUrl('AdminPanel')} element={<AdminPanel />} />
      </Routes>
    </Layout>
  );
}

export default App;