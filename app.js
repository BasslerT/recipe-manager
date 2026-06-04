// ====================================
// RECIPE STORAGE
// ====================================
// This array holds all our recipes. Each recipe is an object with properties.
let recipes = [
    {
        id: 1,
        name: "Spaghetti",
        category: "Dinner",
        ingredients: "1 box of spaghetti noodles\n1 lb ground beef\n1 jar tomato sauce\nFresh basil\nSalt and pepper\nParmesan cheese",
        instructions: "Cook spaghetti noodles following package directions.\nCook ground beef.\nDrain water from noodles.\nAdd sauce to beef and simmer.\nCombine and serve."
    },
    {
        id: 2,
        name: "Chocolate Chip Cookies",
        category: "Dessert",
        ingredients: "2 1/4 cups flour\n1 tsp baking soda\n1 cup butter\n3/4 cup sugar\n2 eggs\n2 cups chocolate chips",
        instructions: "Preheat oven to 375°F.\nMix dry ingredients.\nCream butter and sugar.\nAdd eggs.\nMix in flour.\nAdd chocolate chips.\nBake 9-11 minutes."
    },
    {
        id: 3,
        name: "Banana Pancakes",
        category: "Breakfast",
        ingredients: "2 bananas\n2 eggs\n1/2 cup flour\n1/2 tsp baking powder\nPinch of salt\nMaple syrup",
        instructions: "Mash bananas.\nAdd eggs and mix.\nAdd flour, baking powder, salt.\nCook in buttered pan.\nFlip when bubbles form.\nServe with syrup."
    }
];

// This number will be used for new recipe IDs
let nextId = 4;

// This remembers which recipe we're currently viewing (for deletion)
let currentRecipeId = null;

// ====================================
// START THE APP
// ====================================
// When the page loads, show all the recipes
showRecipeList();

// Seed search index with default recipes on load
recipes.forEach(function(recipe) {
    fetch("http://localhost:3001/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: recipe.id,
            name: recipe.name,
            category: recipe.category
        })
    });
});

// ====================================
// BROWSER BACK BUTTON SUPPORT
// ====================================
// This listens for the browser back/forward button
window.onpopstate = function(event) {
    if (event.state) {
        // event.state tells us which view to show
        if (event.state.view === 'list') {
            showRecipeList();
        } else if (event.state.view === 'add') {
            showAddRecipeForm();
        } else if (event.state.view === 'detail') {
            showRecipeDetail(event.state.recipeId);
        }
    } else {
        // No state = go to list
        showRecipeList();
    }
};

// ====================================
// FUNCTION 1: SHOW RECIPE LIST
// ====================================
function showRecipeList() {
    // Hide all views
    document.getElementById('listView').style.display = 'block';
    document.getElementById('addView').style.display = 'none';
    document.getElementById('viewRecipe').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    
    // Add to browser history (makes back button work)
    history.pushState({view: 'list'}, '', '#list');
    
    // Clear the grid
    let grid = document.getElementById('recipeGrid');
    grid.innerHTML = '';
    
    // If no recipes, show message
    if (recipes.length === 0) {
        grid.innerHTML = '<div class="empty-state">No recipes yet! Click "+ Add Recipe" to get started.</div>';
        return;
    }
    
    // Loop through each recipe and create a card
    for (let i = 0; i < recipes.length; i++) {
        let recipe = recipes[i];
        
        // Create the card HTML
        let card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = '<h3>' + recipe.name + '</h3><div class="recipe-card-hint">-Click to view-</div>';
        
        // When clicked, show this recipe's details
        card.onclick = function() {
            showRecipeDetail(recipe.id);
        };
        
        // Add card to grid
        grid.appendChild(card);
    }
}

// ====================================
// FUNCTION 2: SHOW ADD RECIPE FORM
// ====================================
function showAddRecipeForm() {
    // Hide list, show form
    document.getElementById('listView').style.display = 'none';
    document.getElementById('addView').style.display = 'block';
    document.getElementById('backButton').style.display = 'block';
    
    // Add to browser history (makes back button work)
    history.pushState({view: 'add'}, '', '#add');
    
    // Clear form fields
    document.getElementById('nameInput').value = '';
    document.getElementById('categorySelect').value = 'Breakfast';
    document.getElementById('ingredientsInput').value = '';
    document.getElementById('instructionsInput').value = '';
    document.getElementById('errorBox').style.display = 'none';
}

document.getElementById('showAddBtn').onclick = function() {
    showAddRecipeForm();
};

