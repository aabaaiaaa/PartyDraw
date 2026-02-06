/**
 * Themed Questions
 * Contains drawing prompts organized by theme packs and genres.
 * Each question has appropriate tags for filtering.
 */

import { AgeRating, PartyPack, GenreTheme } from './themes';

/**
 * Question data structure for themed questions
 */
export interface ThemedQuestionData {
  text: string;
  ageRating?: AgeRating;
  partyPacks: PartyPack[];
  genres: GenreTheme[];
}

// ============ HALLOWEEN PACK ============
export const HALLOWEEN_QUESTIONS: ThemedQuestionData[] = [
  // Spooky creatures
  { text: 'A ghost trying to use a smartphone', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A vampire at a dentist appointment', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A werewolf at a hair salon', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A mummy unwrapping itself by accident', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A witch whose broom broke down', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A skeleton trying to gain weight', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A zombie at a job interview', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'], ageRating: 'teen' },
  { text: 'A friendly monster under the bed', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'Frankenstein learning to dance', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A bat wearing glasses', partyPacks: ['halloween'], genres: ['fantasy', 'nature'] },

  // Halloween activities
  { text: 'A pumpkin carving gone wrong', partyPacks: ['halloween'], genres: ['general'] },
  { text: 'Trick-or-treaters at a haunted house', partyPacks: ['halloween', 'kids_birthday'], genres: ['general'] },
  { text: 'A costume contest winner', partyPacks: ['halloween', 'kids_birthday'], genres: ['general'] },
  { text: 'A black cat crossing a ladder', partyPacks: ['halloween'], genres: ['nature'] },
  { text: 'Bobbing for apples with a twist', partyPacks: ['halloween', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A spooky scarecrow coming to life', partyPacks: ['halloween'], genres: ['fantasy', 'nature'] },
  { text: 'A haunted candy factory', partyPacks: ['halloween'], genres: ['food_cooking', 'fantasy'] },
  { text: 'A witch making a potion smoothie', partyPacks: ['halloween'], genres: ['fantasy', 'food_cooking'] },
  { text: 'Ghosts playing hide and seek', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A spiderweb decorating contest', partyPacks: ['halloween'], genres: ['nature'] },

  // Spooky scenarios
  { text: 'A creepy old mansion at midnight', partyPacks: ['halloween'], genres: ['general'] },
  { text: 'A graveyard dance party', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A monster movie night', partyPacks: ['halloween'], genres: ['pop_culture', 'fantasy'] },
  { text: 'A cauldron bubbling over', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A flying broomstick race', partyPacks: ['halloween'], genres: ['fantasy', 'sports'] },
  { text: 'A monster mash band', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A haunted rollercoaster', partyPacks: ['halloween'], genres: ['general'] },
  { text: 'Vampires at a blood drive', partyPacks: ['halloween'], genres: ['fantasy'], ageRating: 'teen' },
  { text: 'A werewolf howling at a disco ball', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'Ghosts having a tea party', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy', 'food_cooking'] },

  // Halloween costumes
  { text: 'A robot costume malfunction', partyPacks: ['halloween'], genres: ['scifi', 'pop_culture'] },
  { text: 'A superhero costume too tight', partyPacks: ['halloween'], genres: ['pop_culture'] },
  { text: 'A cat costume on a dog', partyPacks: ['halloween', 'kids_birthday'], genres: ['nature'] },
  { text: 'A princess fighting a dragon costume', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A pirate costume with a real parrot', partyPacks: ['halloween'], genres: ['nature'] },
  { text: 'Twins in a two-headed monster costume', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A wizard whose wand is a selfie stick', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A dinosaur costume at a tea party', partyPacks: ['halloween', 'kids_birthday'], genres: ['nature', 'food_cooking'] },
  { text: 'A ghost costume in the wind', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A clown costume that is actually scary', partyPacks: ['halloween'], genres: ['general'] },

  // Spooky food
  { text: 'A monster-shaped birthday cake', partyPacks: ['halloween', 'kids_birthday'], genres: ['food_cooking', 'fantasy'] },
  { text: 'Eyeball soup for dinner', partyPacks: ['halloween'], genres: ['food_cooking', 'fantasy'] },
  { text: 'A pumpkin pie eating contest', partyPacks: ['halloween'], genres: ['food_cooking', 'sports'] },
  { text: 'Candy corn mountains', partyPacks: ['halloween'], genres: ['food_cooking'] },
  { text: 'A spider cupcake display', partyPacks: ['halloween', 'kids_birthday'], genres: ['food_cooking', 'nature'] },
  { text: 'Witch finger cookies', partyPacks: ['halloween'], genres: ['food_cooking', 'fantasy'] },
  { text: 'A haunted gingerbread house', partyPacks: ['halloween', 'christmas'], genres: ['food_cooking', 'fantasy'] },
  { text: 'Mummy wrapped hot dogs', partyPacks: ['halloween', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A vampire drinking tomato juice', partyPacks: ['halloween'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A brain-shaped jello mold', partyPacks: ['halloween'], genres: ['food_cooking'], ageRating: 'teen' },

  // More creatures
  { text: 'A friendly swamp monster', partyPacks: ['halloween'], genres: ['fantasy', 'nature'] },
  { text: 'A headless horseman on a bicycle', partyPacks: ['halloween'], genres: ['fantasy', 'sports'] },
  { text: 'A dragon breathing birthday candle fire', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'An alien dressed as a human for Halloween', partyPacks: ['halloween'], genres: ['scifi', 'fantasy'] },
  { text: 'A giant spider knitting a web sweater', partyPacks: ['halloween'], genres: ['nature', 'fantasy'] },
  { text: 'A Cyclops trying on sunglasses', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A sea monster at a pool party', partyPacks: ['halloween', 'summer_bbq'], genres: ['fantasy', 'nature'] },
  { text: 'A tiny ghost in a big haunted house', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A poltergeist cleaning the house', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A goblin opening presents', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },

  // Spooky places
  { text: 'A haunted school classroom', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A monster hiding in a closet', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A creepy carnival at night', partyPacks: ['halloween'], genres: ['general'] },
  { text: 'A witch cottage in the woods', partyPacks: ['halloween'], genres: ['fantasy', 'nature'] },
  { text: 'A haunted library with flying books', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A spooky lighthouse in a storm', partyPacks: ['halloween'], genres: ['nature'] },
  { text: 'A monster truck driven by a monster', partyPacks: ['halloween'], genres: ['fantasy', 'sports'] },
  { text: 'A vampire castle with room service', partyPacks: ['halloween'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A zombie apocalypse ice cream shop', partyPacks: ['halloween'], genres: ['fantasy', 'food_cooking'], ageRating: 'teen' },
  { text: 'A haunted playground at dusk', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },

  // Halloween mishaps
  { text: 'A jack-o-lantern with braces', partyPacks: ['halloween', 'kids_birthday'], genres: ['general'] },
  { text: 'A scarecrow on vacation', partyPacks: ['halloween', 'summer_bbq'], genres: ['nature'] },
  { text: 'A ghost who is afraid of the dark', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A witch whose spell backfired', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A vampire who hates the color red', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A mummy who lost its wrappings', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A werewolf stuck in wolf form at work', partyPacks: ['halloween', 'office_party'], genres: ['fantasy'], ageRating: 'teen' },
  { text: 'A skeleton who wants to be a lifeguard', partyPacks: ['halloween', 'summer_bbq'], genres: ['fantasy', 'sports'] },
  { text: 'A bat who sleeps during the night', partyPacks: ['halloween'], genres: ['nature', 'fantasy'] },
  { text: 'A zombie who became a vegetarian', partyPacks: ['halloween'], genres: ['fantasy', 'food_cooking'], ageRating: 'teen' },

  // More Halloween fun
  { text: 'A monster photo booth', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy', 'pop_culture'] },
  { text: 'Ghosts playing musical chairs', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A werewolf at a barber shop', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'Dracula learning to cook garlic bread', partyPacks: ['halloween'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A haunted bounce house', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'Frankenstein at a therapy session', partyPacks: ['halloween'], genres: ['fantasy'], ageRating: 'teen' },
  { text: 'A monster under the stairs', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'Witches on a girls night out', partyPacks: ['halloween'], genres: ['fantasy'], ageRating: 'teen' },
  { text: 'A mummy running a marathon', partyPacks: ['halloween'], genres: ['fantasy', 'sports'] },
  { text: 'A vampire counting something other than blood', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy'] },

  // Final Halloween batch
  { text: 'A ghost writing its autobiography', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A monster talent show', partyPacks: ['halloween', 'kids_birthday'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A witch flying through a car wash', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'Zombies doing yoga', partyPacks: ['halloween'], genres: ['fantasy', 'sports'], ageRating: 'teen' },
  { text: 'A skeleton playing xylophone on itself', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A pumpkin patch coming to life', partyPacks: ['halloween'], genres: ['fantasy', 'nature'] },
  { text: 'Trick or treating in space', partyPacks: ['halloween'], genres: ['scifi', 'fantasy'] },
  { text: 'A werewolf at a full moon party', partyPacks: ['halloween'], genres: ['fantasy'] },
  { text: 'A vampire trying to take a selfie', partyPacks: ['halloween'], genres: ['fantasy', 'pop_culture'] },
  { text: 'Monster high school graduation', partyPacks: ['halloween'], genres: ['fantasy'] },
];

// ============ CHRISTMAS PACK ============
export const CHRISTMAS_QUESTIONS: ThemedQuestionData[] = [
  // Santa and elves
  { text: 'Santa stuck in the chimney', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Elves on a coffee break', partyPacks: ['christmas', 'office_party'], genres: ['food_cooking'] },
  { text: 'Rudolph with a cold', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'Mrs. Claus saving the day', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Santa learning to use GPS', partyPacks: ['christmas'], genres: ['pop_culture'] },
  { text: 'An elf assembly line chaos', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Reindeer on vacation at the beach', partyPacks: ['christmas', 'summer_bbq'], genres: ['nature'] },
  { text: 'Santa working out for the big night', partyPacks: ['christmas'], genres: ['sports'] },
  { text: 'Elves playing video games', partyPacks: ['christmas', 'kids_birthday'], genres: ['pop_culture'] },
  { text: 'Santa sleigh with a flat tire', partyPacks: ['christmas'], genres: ['general'] },

  // Winter activities
  { text: 'A snowman building a human', partyPacks: ['christmas'], genres: ['fantasy'] },
  { text: 'Penguins ice skating', partyPacks: ['christmas'], genres: ['nature', 'sports'] },
  { text: 'A snowball fight championship', partyPacks: ['christmas', 'kids_birthday'], genres: ['sports'] },
  { text: 'Building an igloo hotel', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Hot cocoa by a cozy fireplace', partyPacks: ['christmas'], genres: ['food_cooking'] },
  { text: 'Skiing down a giant candy cane', partyPacks: ['christmas'], genres: ['sports', 'food_cooking'] },
  { text: 'Ice fishing with a polar bear', partyPacks: ['christmas'], genres: ['nature', 'sports'] },
  { text: 'Making snow angels', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'A sledding race gone wrong', partyPacks: ['christmas', 'kids_birthday'], genres: ['sports'] },
  { text: 'Catching snowflakes on your tongue', partyPacks: ['christmas', 'kids_birthday'], genres: ['nature'] },

  // Christmas decorations
  { text: 'A Christmas tree taller than the house', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Tangled in Christmas lights', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'A gingerbread house that is life-sized', partyPacks: ['christmas'], genres: ['food_cooking'] },
  { text: 'Decorating with way too many ornaments', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'A Christmas wreath eating contest', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Hanging stockings for a giant', partyPacks: ['christmas'], genres: ['fantasy'] },
  { text: 'A star that is too big for the tree', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Christmas carolers who forgot the words', partyPacks: ['christmas'], genres: ['pop_culture'] },
  { text: 'A snow globe world', partyPacks: ['christmas'], genres: ['fantasy'] },
  { text: 'Decorating the North Pole', partyPacks: ['christmas'], genres: ['general'] },

  // Holiday food
  { text: 'A Christmas turkey escape', partyPacks: ['christmas'], genres: ['food_cooking', 'nature'] },
  { text: 'Cookie decorating disaster', partyPacks: ['christmas', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Eggnog fountain', partyPacks: ['christmas'], genres: ['food_cooking'] },
  { text: 'Gingerbread man running away', partyPacks: ['christmas', 'kids_birthday'], genres: ['food_cooking', 'fantasy'] },
  { text: 'A candy cane forest', partyPacks: ['christmas', 'kids_birthday'], genres: ['food_cooking', 'nature'] },
  { text: 'Fruitcake being regifted', partyPacks: ['christmas'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Hot chocolate with too many marshmallows', partyPacks: ['christmas', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A Christmas feast for mice', partyPacks: ['christmas'], genres: ['food_cooking', 'nature'] },
  { text: 'Baking cookies for Santa at the last minute', partyPacks: ['christmas', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A Christmas pudding on fire', partyPacks: ['christmas'], genres: ['food_cooking'] },

  // Presents and gift giving
  { text: 'Opening presents at midnight', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'A present too big to wrap', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'Wrapping paper explosion', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'A cat destroying the presents', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'Getting exactly what you did not want', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'A tower of gift boxes', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'Secret Santa mix-up', partyPacks: ['christmas', 'office_party'], genres: ['general'] },
  { text: 'A living room buried in presents', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'The perfect bow on a messy present', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Pets destroying gift wrap', partyPacks: ['christmas'], genres: ['nature'] },

  // Winter animals
  { text: 'A polar bear opening presents', partyPacks: ['christmas', 'kids_birthday'], genres: ['nature'] },
  { text: 'Penguins singing carols', partyPacks: ['christmas'], genres: ['nature', 'pop_culture'] },
  { text: 'A seal playing with ornaments', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'Arctic fox in a Santa hat', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'A snowy owl delivering mail', partyPacks: ['christmas'], genres: ['nature', 'fantasy'] },
  { text: 'Reindeer playing reindeer games', partyPacks: ['christmas', 'kids_birthday'], genres: ['nature', 'sports'] },
  { text: 'A moose caught in Christmas lights', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'Bunnies in the snow', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'A cardinal on a snowy branch', partyPacks: ['christmas'], genres: ['nature'] },
  { text: 'Hedgehog hibernating under the tree', partyPacks: ['christmas'], genres: ['nature'] },

  // Christmas chaos
  { text: 'Last-minute Christmas shopping', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Airport delays during the holidays', partyPacks: ['christmas'], genres: ['general'], ageRating: 'teen' },
  { text: 'Family photo attempt disaster', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'The house with too many lights', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Christmas morning before coffee', partyPacks: ['christmas'], genres: ['food_cooking'] },
  { text: 'Kids peeking at presents early', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'A Christmas party gone wild', partyPacks: ['christmas'], genres: ['general'], ageRating: 'teen' },
  { text: 'Assembling a toy on Christmas Eve', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Fighting over the last toy', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'The dog eating the Christmas ham', partyPacks: ['christmas'], genres: ['nature', 'food_cooking'] },

  // Holiday magic
  { text: 'A magical Christmas Eve', partyPacks: ['christmas', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'Toys coming to life at midnight', partyPacks: ['christmas', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A Christmas wish coming true', partyPacks: ['christmas', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'Flying through the night sky', partyPacks: ['christmas'], genres: ['fantasy'] },
  { text: 'The North Pole workshop', partyPacks: ['christmas', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A snowflake that grants wishes', partyPacks: ['christmas', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'Christmas in space', partyPacks: ['christmas'], genres: ['scifi'] },
  { text: 'A time-traveling Christmas adventure', partyPacks: ['christmas'], genres: ['scifi', 'fantasy'] },
  { text: 'Meeting your future self at Christmas', partyPacks: ['christmas'], genres: ['scifi'], ageRating: 'teen' },
  { text: 'A magical Christmas train', partyPacks: ['christmas', 'kids_birthday'], genres: ['fantasy'] },

  // More Christmas scenes
  { text: 'A snowstorm during Christmas dinner', partyPacks: ['christmas'], genres: ['nature', 'food_cooking'] },
  { text: 'Building a snow family', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'Mittens that are too big', partyPacks: ['christmas', 'kids_birthday'], genres: ['general'] },
  { text: 'The ugliest Christmas sweater contest', partyPacks: ['christmas', 'office_party'], genres: ['pop_culture'] },
  { text: 'Mistletoe mishaps', partyPacks: ['christmas'], genres: ['general'], ageRating: 'teen' },
  { text: 'A fireplace that is too big', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'Neighbors competing with lights', partyPacks: ['christmas'], genres: ['general'] },
  { text: 'A white elephant gift exchange', partyPacks: ['christmas', 'office_party'], genres: ['general'] },
  { text: 'Christmas at the beach', partyPacks: ['christmas', 'summer_bbq'], genres: ['nature'] },
  { text: 'A Christmas miracle', partyPacks: ['christmas'], genres: ['fantasy'] },
];

// ============ KIDS BIRTHDAY PACK ============
export const KIDS_BIRTHDAY_QUESTIONS: ThemedQuestionData[] = [
  // Party essentials
  { text: 'A birthday cake explosion', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Balloon animals gone wrong', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A piñata that will not break', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Present opening frenzy', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A tower of presents', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Birthday candles that will not blow out', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'A birthday crown fit for royalty', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'Confetti everywhere', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A birthday banner made by friends', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Goodie bags overflowing', partyPacks: ['kids_birthday'], genres: ['general'] },

  // Party games
  { text: 'Musical chairs chaos', partyPacks: ['kids_birthday'], genres: ['general', 'pop_culture'] },
  { text: 'Pin the tail on the dragon', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'A three-legged race with a pet', partyPacks: ['kids_birthday'], genres: ['sports', 'nature'] },
  { text: 'Freeze dance gone silly', partyPacks: ['kids_birthday'], genres: ['pop_culture'] },
  { text: 'A treasure hunt adventure', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'Egg and spoon race disaster', partyPacks: ['kids_birthday'], genres: ['sports', 'food_cooking'] },
  { text: 'A limbo competition', partyPacks: ['kids_birthday'], genres: ['sports'] },
  { text: 'Hot potato with a real potato', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Sack race to the finish', partyPacks: ['kids_birthday'], genres: ['sports'] },
  { text: 'A dance off at the party', partyPacks: ['kids_birthday'], genres: ['pop_culture'] },

  // Party themes
  { text: 'A princess castle party', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'Superhero training camp', partyPacks: ['kids_birthday'], genres: ['fantasy', 'sports'] },
  { text: 'A dinosaur dig party', partyPacks: ['kids_birthday'], genres: ['nature'] },
  { text: 'Under the sea adventure', partyPacks: ['kids_birthday'], genres: ['nature', 'fantasy'] },
  { text: 'A space explorer party', partyPacks: ['kids_birthday'], genres: ['scifi'] },
  { text: 'Pirate ship birthday', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'A safari party', partyPacks: ['kids_birthday'], genres: ['nature'] },
  { text: 'Circus themed chaos', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A unicorn and rainbow party', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'Robot dance party', partyPacks: ['kids_birthday'], genres: ['scifi', 'pop_culture'] },

  // Party food
  { text: 'A pizza party with silly toppings', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Ice cream sundae bar', partyPacks: ['kids_birthday', 'summer_bbq'], genres: ['food_cooking'] },
  { text: 'Cupcake decorating contest', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'A candy buffet', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Juice box tower', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Fruit carved into animals', partyPacks: ['kids_birthday'], genres: ['food_cooking', 'nature'] },
  { text: 'A cookie decorating station', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Popcorn and movie party', partyPacks: ['kids_birthday'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'A birthday pancake stack', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },
  { text: 'Rainbow colored foods', partyPacks: ['kids_birthday'], genres: ['food_cooking'] },

  // Party entertainment
  { text: 'A magician pulling a bunny out', partyPacks: ['kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'Clown making balloon swords', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A face painting station', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Puppet show performance', partyPacks: ['kids_birthday'], genres: ['pop_culture'] },
  { text: 'A bounce house adventure', partyPacks: ['kids_birthday'], genres: ['sports'] },
  { text: 'A pony ride at the party', partyPacks: ['kids_birthday'], genres: ['nature'] },
  { text: 'A bubble machine going crazy', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Karaoke for kids', partyPacks: ['kids_birthday'], genres: ['pop_culture'] },
  { text: 'A photo booth with silly props', partyPacks: ['kids_birthday'], genres: ['pop_culture'] },
  { text: 'A DJ spinning party hits', partyPacks: ['kids_birthday'], genres: ['pop_culture'] },

  // Birthday wishes
  { text: 'Making a birthday wish', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'A wish list as long as your arm', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Birthday morning excitement', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Writing thank you cards', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A birthday surprise', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Waiting for guests to arrive', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'The birthday countdown', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A party invitation design', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Birthday party cleanup crew', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'The best birthday ever', partyPacks: ['kids_birthday'], genres: ['general'] },

  // Party decorations
  { text: 'A balloon arch entrance', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Streamers covering everything', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A themed table setting', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Birthday party in the backyard', partyPacks: ['kids_birthday', 'summer_bbq'], genres: ['nature'] },
  { text: 'A party tent adventure', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Decorating with too much glitter', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A rainbow balloon display', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Party hats for everyone', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A homemade decoration fail', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'The most decorated room ever', partyPacks: ['kids_birthday'], genres: ['general'] },

  // Party guests
  { text: 'Pets joining the party', partyPacks: ['kids_birthday'], genres: ['nature'] },
  { text: 'Grandparents at the birthday', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Best friends celebrating together', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A shy guest at the party', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'The whole class invited', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A surprise guest arrival', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Friends bringing gifts', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A costume party with friends', partyPacks: ['kids_birthday', 'halloween'], genres: ['general'] },
  { text: 'Group photo of party guests', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Siblings at the party', partyPacks: ['kids_birthday'], genres: ['general'] },

  // More party fun
  { text: 'A water balloon fight', partyPacks: ['kids_birthday', 'summer_bbq'], genres: ['sports'] },
  { text: 'Slip and slide birthday', partyPacks: ['kids_birthday', 'summer_bbq'], genres: ['sports'] },
  { text: 'Arts and crafts corner', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'Building with blocks party', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A teddy bear picnic', partyPacks: ['kids_birthday'], genres: ['nature', 'food_cooking'] },
  { text: 'Dress up party fun', partyPacks: ['kids_birthday'], genres: ['fantasy'] },
  { text: 'A sports themed birthday', partyPacks: ['kids_birthday'], genres: ['sports'] },
  { text: 'Reading stories at the party', partyPacks: ['kids_birthday'], genres: ['general'] },
  { text: 'A garden party', partyPacks: ['kids_birthday', 'summer_bbq'], genres: ['nature'] },
  { text: 'Pool party splash', partyPacks: ['kids_birthday', 'summer_bbq'], genres: ['sports'] },
];

// ============ OFFICE PARTY PACK ============
export const OFFICE_PARTY_QUESTIONS: ThemedQuestionData[] = [
  // Meeting madness
  { text: 'A meeting that could have been an email', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Video call with camera on by accident', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Presentation technical difficulties', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Falling asleep in a meeting', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Too many people talking at once', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The person who always interrupts', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Brainstorming with sticky notes everywhere', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'A whiteboard full of confusing diagrams', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The Monday morning all-hands meeting', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Someone presenting upside-down slides', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },

  // Office kitchen
  { text: 'Someone stole my lunch from the fridge', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'The office coffee machine broke', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Microwaving fish in the office', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Birthday cake in the break room', partyPacks: ['office_party', 'kids_birthday'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'The office potluck disaster', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Fighting over the last donut', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'A passive-aggressive fridge note', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Making coffee for the first time', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'The mysterious office leftovers', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Vending machine lunch', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },

  // Office life
  { text: 'A desk buried in papers', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The printer is jammed again', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Trying to look busy', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Decorating a coworker cubicle', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The office plant that wont die', partyPacks: ['office_party'], genres: ['nature'], ageRating: 'teen' },
  { text: 'Casual Friday fashion disaster', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'A very cluttered desk', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Inbox with 1000 unread emails', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The office supplies hoarder', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Working from home distractions', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },

  // Coworkers
  { text: 'The coworker who talks too much', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Secret office crush', partyPacks: ['office_party'], genres: ['general'], ageRating: 'adult' },
  { text: 'The office gossip', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Awkward elevator small talk', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The reply-all email disaster', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Someone taking credit for your work', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The office prankster strikes again', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Trying to avoid a chatty coworker', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The person who heats smelly food', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Team building exercise gone wrong', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },

  // Office celebrations
  { text: 'Surprise retirement party', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Signing a giant farewell card', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Office holiday party karaoke', partyPacks: ['office_party', 'christmas'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'The secret Santa gift exchange', partyPacks: ['office_party', 'christmas'], genres: ['general'], ageRating: 'teen' },
  { text: 'Work anniversary celebration', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The boss trying to be cool', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Office happy hour', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'adult' },
  { text: 'Desk decorating contest', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Company picnic games', partyPacks: ['office_party', 'summer_bbq'], genres: ['sports'], ageRating: 'teen' },
  { text: 'The annual company photo', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },

  // Work stress
  { text: 'Monday morning alarm', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Deadline panic mode', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The computer crashed before saving', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Counting down to Friday', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Too many browser tabs open', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'The spinning wheel of doom', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Forgetting password again', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The never-ending to-do list', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Taking a mental health break', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Staring at spreadsheets all day', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },

  // Remote work
  { text: 'Pants optional video call', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'adult' },
  { text: 'Pet interrupting work call', partyPacks: ['office_party'], genres: ['nature'], ageRating: 'teen' },
  { text: 'You are on mute', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Virtual happy hour', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Home office setup disaster', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Kid or pet crashing a meeting', partyPacks: ['office_party'], genres: ['nature'], ageRating: 'teen' },
  { text: 'Virtual background fail', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Working from bed', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Internet connection dropping', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Forgetting you are screen sharing', partyPacks: ['office_party'], genres: ['pop_culture'], ageRating: 'teen' },

  // Office humor
  { text: 'The motivational poster nobody reads', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Jello stapler prank', partyPacks: ['office_party'], genres: ['food_cooking'], ageRating: 'teen' },
  { text: 'Office chair race', partyPacks: ['office_party'], genres: ['sports'], ageRating: 'teen' },
  { text: 'Stapler in jello revenge', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The squeaky office chair', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Pretending to type when boss walks by', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The never-ending spreadsheet', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Accidental reply-all chaos', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Office thermostat war', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The mysterious office smell', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },

  // More office life
  { text: 'First day at a new job', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The office mascot', partyPacks: ['office_party'], genres: ['nature'], ageRating: 'teen' },
  { text: 'Trying to fix the copier', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The endless conference call', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Friday afternoon motivation', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The over-decorated cubicle', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Performance review anxiety', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'The networking event', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Pretending to understand jargon', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
  { text: 'Living for the weekend', partyPacks: ['office_party'], genres: ['general'], ageRating: 'teen' },
];

// ============ SUMMER BBQ PACK ============
export const SUMMER_BBQ_QUESTIONS: ThemedQuestionData[] = [
  // Grilling
  { text: 'A barbecue grill on fire', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'Flipping burgers like a pro', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'sports'] },
  { text: 'A hot dog eating contest', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'sports'] },
  { text: 'The grill master at work', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'A vegetable kebab disaster', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'Running out of propane', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'A stack of perfectly grilled corn', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },
  { text: 'Secret BBQ sauce recipe', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'Fighting over the last rib', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'A smoker smoking too much', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },

  // Pool party
  { text: 'A cannonball splash contest', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Pool float traffic jam', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Chicken fight in the pool', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'The perfect dive belly flop', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Marco Polo gone wrong', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Underwater tea party', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A pool toy collection', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['general'] },
  { text: 'Sunscreen application fail', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'A diving board daredevil', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Pool noodle sword fight', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['sports'] },

  // Beach day
  { text: 'A sandcastle kingdom', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'Seagulls stealing food', partyPacks: ['summer_bbq'], genres: ['nature', 'food_cooking'] },
  { text: 'A beach umbrella blowing away', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'Sunburn lines disaster', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'Finding a perfect seashell', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A crab stealing sandals', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'Surfing for the first time', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Beach volleyball match', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Building a sand mermaid', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature', 'fantasy'] },
  { text: 'A jellyfish encounter', partyPacks: ['summer_bbq'], genres: ['nature'] },

  // Summer activities
  { text: 'A lemonade stand empire', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Catching fireflies at dusk', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A sprinkler dance party', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['general'] },
  { text: 'Camping in the backyard', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'Stargazing on a blanket', partyPacks: ['summer_bbq'], genres: ['nature', 'scifi'] },
  { text: 'A frisbee caught in a tree', partyPacks: ['summer_bbq'], genres: ['sports', 'nature'] },
  { text: 'Hammock relaxation fail', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'A bike ride adventure', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Water gun battle royale', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['sports'] },
  { text: 'Making smores by the fire', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },

  // Summer food
  { text: 'A giant watermelon slice', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },
  { text: 'Ice cream melting faster than you can eat', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A popsicle dripping everywhere', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Corn on the cob butter face', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'A fruit salad masterpiece', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },
  { text: 'Iced tea pitcher parade', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'A potato salad explosion', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'Shaved ice brain freeze', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A cooler full of drinks', partyPacks: ['summer_bbq'], genres: ['food_cooking'] },
  { text: 'Grilled pineapple perfection', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },

  // Summer creatures
  { text: 'A mosquito the size of a bird', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'Ants invading the picnic', partyPacks: ['summer_bbq'], genres: ['nature', 'food_cooking'] },
  { text: 'A friendly neighborhood dog', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'Butterflies in the garden', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A bee buzzing around food', partyPacks: ['summer_bbq'], genres: ['nature', 'food_cooking'] },
  { text: 'Ducks at the park', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A squirrel stealing snacks', partyPacks: ['summer_bbq'], genres: ['nature', 'food_cooking'] },
  { text: 'Ladybug landing on finger', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'Raccoons raiding the trash', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A frog in the garden', partyPacks: ['summer_bbq'], genres: ['nature'] },

  // Summer games
  { text: 'A badminton birdie battle', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Croquet chaos', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Horseshoes tournament', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'A bean bag toss showdown', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'Kite flying contest', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'A slip and slide race', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['sports'] },
  { text: 'Tug of war in mud', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'An outdoor movie night', partyPacks: ['summer_bbq'], genres: ['pop_culture'] },
  { text: 'Lawn chair racing', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'A treasure hunt in the yard', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['fantasy'] },

  // Summer scenes
  { text: 'Sunset at the lake', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A picnic blanket spread', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },
  { text: 'Garden party decorations', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'A treehouse adventure', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'Patio furniture arrangement', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'A flower crown maker', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'The perfect summer day', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'Lawn games tournament', partyPacks: ['summer_bbq'], genres: ['sports'] },
  { text: 'A neighborhood block party', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'Fireworks on the Fourth', partyPacks: ['summer_bbq'], genres: ['general'] },

  // More summer fun
  { text: 'A road trip to the beach', partyPacks: ['summer_bbq'], genres: ['nature'] },
  { text: 'Ice cream truck chase', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A farmers market haul', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },
  { text: 'Tie-dye party', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['general'] },
  { text: 'A summer reading spot', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'Catching tadpoles', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['nature'] },
  { text: 'A garden hose battle', partyPacks: ['summer_bbq', 'kids_birthday'], genres: ['sports'] },
  { text: 'Fruit picking adventure', partyPacks: ['summer_bbq'], genres: ['food_cooking', 'nature'] },
  { text: 'A porch swing relaxation', partyPacks: ['summer_bbq'], genres: ['general'] },
  { text: 'End of summer party', partyPacks: ['summer_bbq'], genres: ['general'] },
];

// Export all themed question arrays
export const ALL_THEMED_QUESTIONS: ThemedQuestionData[] = [
  ...HALLOWEEN_QUESTIONS,
  ...CHRISTMAS_QUESTIONS,
  ...KIDS_BIRTHDAY_QUESTIONS,
  ...OFFICE_PARTY_QUESTIONS,
  ...SUMMER_BBQ_QUESTIONS,
];
