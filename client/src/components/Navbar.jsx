import { Link } from 'react-router-dom';
export default function Navbar(){
  return <nav style={{padding:16, display:'flex', gap:16}}><Link to="/">BD Paint Pro</Link><Link to="/dashboard">Dashboard</Link><Link to="/login">Login</Link></nav>
}