import logo from './logo.svg';
import './App.css';
// Import everything needed to use the `useQuery` hook
import { useQuery, useMutation, gql } from '@apollo/client';
import React from 'react';
const GET_DATA = gql`
query books {
  books {
    author
    title
  }  
} 
`;
const UPLOAD_IMAGE = gql`
mutation UploadFile ($_File:Upload){
  UploadFile(_File:$_File) 
} 
`;
function DisplayData() {
  const { loading, error, data } = useQuery(GET_DATA);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return data.books.map(({ title, author }) => (
    <div key={title}>
      <h3>{title}</h3>

      <br />
      <b>Author::</b>
      <p>{author}</p>
      <br />
    </div>
  ));
}

function App() {
  const [ImagePath, setImagePath] = React.useState(null);
  const [File, setFile] = React.useState(null);
  const handleFileChange = (e) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };
  const [upLoadFile] = useMutation(UPLOAD_IMAGE, {
    variables: { _File: File },
    onError: ({ error }) => {
      console.log(error)
    },
    onCompleted: ({ UploadFile }) => {
      setImagePath(UploadFile);
      console.log(UploadFile);
    },
  });
  const handleUploadClick = () => {
    // 👇 We redirect the click event onto the hidden input element
    //inputRef.current?.click();
    upLoadFile();
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />


      </header>
      <div>
        <h2>My first Apollo app 🚀</h2>
      </div>
      <div><h4>Upload Image</h4>

        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: 'block' }}
        />
        {File && <button onClick={(e) => handleUploadClick()}>Upload</button>}
      </div>
      <DisplayData />
      <div>
        {ImagePath && <img width="400" height="250" alt="location-reference" src={`${ImagePath}`} />}
      </div>
    </div>
  );
}

export default App;

