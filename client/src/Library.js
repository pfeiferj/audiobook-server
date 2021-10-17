import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function Library() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    let mounted = true;
    axios.get('http://localhost:3001/books')
      .then(response => setBooks(response.data))
      .catch(e => console.error(e));
    return () => mounted = false;
  }, []);

  return (
    <div className="Library">
      {
        books.map(book => (<Link to={"/book/" + book.path}><p>{book.title}</p></Link>))
      }
    </div>
  );
}
