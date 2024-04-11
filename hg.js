import { HungerGamesModel } from "./hg_model.js";
import { HungerGamesController } from "./hg_controller.js";
import { HungerGamesView } from "./hg_view.js";

let hg_model = new HungerGamesModel();
let hg_controller = new HungerGamesController(hg_model);
let hg_view = new HungerGamesView(hg_model, hg_controller);
hg_controller.connectView(hg_view);

hg_controller.makeSet('Pigs at Sea', 'bacon', 'celery', 'shrimp');
hg_controller.makeSet('Gobble, Gobble', 'turkey', 'apple', 'walnut');
hg_controller.makeSet('Mr. Peanut', 'pork', 'beans', 'peanut');
