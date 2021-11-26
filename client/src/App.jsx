import React from 'react';
import { Navbar, CustomProvider } from 'rsuite';
import 'rsuite/styles/index.less';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Book from './book/Book.jsx';
import Library from './library/Library.jsx';

const NavBrand = React.forwardRef(({ href, children, ...rest }, ref) => (
  <Link ref={ref} to={href} {...rest}>
    {children}
  </Link>
));

function App() {
  return (
    <Router>
      <CustomProvider theme="dark">
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

export default App;
