export class HungerGamesView {

    #model
    #controller
    
    constructor (model, controller) {
        this.#model = model;
        this.#controller = controller;

        this.#setupLineupEditor();
        this.#setupMatchup();

        this.showLineupEditor();
    }

    hideAll() {
        document.querySelectorAll('body > div').forEach(top_ui_div => top_ui_div.style.display = 'none');
    }

    #setupLineupEditor() {
        let make_set_btn = document.getElementById('btn_make_set');
        let set_name = document.querySelector('#lineup_editor input[name="set_name"]');
        let ing_a = document.querySelector('#lineup_editor input[name="ing_a"]');
        let ing_b = document.querySelector('#lineup_editor input[name="ing_b"]');
        let ing_c = document.querySelector('#lineup_editor input[name="ing_c"]');

        make_set_btn.addEventListener('click', () => {
            if (this.#controller.makeSet(set_name.value, ing_a.value, ing_b.value, ing_c.value)) {
                set_name.value = "";
                ing_a.value = "";
                ing_b.value = "";
                ing_c.value = "";
            }
        });

        this.#model.addEventListener('lineup_update', () => {
            let lineup_table_body = document.querySelector('#lineup_table tbody');
            lineup_table_body.querySelectorAll('.listing').forEach(l => l.remove());

            this.#model.getSets().forEach(s => {                
                let set_tr = document.createElement('tr');
                set_tr.classList.add('listing');

                let i = s.ingredients;
                set_tr.innerHTML = `<td>${s.name}</td><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td><button>Remove/Edit</button></td>`;

                let re_btn = set_tr.querySelector('button');
                re_btn.addEventListener('click', () => {
                    this.#controller.removeSet(s);
                    set_name.value = s.name;
                    ing_a.value = i[0];
                    ing_b.value = i[1];
                    ing_c.value = i[2];
                });

                lineup_table_body.append(set_tr);
            });
        });

        let start_matchups_btn = document.querySelector('#btn_start_matchups');
        start_matchups_btn.addEventListener('click', () => {
            this.#controller.startMatchups();
        });
    }

    showLineupEditor () {
        this.hideAll();
        let editor_ui = document.getElementById('lineup_editor');
        editor_ui.style.display = '';
    }

    #setupMatchup () {
        let matchup_ui = document.getElementById('matchup');

        let cycle_win = (a_or_b, taste_or_make) => {
            let clicked = matchup_ui.querySelector(`#${a_or_b}_${taste_or_make}`);
            let other = matchup_ui.querySelector(`#${a_or_b == 'a' ? 'b' : 'a'}_${taste_or_make}`);

            if (clicked.className == 'tie') {
                clicked.className = 'win';
                other.className = 'lose';
            } else if (clicked.className == 'lose') {
                clicked.className = 'tie';
                other.className = 'tie';
            }
        }

        matchup_ui.querySelector('#a_taste').addEventListener('click', (e) => cycle_win('a', 'taste'));
        matchup_ui.querySelector('#b_taste').addEventListener('click', (e) => cycle_win('b', 'taste'));
        matchup_ui.querySelector('#a_make').addEventListener('click', (e) => cycle_win('a', 'make'));
        matchup_ui.querySelector('#b_make').addEventListener('click', (e) => cycle_win('b', 'make'));

        matchup_ui.querySelector('#record_and_advance').addEventListener('click', () => {

            let a_taste_status = matchup_ui.querySelector('#a_taste').className;
            let a_make_status = matchup_ui.querySelector('#a_make').className;

            if (a_taste_status == 'win') {
                matchup_ui.current_matchup.twin = matchup_ui.current_matchup.a;
            } else if (a_taste_status == 'lose') {
                matchup_ui.current_matchup.twin = matchup_ui.current_matchup.b;
            } else {
                matchup_ui.current_matchup.twin = null;
            }

            if (a_make_status == 'win') {
                matchup_ui.current_matchup.mwin = matchup_ui.current_matchup.a;
            } else if (a_make_status == 'lose') {
                matchup_ui.current_matchup.mwin = matchup_ui.current_matchup.b;
            } else {
                matchup_ui.current_matchup.mwin = null;
            }

            this.#controller.recordAndAdvance(matchup_ui.current_matchup);
        });
    }

    async showMatchup(set_a, set_b) {
        this.hideAll();
        let matchup_ui = document.getElementById('matchup');

        matchup_ui.querySelector('#matchup_set_a').innerHTML = set_a.name;
        matchup_ui.querySelector('#matchup_set_b').innerHTML = set_b.name;

        let recipe_a = await set_a.getRandomRecipe();
        let recipe_b = await set_b.getRandomRecipe();

        matchup_ui.querySelector('#matchup_a_title').innerHTML = recipe_a.title;
        matchup_ui.querySelector('#matchup_b_title').innerHTML = recipe_b.title;

        matchup_ui.querySelector('#matchup_a_img').src = recipe_a.image;
        matchup_ui.querySelector('#matchup_b_img').src = recipe_b.image;

        matchup_ui.querySelector('#a_taste').className = 'tie';
        matchup_ui.querySelector('#b_taste').className = 'tie';
        matchup_ui.querySelector('#a_make').className = 'tie';
        matchup_ui.querySelector('#b_make').className = 'tie';

        matchup_ui.current_matchup = {
            a: set_a,
            recipe_a: recipe_a,
            b: set_b,
            recipe_b: recipe_b
        };

        matchup_ui.style.display = '';
    }

    showStandings() {
        this.hideAll();

        let standings_ui = document.getElementById('standings');

        let sets = this.#model.getSets()
                             
        let make_standings = document.querySelector('#make_standings_table tbody');
        sets.sort((a,b) => (b.makeWins*3+b.makeDraws) - (a.makeWins*3+a.makeDraws))
            .forEach(s => {
                make_standings.insertAdjacentHTML('beforeend', `<tr><td>${s.name}</td><td>${s.makeWins}</td><td>${s.makeLosses}</td><td>${s.makeDraws}</td></tr>`);
            });


        let taste_standings = document.querySelector('#taste_standings_table tbody');
        sets.sort((a,b) => (b.tasteWins*3+b.tasteDraws) - (a.tasteWins*3+a.tasteDraws))
            .forEach(s => {
                taste_standings.insertAdjacentHTML('beforeend', `<tr><td>${s.name}</td><td>${s.tasteWins}</td><td>${s.tasteLosses}</td><td>${s.tasteDraws}</td></tr>`);
            });
    
        standings_ui.style.display = '';
    }
}