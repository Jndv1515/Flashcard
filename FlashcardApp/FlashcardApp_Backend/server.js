const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/flashcardApp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB Connection Error', err));

const stackSchema = new mongoose.Schema({
  name: String,
  cards: [{ front: String, back: String }]
});
const Stack = mongoose.model('Stack', stackSchema);

app.get('/api/stacks', async (req, res) => {
  const stacks = await Stack.find();
  res.json(stacks);
});

app.get('/api/stacks/:id', async (req, res) => {
  const stack = await Stack.findById(req.params.id);
  res.json(stack);
});

app.post('/api/stacks', async (req, res) => {
  const newStack = new Stack({ name: req.body.name, cards: [] });
  await newStack.save();
  res.status(201).json(newStack);
});

app.post('/api/stacks/:id/cards', async (req, res) => {
  const stack = await Stack.findById(req.params.id);
  stack.cards.push(req.body);
  await stack.save();
  res.status(201).json(stack);
});

app.put('/api/stacks/:id', async (req, res) => {
  const updated = await Stack.findByIdAndUpdate(
    req.params.id, 
    { cards: req.body.cards },
    { new: true }
  );
  res.json(updated);
});

app.delete('/api/stacks/:id', async (req, res) => {
  await Stack.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(3000, '0.0.0.0', () => console.log('Server on 192.168.1.10:3000'));