import React, { Component } from "react";
import {
  Alert,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  Form
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
toast.configure({ autoClose: 4000, draggable: true });

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
    errorMessageModal: false,
    reservations: [],
    newReservationData: {
      start_date: "",
      end_date: "",
      resource_id: "",
      owner_email: "",
      comments: ""
    },
    editReservationData: {
      reservation_id: "",
      start_date: "",
      end_date: "",
      resource_id: "",
      owner_email: "",
      comments: ""
    },
    newReservationModal: false,
    editReservationModal: false
  };

  notify = () =>
    toast(
      "This resource cannot be deleted, there are still some reservations made!",
      {
        className: "black-background",
        bodyClassName: "grow-font-size",
        progressClassName: "fancy-progress-bar"
      }
    );

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

  toggleNewReservationModal() {
    this.setState({
      newReservationModal: !this.state.newReservationModal,
      errorMessageModal: false
    });
  }

  toggleEditResourceModal() {
    this.setState({
      editResourceModal: !this.state.editResourceModal,
      errorMessageModal: false
    });
  }

  addResource(e) {
    e.preventDefault();
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

  deleteResource(resource_id) {
    axios
      .delete("http://localhost:8000/api/resource/" + resource_id)
      .then(() => this._refreshResources())
      .catch(() => {
        this.notify();
      });
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

  updateResource(e) {
    // console.log("here");
    e.preventDefault();
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
            <Button
              color="danger"
              size="sm"
              onClick={this.deleteResource.bind(this, resource.resource_id)}
            >
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
          <Form onSubmit={this.addResource.bind(this)}>
            <ModalHeader toggle={this.toggleNewResourceModal.bind(this)}>
              Add a new Resource
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button type="submit" color="primary">
                Add Resource
              </Button>{" "}
              <Button
                color="secondary"
                onClick={this.toggleNewResourceModal.bind(this)}
              >
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        <Modal
          style={{ opacity: 1 }}
          isOpen={this.state.editResourceModal}
          toggle={this.toggleEditResourceModal.bind(this)}
        >
          <Form onSubmit={this.updateResource.bind(this)}>
            <ModalHeader toggle={this.toggleEditResourceModal.bind(this)}>
              Edit Resource
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button color="primary">Update Resource</Button>{" "}
              <Button
                color="secondary"
                onClick={this.toggleEditResourceModal.bind(this)}
              >
                Cancel
              </Button>
            </ModalFooter>
          </Form>
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
