import { Link } from 'react-router-dom';
export default function Sidebar(){
  return <aside style={{padding:16, display:'flex', flexDirection:'column', gap:10}}><Link to="/dashboard">Dashboard</Link><Link to="/search">Search</Link><Link to="/settings">Settings</Link><Link to="/reports">Reports</Link><Link to="/invoices">Invoices</Link><Link to="/schedule">Schedule</Link></aside>
}