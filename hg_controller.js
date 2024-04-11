import { IngredientSet, Matchup } from "./hg_model.js";

export class HungerGamesController {

    #model
    #view

    #matchup_schedule
    #next_match_idx

    constructor (model) {
        this.#model = model;
        this.#view = null;
    }

    connectView(view) {
        this.#view = view;
    }

    makeSet(set_name, ing_a, ing_b, ing_c) {
        set_name = set_name.trim();
        ing_a = ing_a.trim();
        ing_b = ing_b.trim();
        ing_c = ing_c.trim();

        if (set_name == "" || ing_a == "" || ing_b == "" || ing_c == "") {
            return false;
        }

        if (this.#model.getSets().find(s => s.name == set_name)) {
            return false;
        }

        let ing_set = new IngredientSet(set_name, [ing_a, ing_b, ing_c]);
        this.#model.addSet(ing_set);
        return true;
    }

    removeSet(s) {
        this.#model.removeSet(s);
    }

    startMatchups() {
        let schedule = []

        this.#model.getSets().forEach(sa => {
            this.#model.getSets().forEach(sb => {
                if (sa != sb) {
                    schedule.push([sa, sb]);
                }
            })
        });

        this.#matchup_schedule = schedule.map(m => [m, Math.random()])
                                         .sort((a,b) => a[1] - b[1])
                                         .map(mr => mr[0]);
        this.#next_match_idx = 0;

        this.#view.showMatchup(this.#matchup_schedule[this.#next_match_idx][0],
                               this.#matchup_schedule[this.#next_match_idx][1]);
    }

    recordAndAdvance({a, b, recipe_a, recipe_b, twin, mwin}) {

        let matchup = new Matchup(a, b, recipe_a, recipe_b, twin, mwin);
        this.#model.recordMatchup(matchup);

        this.#next_match_idx += 1;
        if (this.#next_match_idx < this.#matchup_schedule.length) {
            this.#view.showMatchup(this.#matchup_schedule[this.#next_match_idx][0],
                                   this.#matchup_schedule[this.#next_match_idx][1]);
        } else {
            this.#view.showStandings();
        }
    }
}