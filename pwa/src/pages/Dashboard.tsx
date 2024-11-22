import AdminSidebar from "../components/AdminSidebar";
import Bar from '../components/Bar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/_recursos.scss';



const Dashboard = () => {
  
  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="recursos-container">
        <Bar />
        <p>general</p>
      </div>
    </div>
  );
};

export default Dashboard;
