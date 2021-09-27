import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './routes/PrivateRoute';
import Projects from './pages/Projects';
import CurrentProject from './pages/CurrentProject';
import ExportedProject from './pages/ExportedProject';
import 'react-toastify/dist/ReactToastify.min.css';
function App() {
  return (
    <>
      <ToastContainer
        position='bottom-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Router>
        <Switch>
          <Route path='/signup'>
            <Signup />
          </Route>
          <Route path='/' exact>
            <Login />
          </Route>
          <PrivateRoute
            component={ExportedProject}
            path='/projects/:id/exported'
          />
          <PrivateRoute component={CurrentProject} path='/projects/:id' />
          <PrivateRoute component={Projects} path='/projects' />

          <Route path='*'>
            <h1>Page not Found.</h1>
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
