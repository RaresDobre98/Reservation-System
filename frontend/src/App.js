import React, { Component } from "react";
import {
  Alert,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import axios from "axios";

class App extends Component {
  state = {
    resources: [],
    newResourceData: {
      resource_name: ""
    },
    editResourceData: {
      resource_id: "",
      resource_name: ""
    },
    newResourceModal: false,
    editResourceModal: false,
    errorMessage: "No error ;)",
    errorMessageModal: false
  };

  UNSAFE_componentWillMount() {
    this._refreshResources();
  }

  toggleErrorMessage() {
    this.setState({
      errorMessageModal: !this.state.errorMessageModal
    });
  }

  toggleNewResourceModal() {
    this.setState({
      newResourceModal: !this.state.newResourceModal,
      errorMessageModal: false
    });
  }

  toggleEditResourceModal() {
    this.setState({
      editResourceModal: !this.state.editResourceModal,
      errorMessageModal: false
    });
  }

  addResource() {
    axios
      .post("http://localhost:8000/api/resource", this.state.newResourceData)
      .then(res => {
        //console.log(res.data);
        let { resources } = this.state;
        resources.push({ ...res.data.data, resource_id: res.data.id });
        this.setState({
          resources,
          newResourceModal: false,
          newResourceData: {
            resource_name: ""
          }
        });
      })
      .catch(err =>
        this.setState({
          errorMessage: err.response.data.error,
          errorMessageModal: true
        })
      );
  }

  editResource(resource_id, resource_name) {
    //console.log(resource_id, resource_name);
    this.setState({
      editResourceData: {
        resource_id,
        resource_name
      }
    });
    this.toggleEditResourceModal();
  }

  updateResource() {
    // console.log("here");
    console.log(this.state.editResourceData);
    let { resource_id, resource_name } = this.state.editResourceData;
    axios
      .patch("http://localhost:8000/api/resource/" + resource_id, {
        resource_name
      })
      .then(res => {
        console.log(res);
        this._refreshResources();

        this.setState({
          editResourceModal: false,
          editResourceData: { resource_id: "", resource_name: "" }
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          errorMessage: err.response.data.error,
          errorMessageModal: true
        });
      });
  }

  _refreshResources() {
    axios.get("http://localhost:8000/api/resources").then(res => {
      this.setState({
        resources: res.data.data
      });
    });
  }

  render() {
    let resources = this.state.resources.map(resource => {
      return (
        <tr key={resource.resource_id}>
          <td>{resource.resource_id}</td>
          <td>{resource.resource_name}</td>
          <td>
            <Button
              color="success"
              size="sm"
              className="mr-2"
              onClick={this.editResource.bind(
                this,
                resource.resource_id,
                resource.resource_name
              )}
            >
              Edit
            </Button>
            <Button color="danger" size="sm">
              Delete
            </Button>
          </td>
        </tr>
      );
    });

    return (
      <div className="App container">
        <h1>Reservation System</h1>

        <Button
          className="my-3"
          color="primary"
          onClick={this.toggleNewResourceModal.bind(this)}
        >
          Add a new Resource
        </Button>
        <Modal
          style={{ opacity: 1 }}
          isOpen={this.state.newResourceModal}
          toggle={this.toggleNewResourceModal.bind(this)}
        >
          <ModalHeader toggle={this.toggleNewResourceModal.bind(this)}>
            Add a new Resource
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="resource_name">Resource Name</Label>
              <Input
                id="resource_name"
                value={this.state.newResourceData.resource_name}
                onChange={e => {
                  let { newResourceData } = this.state;

                  newResourceData.resource_name = e.target.value;

                  this.setState({ newResourceData });
                }}
                placeholder="insert name here"
              />
              <Alert
                className="my-1"
                color="danger"
                isOpen={this.state.errorMessageModal}
              >
                {this.state.errorMessage}
              </Alert>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.addResource.bind(this)}>
              Add Resource
            </Button>{" "}
            <Button
              color="secondary"
              onClick={this.toggleNewResourceModal.bind(this)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          style={{ opacity: 1 }}
          isOpen={this.state.editResourceModal}
          toggle={this.toggleEditResourceModal.bind(this)}
        >
          <ModalHeader toggle={this.toggleEditResourceModal.bind(this)}>
            Edit Resource
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="resource_name">Resource Name</Label>
              <Input
                id="resource_name"
                value={this.state.editResourceData.resource_name}
                onChange={e => {
                  let { editResourceData } = this.state;

                  editResourceData.resource_name = e.target.value;

                  this.setState({ editResourceData });
                }}
              />
              <Alert
                className="my-1"
                color="danger"
                isOpen={this.state.errorMessageModal}
              >
                {this.state.errorMessage}
              </Alert>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.updateResource.bind(this)}>
              Update Resource
            </Button>{" "}
            <Button
              color="secondary"
              onClick={this.toggleEditResourceModal.bind(this)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Resource name</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>{resources}</tbody>
        </Table>
      </div>
    );
  }
}

export default App;
