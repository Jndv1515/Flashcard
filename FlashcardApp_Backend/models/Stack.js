app.post('/api/stacks/:id/cards', async (req, res) => {
  try {
    const { id } = req.params;
    const { front, back } = req.body;


    const stack = await Stack.findById(id);
    
    if (!stack) {
      return res.status(404).json({ message: "Stack not found" });
    }

    stack.cards.push({ front, back });
    
    await stack.save();
    
    res.status(201).json(stack);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not add card" });
  }
});