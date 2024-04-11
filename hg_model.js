
// To get an API key, go to https://spoonacular.com/food-api/
let apiKey = "";

export class Recipe {

    #data

    constructor(data) {
        this.#data = data;
    }

    static async getByID(id) {
        let response = await fetch('https://api.spoonacular.com/recipes/' + 
                                id + '/information?' +
                                '&apiKey=' + apiKey);


        let recipe_data = await response.json();
        return new Recipe(recipe_data);
    }

    get title () {return this.#data.title;};

    get image () {return this.#data.image;};

}

export class IngredientSet {
    #name
    #ingredients
    #matchups

    constructor(name, ingredients) {
        this.#name = name;
        this.#ingredients = [...ingredients];
        this.#matchups = [];
    }

    get name () {return this.#name};
    get ingredients () {return [...this.#ingredients]};

    get tasteWins () {return this.#matchups.reduce((count, match) => count += (match.tasteWinner == this) ? 1 : 0, 0);}
    get tasteDraws () {return this.#matchups.reduce((count, match) => count += (match.tasteWinner == null) ? 1 : 0, 0);}
    get tasteLosses () {return this.matchCount - this.tasteWins - this.tasteDraws;}

    get makeWins () {return this.#matchups.reduce((count, match) => count += (match.makeWinner == this) ? 1 : 0, 0);}
    get makeDraws () {return this.#matchups.reduce((count, match) => count += (match.makeWinner == null) ? 1 : 0, 0);}
    get makeLosses () {return this.matchCount - this.makeWins - this.makeDraws;}

    get matchCount () {return this.#matchups.length;}

    addMatchup (m) {
        this.#matchups.push(m);
    }

    async getRandomRecipe () {
        let response = await fetch('https://api.spoonacular.com/recipes/findByIngredients?' +
        'ingredients=' + this.#ingredients.join(',') + 
        '&apiKey=' + apiKey);
        let candidates = await response.json();

        return await Recipe.getByID(candidates[Math.floor(Math.random() * candidates.length)].id);
    }
}

export class Matchup {
    #set_a
    #set_b

    #recipe_a
    #recipe_b

    #taste_winner
    #make_winner

    constructor(set_a, set_b, recipe_a, recipe_b, twin, mwin) {
        // twin and mwin must be one of: a, b, or null
        this.#set_a = set_a;
        this.#set_b = set_b;
        this.#recipe_a = recipe_a;
        this.#recipe_b = recipe_b;
        this.#taste_winner = twin;
        this.#make_winner = mwin;
    }

    get setA () {return this.#set_a;}
    get setB () {return this.#set_b;}

    get recipeA () {return this.#recipe_a;}
    get recipeB () {return this.#recipe_b;}

    get tasteWinner () {return this.#taste_winner;}
    get makeWinner () {return this.#make_winner;}

}

export class HungerGamesModel extends EventTarget {
    
    #ingredient_sets

    constructor () {
        super();
        this.#ingredient_sets = [];
    }

    addSet (set) {
        this.#ingredient_sets.push(set);
        this.dispatchEvent(new Event('lineup_update'));
    }

    removeSet (set) {
        this.#ingredient_sets = this.#ingredient_sets.filter(s => s != set);
        this.dispatchEvent(new Event('lineup_update'));
    }

    replaceSet (old_set, new_set) {
        this.#ingredient_sets = this.#ingredient_sets.filter(s => s != old_set).push(new_set);
        this.dispatchEvent(new Event('lineup_update'));
    }

    getSets () {return [...this.#ingredient_sets]};

    recordMatchup (m) {
        m.setA.addMatchup(m);
        m.setB.addMatchup(m);
        this.dispatchEvent(new Event('match_update'));
    }
}