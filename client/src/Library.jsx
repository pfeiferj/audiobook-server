import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { Panel, Row, Col, Nav, Grid } from 'rsuite';
import queryString from 'query-string';
import './Library.less';

const NavLink = React.forwardRef(({ href, children, ...rest }, ref) => (
  <Link ref={ref} to={href} {...rest}>
    {children}
  </Link>
));

export default function Library() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/library')
      .then(response => setBooks(response.data))
      .catch(e => console.error(e));
  }, []);

  return (
    <Grid fluid>
      <Row>
        {

          books.map(book => (
            <Link to={"/book/" + book.path}>
            <Col lg="6" md="12" sm="12" xs="24">
                <Panel header={book.title} shaded bordered bodyFill style={{display:'flex',flexDirection:'column',height:'360px'}}>
                      <img style={{minHeight:'0px',minWidth:'0px',maxWidth:'100%',maxHeight:'100%',display:'block',marginLeft:'auto',marginRight:'auto',flexShrink:1}} alt="Book cover art" src={"http://localhost:3001/book/cover?"+queryString.stringify({filename:book.path})} />
                </Panel>
            </Col>
            </Link>
          ))
        }
      </Row>
    </Grid>
  );
}
