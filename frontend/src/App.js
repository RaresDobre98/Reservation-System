import React from "react";
import { Table, Button } from "reactstrap";

function App() {
  return (
    <div className="App container">
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Resource name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>Resource name</td>
            <td>
              <Button color="success" size="sm" className="mr-2">
                Edit
              </Button>
              <Button color="danger" size="sm">
                Delete
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default App;
