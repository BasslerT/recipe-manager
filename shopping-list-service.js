const express = require('express');
const app = express();
app.use(express.json());

// Temporary memory storage for shopping lists
let shoppingLists = {};

// GENERATE a shopping list from an array of recipes
app.post('/shopping-list', (req, res) => {
    const { recipes } = req.body;

    // Safety for no recipes
    if (!recipes || recipes.length === 0) {
        return res.status(400).json({
            message: 'At least one recipe is required'
        });
    }

    // Collect all ingredients from selected recipes
    let ingredients = [];
    recipes.forEach(recipe => {
        if (recipe.ingredients) {
            let lines = recipe.ingredients.split('\n');
            lines.forEach(line => {
                if (line.trim() !== '') {
                    ingredients.push(line.trim());
                }
            });
        }
    });

    // Remove duplicates
    let unique = [...new Set(ingredients)];

    // Store the list
    let listId = String(Date.now());
    shoppingLists[listId] = {
        listId,
        items: unique
    };

    res.json({
        message: 'Shopping list generated successfully',
        listId: listId,
        items: unique
    });
});

// GET a shopping list by ID
app.get('/shopping-list/:listId', (req, res) => {
    const list = shoppingLists[req.params.listId];

    // Safety for no list
    if (!list) {
        return res.status(404).json({
            message: 'Shopping list not found'
        });
    }

    res.json(list);
});

// DELETE a shopping list
app.delete('/shopping-list/:listId', (req, res) => {
    delete shoppingLists[req.params.listId];
    res.json({
        message: 'Shopping list deleted successfully'
    });
});

// Port
app.listen(3003, () => {
    console.log('Shopping list microservice running on port 3003');
});




async function testMicroservice() {
    // GENERATE a shopping list
    const response = await fetch('http://localhost:3003/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipes: [
                {
                    name: 'Spaghetti',
                    ingredients: '1 box spaghetti noodles\n1 lb ground beef\n1 jar tomato sauce'
                },
                {
                    name: 'Banana Pancakes',
                    ingredients: '2 bananas\n2 eggs\n1/2 cup flour'
                }
            ]
        })
    });
    const data = await response.json();
    console.log('Shopping list generated:');
    console.log(data);

    // GET the shopping list
    const getResponse = await fetch('http://localhost:3003/shopping-list/' + data.listId);
    const getData = await getResponse.json();
    console.log('Retrieved shopping list:');
    console.log(getData);

    // DELETE the shopping list
    await fetch('http://localhost:3003/shopping-list/' + data.listId, { method: 'DELETE' });
    console.log('Shopping list deleted');
}

testMicroservice();
