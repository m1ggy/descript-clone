import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path='/signup'>
            <Signup />
          </Route>
          <Route path='/' exact>
            <Login />
          </Route>
          <Route path='*'>
            <h1>Page not Found.</h1>
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
