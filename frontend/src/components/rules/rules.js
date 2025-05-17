import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";

const Rules = () => {
  const [rules, setRules] = useState([]);
  const [newCondition, setNewCondition] = useState("");
  const [newAction, setNewAction] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddRule = () => {
    if (!newCondition || !newAction) return;

    if (editingIndex !== null) {
      const updated = [...rules];
      updated[editingIndex] = { condition: newCondition, action: newAction };
      setRules(updated);
      setEditingIndex(null);
    } else {
      setRules([...rules, { condition: newCondition, action: newAction }]);
    }

    setNewCondition("");
    setNewAction("");
  };

  const handleDeleteRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleEditRule = (index) => {
    setNewCondition(rules[index].condition);
    setNewAction(rules[index].action);
    setEditingIndex(index);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Reguły automatyzacji
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Warunek"
            placeholder="np. temperatura > 25"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Akcja"
            placeholder="np. Włącz klimatyzację"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddRule}
            startIcon={<Add />}
            sx={{ height: "100%" }}
          >
            {editingIndex !== null ? "Zapisz" : "Dodaj"}
          </Button>
        </Grid>
      </Grid>

      {rules.map((rule, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={5}>
                <Typography variant="subtitle1">
                  <strong>Warunek:</strong> {rule.condition}
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="subtitle1">
                  <strong>Akcja:</strong> {rule.action}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleEditRule(index)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeleteRule(index)}>
                  <Delete color="error" />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Paper>
  );
};

export default Rules;
