// Required imports
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
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

// Toast is used for the top right error notification
toast.configure({ autoClose: 4000, draggable: true });

class App extends Component {
  // state is used by react to store all the informations for our application,
  // for example, if we add another resource we can update the resources
  // vector using setState which trigger a rerender of the html so we can
  // have a live feedback and see the resource added
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
    toast.error(
      "This resource cannot be deleted, there are still some reservations made!"
    );

  // Before our site(component) is rendered it will be nice to have
  // the data so we can display it :)
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

  toggleEditReservationModal() {
    this.setState({
      editReservationModal: !this.state.editReservationModal,
      errorMessageModal: false
    });
  }

  // Making a post request to the backend if any error happened then
  // the errorMessageModal is set to true in order to be shown up
  // else we push the new reservation to the existing vector of
  // reservations to have a live refresh and we set the modal
  // field to empty in order to add another reservation
  addReservation(e) {
    e.preventDefault();
    axios
      .post(
        "http://localhost:8080/api/reservation",
        this.state.newReservationData
      )
      .then(res => {
        //console.log(res.data);
        let { reservations } = this.state;
        reservations.push({ ...res.data.data, reservation_id: res.data.id });
        this.setState({
          reservations,
          newReservationModal: false,
          newReservationData: {
            start_date: "",
            end_date: "",
            resource_id: "",
            owner_email: "",
            comments: ""
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

  // Same as addReservation
  addResource(e) {
    e.preventDefault();
    axios
      .post("http://localhost:8080/api/resource", this.state.newResourceData)
      .then(res => {
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

  // We shouldn't have any error here but the server connection lost
  deleteReservation(reservation_id) {
    axios
      .delete("http://localhost:8080/api/reservation/" + reservation_id)
      .then(() => this._refreshResources())
      .catch(err => console.log(err));
  }

  // If any error happen it's because the resource still have some reservations in the databse
  deleteResource(resource_id) {
    axios
      .delete("http://localhost:8080/api/resource/" + resource_id)
      .then(() => this._refreshResources())
      .catch(() => {
        this.notify();
      });
  }

  // When we click the editReservation button then we must also set the field
  // of the modal to the corresponding values and also show the modal window
  editReservation(
    reservation_id,
    start_date,
    end_date,
    resource_id,
    owner_email,
    comments
  ) {
    this.setState({
      editReservationData: {
        reservation_id,
        start_date,
        end_date,
        resource_id,
        owner_email,
        comments
      }
    });
    this.toggleEditReservationModal();
  }

  // Same as editReservation
  editResource(resource_id, resource_name) {
    this.setState({
      editResourceData: {
        resource_id,
        resource_name
      }
    });
    this.toggleEditResourceModal();
  }

  // When clicking the Update Reservation buttton it send a PATCH request
  // to the backend with corresponding values from the modal
  updateReservation(e) {
    e.preventDefault();
    let {
      reservation_id,
      start_date,
      end_date,
      resource_id,
      owner_email,
      comments
    } = this.state.editReservationData;
    axios
      .patch("http://localhost:8080/api/reservation/" + reservation_id, {
        start_date,
        end_date,
        resource_id,
        owner_email,
        comments
      })
      .then(res => {
        this._refreshResources();

        this.setState({
          editReservationModal: false,
          editReservationData: {
            reservation_id: "",
            start_date: "",
            end_date: "",
            resource_id: "",
            owner_email: "",
            comments: ""
          }
        });
      })
      .catch(err => {
        this.setState({
          errorMessage: err.response.data.error,
          errorMessageModal: true
        });
      });
  }

  // Same as the updateReservation
  updateResource(e) {
    e.preventDefault();
    let { resource_id, resource_name } = this.state.editResourceData;
    axios
      .patch("http://localhost:8080/api/resource/" + resource_id, {
        resource_name
      })
      .then(res => {
        this._refreshResources();

        this.setState({
          editResourceModal: false,
          editResourceData: { resource_id: "", resource_name: "" }
        });
      })
      .catch(err => {
        this.setState({
          errorMessage: err.response.data.error,
          errorMessageModal: true
        });
      });
  }

  // Getting all data from the backend
  _refreshResources() {
    axios.get("http://localhost:8080/api/resources").then(res => {
      this.setState({
        resources: res.data.data
      });
    });
    axios.get("http://localhost:8080/api/reservations").then(res => {
      this.setState({
        reservations: res.data.data
      });
    });
  }

  render() {
    // Generating the HTML code for the resources
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

    // Generating the HTML code for the reservations
    let reservations = this.state.reservations.map(reservation => {
      return (
        <tr key={reservation.reservation_id}>
          <td>{reservation.reservation_id}</td>
          <td>
            {new Intl.DateTimeFormat("en-GB", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            }).format(reservation.start_date)}
          </td>
          <td>
            {new Intl.DateTimeFormat("en-GB", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            }).format(reservation.end_date)}
          </td>
          <td>{reservation.resource_id}</td>
          <td>{reservation.owner_email}</td>
          <td>{reservation.comments}</td>
          <td>
            <Button
              color="success"
              size="sm"
              className="mr-2"
              onClick={this.editReservation.bind(
                this,
                reservation.reservation_id,
                reservation.start_date,
                reservation.end_date,
                reservation.resource_id,
                reservation.owner_email,
                reservation.comments
              )}
            >
              Edit
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={this.deleteReservation.bind(
                this,
                reservation.reservation_id
              )}
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
        <Button
          className="my-3"
          color="primary"
          onClick={this.toggleNewReservationModal.bind(this)}
        >
          Add a new Reservation
        </Button>
        <Modal
          style={{ opacity: 1 }}
          isOpen={this.state.newReservationModal}
          toggle={this.toggleNewReservationModal.bind(this)}
        >
          <Form onSubmit={this.addReservation.bind(this)}>
            <ModalHeader toggle={this.toggleNewReservationModal.bind(this)}>
              Add a new Reservation
            </ModalHeader>
            <ModalBody>
              <Table>
                <tbody>
                  <tr>
                    <td>
                      <Label for="start_date">Start Date</Label>
                      <DatePicker
                        selected={this.state.newReservationData.start_date}
                        onChange={e => {
                          let { newReservationData } = this.state;

                          newReservationData.start_date = new Date(e).getTime();

                          this.setState({ newReservationData });
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy HH:mm"
                      />
                    </td>

                    <td>
                      <Label for="end_date">End Date</Label>
                      <DatePicker
                        selected={this.state.newReservationData.end_date}
                        onChange={e => {
                          let { newReservationData } = this.state;

                          newReservationData.end_date = new Date(e).getTime();

                          this.setState({ newReservationData });
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy HH:mm"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
              <Label for="resource_id">Resource id</Label>
              <Input
                id="resource_id"
                value={this.state.newReservationData.resource_id}
                onChange={e => {
                  let { newReservationData } = this.state;

                  newReservationData.resource_id = e.target.value;

                  this.setState({ newReservationData });
                }}
                placeholder="insert resource id here"
              />
              <Label for="owner_email">Owner email</Label>
              <Input
                id="owner_email"
                value={this.state.newReservationData.owner_email}
                onChange={e => {
                  let { newReservationData } = this.state;

                  newReservationData.owner_email = e.target.value;

                  this.setState({ newReservationData });
                }}
                placeholder="insert owner email here"
              />
              <Label for="comments">Comments</Label>
              <Input
                id="comments"
                value={this.state.newReservationData.comments}
                onChange={e => {
                  let { newReservationData } = this.state;

                  newReservationData.comments = e.target.value;

                  this.setState({ newReservationData });
                }}
                placeholder="insert comments here"
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
                Add Reservation
              </Button>{" "}
              <Button
                color="secondary"
                onClick={this.toggleNewReservationModal.bind(this)}
              >
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
        <Modal
          style={{ opacity: 1 }}
          isOpen={this.state.editReservationModal}
          toggle={this.toggleEditReservationModal.bind(this)}
        >
          <Form onSubmit={this.updateReservation.bind(this)}>
            <ModalHeader toggle={this.toggleEditReservationModal.bind(this)}>
              Edit Reservation
            </ModalHeader>
            <ModalBody>
              <Table>
                <tbody>
                  <tr>
                    <td>
                      <Label for="start_date">Start Date</Label>
                      <DatePicker
                        selected={this.state.editReservationData.start_date}
                        onChange={e => {
                          let { editReservationData } = this.state;

                          editReservationData.start_date = new Date(
                            e
                          ).getTime();

                          this.setState({ editReservationData });
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy HH:mm"
                      />
                    </td>

                    <td>
                      <Label for="end_date">End Date</Label>
                      <DatePicker
                        selected={this.state.editReservationData.end_date}
                        onChange={e => {
                          let { editReservationData } = this.state;

                          editReservationData.end_date = new Date(e).getTime();

                          this.setState({ editReservationData });
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy HH:mm"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
              <Label for="resource_id">Resource id</Label>
              <Input
                id="resource_id"
                value={this.state.editReservationData.resource_id}
                onChange={e => {
                  let { editReservationData } = this.state;

                  editReservationData.resource_id = e.target.value;

                  this.setState({ editReservationData });
                }}
              />
              <Label for="owner_email">Owner email</Label>
              <Input
                id="owner_email"
                value={this.state.editReservationData.owner_email}
                onChange={e => {
                  let { editReservationData } = this.state;

                  editReservationData.owner_email = e.target.value;

                  this.setState({ editReservationData });
                }}
              />
              <Label for="comments">Comments</Label>
              <Input
                id="comments"
                value={this.state.editReservationData.comments}
                onChange={e => {
                  let { editReservationData } = this.state;

                  editReservationData.comments = e.target.value;

                  this.setState({ editReservationData });
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
              <Button color="primary">Update Reservation</Button>{" "}
              <Button
                color="secondary"
                onClick={this.toggleEditReservationModal.bind(this)}
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
              <th>Start date</th>
              <th>End date</th>
              <th>Res id</th>
              <th>Owner email</th>
              <th>Comments</th>
            </tr>
          </thead>

          <tbody>{reservations}</tbody>
        </Table>
      </div>
    );
  }
}

export default App;
