import React from 'react';
import { Navbar, Nav, Button, CustomProvider } from 'rsuite';
import 'rsuite/styles/index.less';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Book from './Book.js';
import Library from './Library.js';

const NavBrand = React.forwardRef(({ href, children, ...rest }, ref) => (
  <Link ref={ref} to={href} {...rest}>
    {children}
  </Link>
));

function App() {
  return (
    <Router>
      <CustomProvider theme="light">
        <div>
          <Navbar style={{marginBottom:'8px'}}>
            <Navbar.Brand as={NavBrand} href="/">
                Audiobook Server
            </Navbar.Brand>
          </Navbar>

          <Switch>
            <Route path="/book/:book" component={Book} />
            <Route path="/">
              <Library />
            </Route>
          </Switch>
        </div>
      </CustomProvider>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

export default App;