// ====================================
// FUNCTION 3: SAVE NEW RECIPE
// ====================================
document.getElementById('saveBtn').onclick = function() {
    // Get values from form
    let name = document.getElementById('nameInput').value.trim();
    let category = document.getElementById('categorySelect').value;
    let ingredients = document.getElementById('ingredientsInput').value.trim();
    let instructions = document.getElementById('instructionsInput').value.trim();
    
    // CHECK: Is name empty?
    if (name === '') {
        document.getElementById('errorBox').textContent = 'Recipe name is required';
        document.getElementById('errorBox').style.display = 'block';
        return; // Stop here
    }
    
    // CHECK: Are ingredients empty?
    if (ingredients === '') {
        document.getElementById('errorBox').textContent = 'Ingredients are required';
        document.getElementById('errorBox').style.display = 'block';
        return; // Stop here
    }
    
    // CHECK: Are instructions empty?
    if (instructions === '') {
        document.getElementById('errorBox').textContent = 'Instructions are required';
        document.getElementById('errorBox').style.display = 'block';
        return; // Stop here
    }
    
    // Everything is valid! Create new recipe object
    let newRecipe = {
        id: nextId,
        name: name,
        category: category,
        ingredients: ingredients,
        instructions: instructions
    };
    
    // Add to recipes array
    recipes.push(newRecipe);

    // Add new recipe to search index
	fetch("http://localhost:3001/item", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: newRecipe.id,
			name: newRecipe.name,
			category: newRecipe.category
		})
	});
    
    // Increment ID for next recipe
    nextId = nextId + 1;
    
    // Go back to list
    showRecipeList();
};

// ====================================
// FUNCTION 4: CANCEL BUTTON
// ====================================
document.getElementById('cancelBtn').onclick = function() {
    showRecipeList();
};

// ====================================
// FUNCTION 5: BACK BUTTON
// ====================================
document.getElementById('backButton').onclick = function() {
    showRecipeList();
};

// ====================================
// FUNCTION 6: SHOW RECIPE DETAILS
// ====================================
function showRecipeDetail(recipeId) {
    // Find the recipe with this ID
    let recipe = null;
    for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].id === recipeId) {
            recipe = recipes[i];
            break;
        }
    }
    
    // If not found, go back to list
    if (recipe === null) {
        showRecipeList();
        return;
    }
    
    // Remember which recipe we're viewing
    currentRecipeId = recipeId;
    
    // Show the view recipe page
    document.getElementById('listView').style.display = 'none';
    document.getElementById('addView').style.display = 'none';
    document.getElementById('viewRecipe').style.display = 'block';
    document.getElementById('backButton').style.display = 'block';
    
    // Add to browser history (makes back button work)
    history.pushState({view: 'detail', recipeId: recipeId}, '', '#recipe-' + recipeId);
    
    // Fill in the details
    document.getElementById('viewTitle').textContent = recipe.name;
    document.getElementById('viewCategory').textContent = 'Category: ' + recipe.category;
    document.getElementById('viewIngredients').textContent = recipe.ingredients;
    document.getElementById('viewInstructions').textContent = recipe.instructions;
}

// ====================================
// FUNCTION 7: SUBMIT RATING
// ====================================
document.getElementById('submitRatingBtn').onclick = function() {
    let rating = document.getElementById('ratingSelect').value;
    let resultBox = document.getElementById('ratingResult');

    // CHECK: did they select a rating?
    if (rating === '') {
        resultBox.textContent = 'Please select a rating.';
        return;
    }

    // SUBMIT rating to rating service
    fetch('http://localhost:3000/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 1,
            itemId: currentRecipeId,
            rating: parseInt(rating)
        })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        // GET updated average after submitting
        return fetch('http://localhost:3000/ratings/average/' + currentRecipeId);
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        resultBox.textContent = 'Average: ' + data.average + '/5 (' + data.count + ' ratings)';
    })
    .catch(function() {
        resultBox.textContent = 'Could not connect to rating service.';
    });
};

// ====================================
// FUNCTION 8: DELETE BUTTON CLICKED
// ====================================
document.getElementById('deleteBtn').onclick = function() {
    // Find the recipe name
    let recipe = null;
    for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].id === currentRecipeId) {
            recipe = recipes[i];
            break;
        }
    }
    
    // Show the recipe name in modal
    document.getElementById('deleteName').textContent = recipe.name;
    
    // Show modal
    document.getElementById('deleteModal').style.display = 'flex';
};

// ====================================
// FUNCTION 9: CANCEL DELETE
// ====================================
document.getElementById('cancelDeleteBtn').onclick = function() {
    // Just hide the modal
    document.getElementById('deleteModal').style.display = 'none';
};

// ====================================
// FUNCTION 10: CONFIRM DELETE
// ====================================
document.getElementById('confirmDeleteBtn').onclick = function() {
    // Create a new array WITHOUT the deleted recipe
    let newRecipes = [];
    for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].id !== currentRecipeId) {
            newRecipes.push(recipes[i]);
        }
    }
    
    // Replace old recipes with new array
    recipes = newRecipes;
    
    // Hide modal
    document.getElementById('deleteModal').style.display = 'none';
    
    // Go back to list
    showRecipeList();
};
