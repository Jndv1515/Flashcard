const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/flashcardApp')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection Error:', err));

const stackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cards: [{ front: String, back: String }]
});
const Stack = mongoose.model('Stack', stackSchema);

app.get('/api/stacks', async (req, res) => {
  try { res.json(await Stack.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stacks/:id', async (req, res) => {
  try { res.json(await Stack.findById(req.params.id)); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stacks', async (req, res) => {
  try {
    const newStack = new Stack({ name: req.body.name, cards: [] });
    await newStack.save();
    res.status(201).json(newStack);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/stacks/:id/cards', async (req, res) => {
  try {
    const stack = await Stack.findById(req.params.id);
    stack.cards.push(req.body);
    await stack.save();
    res.status(201).json(stack);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/stacks/:id', async (req, res) => {
  try {
    const updated = await Stack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/stacks/:id', async (req, res) => {
  try {
    await Stack.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(3000, '0.0.0.0', () => console.log(`🚀 Server on 192.168.1.10:3000`));