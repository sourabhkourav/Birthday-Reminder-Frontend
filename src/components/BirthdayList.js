import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

// Function to calculate remaining days
function calculateRemainingDays(day, month) {
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  let nextBirthday = new Date(currentYear, month - 1, day);

  // If the birthday has already passed this year, set it for the next year
  if (nextBirthday < currentDate) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  const timeDifference = nextBirthday - currentDate;

  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

function BirthdayList() {
  const [persons, setPersons] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", day: "", month: "" });
  const [personToEdit, setPersonToEdit] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.1.3:8080/api/persons/all") // Replace with correct API URL if needed
      .then((response) => {
        const sortedPersons = response.data
          .map((person) => ({
            ...person,
            remainingDays: calculateRemainingDays(person.day, person.month),
          }))
          .sort((a, b) => a.remainingDays - b.remainingDays);
        setPersons(sortedPersons);
      })
      .catch((error) => {
        setError("Error fetching data");
      });
  }, []);

  const handleAddPerson = () => {
    if (!newPerson.name || !newPerson.day || !newPerson.month) {
      alert("Please fill in all fields.");
      return;
    }

    axios
      .post("http://192.168.1.3:8080/api/persons/add", newPerson) // Replace with your actual API URL to post new data
      .then((response) => {
        const updatedPersons = [...persons, response.data];
        const sortedPersons = updatedPersons
          .map((person) => ({
            ...person,
            remainingDays: calculateRemainingDays(person.day, person.month),
          }))
          .sort((a, b) => a.remainingDays - b.remainingDays);

        setPersons(sortedPersons);
        setOpenDialog(false); // Close the dialog
        setNewPerson({ name: "", day: "", month: "" }); // Reset form
      })
      .catch((error) => {
        setError("Error adding person");
      });
  };

  const handleEditPerson = () => {
    if (!personToEdit.name || !personToEdit.day || !personToEdit.month) {
      alert("Please fill in all fields.");
      return;
    }

    axios
      .put(
        `http://192.168.1.3:8080/api/persons/${personToEdit.id}`,
        personToEdit
      ) // Replace with your actual API URL to update data
      .then((response) => {
        const updatedPersons = persons.map((person) =>
          person.id === personToEdit.id ? response.data : person
        );
        const sortedPersons = updatedPersons
          .map((person) => ({
            ...person,
            remainingDays: calculateRemainingDays(person.day, person.month),
          }))
          .sort((a, b) => a.remainingDays - b.remainingDays);

        setPersons(sortedPersons);
        setOpenEditDialog(false); // Close the dialog
        setPersonToEdit(null); // Reset the personToEdit state
      })
      .catch((error) => {
        setError("Error updating person");
      });
  };

  const handleDeletePerson = (id) => {
    axios
      .delete(`http://192.168.1.3:8080/api/persons/${id}`) // Replace with your actual API URL to delete data
      .then(() => {
        setPersons(persons.filter((person) => person.id !== id));
      })
      .catch((error) => {
        setError("Error deleting person");
      });
  };

  return (
    <Container>
      {error && (
        <Typography color="error" align="center" gutterBottom>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: "20px" }}
      >
        Add New Person
      </Button>

      <Grid container spacing={3} justifyContent="center">
        {persons.map((person) => (
          <Grid item xs={12} sm={6} md={4} key={person.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{person.name}</Typography>
                <Typography variant="body1">
                  Birthday: {person.day}/{person.month}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {person.remainingDays} day
                  {person.remainingDays !== 1 ? "s" : ""} until next birthday
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setPersonToEdit(person);
                      setOpenEditDialog(true);
                    }}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeletePerson(person.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog to Add New Person */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Person</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={newPerson.name}
            onChange={(e) =>
              setNewPerson({ ...newPerson, name: e.target.value })
            }
            style={{ marginBottom: "15px" }}
          />
          <TextField
            label="Day"
            variant="outlined"
            type="number"
            fullWidth
            value={newPerson.day}
            onChange={(e) =>
              setNewPerson({ ...newPerson, day: e.target.value })
            }
            style={{ marginBottom: "15px" }}
          />
          <TextField
            label="Month"
            variant="outlined"
            type="number"
            fullWidth
            value={newPerson.month}
            onChange={(e) =>
              setNewPerson({ ...newPerson, month: e.target.value })
            }
            style={{ marginBottom: "15px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddPerson} color="primary">
            Add Person
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to Edit Person */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Person</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={personToEdit?.name || ""}
            onChange={(e) =>
              setPersonToEdit({ ...personToEdit, name: e.target.value })
            }
            style={{ marginBottom: "15px" }}
          />
          <TextField
            label="Day"
            variant="outlined"
            type="number"
            fullWidth
            value={personToEdit?.day || ""}
            onChange={(e) =>
              setPersonToEdit({ ...personToEdit, day: e.target.value })
            }
            style={{ marginBottom: "15px" }}
          />
          <TextField
            label="Month"
            variant="outlined"
            type="number"
            fullWidth
            value={personToEdit?.month || ""}
            onChange={(e) =>
              setPersonToEdit({ ...personToEdit, month: e.target.value })
            }
            style={{ marginBottom: "15px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditPerson} color="primary">
            Update Person
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BirthdayList;
