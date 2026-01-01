// Inside your backend server.js or routes file
app.post('/api/stacks/:id/cards', async (req, res) => {
  try {
    const { id } = req.params;
    const { front, back } = req.body;

    // 1. Find the stack by ID
    const stack = await Stack.findById(id);
    
    if (!stack) {
      return res.status(404).json({ message: "Stack not found" });
    }

    // 2. Add the new card to the cards array
    stack.cards.push({ front, back });
    
    // 3. Save the updated stack
    await stack.save();
    
    res.status(201).json(stack);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not add card" });
  }
});