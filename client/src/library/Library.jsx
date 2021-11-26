import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { Panel, Row, Col, Grid } from 'rsuite';
import queryString from 'query-string';
import './Library.less';

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
                  <Panel header={book.title} shaded bordered bodyFill className="panel-flex">
                        <img className="library-cover-image" alt="Book cover art" src={"http://localhost:3001/book/cover?"+queryString.stringify({filename:book.path})} />
                  </Panel>
              </Col>
            </Link>
          ))
        }
      </Row>
    </Grid>
  );
}
