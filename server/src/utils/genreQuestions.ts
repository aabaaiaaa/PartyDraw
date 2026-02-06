/**
 * Genre Questions
 * Contains drawing prompts organized by genre themes.
 * Each question has appropriate tags for filtering.
 */

import { AgeRating, PartyPack, GenreTheme } from './themes';

/**
 * Question data structure for genre questions
 */
export interface GenreQuestionData {
  text: string;
  ageRating?: AgeRating;
  partyPacks: PartyPack[];
  genres: GenreTheme[];
}

// ============ POP CULTURE GENRE ============
export const POP_CULTURE_QUESTIONS: GenreQuestionData[] = [
  // Music and entertainment
  { text: 'An air guitar solo', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A concert crowd going wild', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Karaoke night gone wrong', partyPacks: ['general', 'office_party'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'A dance battle showdown', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture', 'sports'] },
  { text: 'DJ spinning records', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A boy band pose', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Playing drums on pots and pans', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture', 'food_cooking'] },
  { text: 'A one-hit wonder comeback tour', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Crowd surfing at a concert', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Making a music video', partyPacks: ['general'], genres: ['pop_culture'] },

  // Movies and TV
  { text: 'A dramatic movie poster', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Binge watching a show', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A plot twist reaction', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'The villain monologue', partyPacks: ['general'], genres: ['pop_culture', 'fantasy'] },
  { text: 'A movie theater experience', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Behind the scenes chaos', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'A red carpet walk', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Waiting for the sequel', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A spoiler alert moment', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Remaking a classic scene', partyPacks: ['general'], genres: ['pop_culture'] },

  // Gaming
  { text: 'A video game character jumping', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture'] },
  { text: 'A gaming marathon setup', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Controller throwing rage', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'A video game boss battle', partyPacks: ['general'], genres: ['pop_culture', 'fantasy'] },
  { text: 'Speed run champion', partyPacks: ['general'], genres: ['pop_culture', 'sports'] },
  { text: 'A retro arcade machine', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A racing game finish line', partyPacks: ['general'], genres: ['pop_culture', 'sports'] },
  { text: 'A puzzle game solved', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Couch co-op with friends', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture'] },
  { text: 'A gaming headset tangle', partyPacks: ['general'], genres: ['pop_culture'] },

  // Internet and social media
  { text: 'A viral video moment', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Trying to take the perfect selfie', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A comment section argument', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Waiting for likes', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'An unboxing video', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A live stream disaster', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'Influencer life behind the scenes', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'A reaction video', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'When the wifi goes down', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A trending hashtag', partyPacks: ['general'], genres: ['pop_culture'] },

  // Memes and trends
  { text: 'A classic meme pose', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A TikTok dance attempt', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture'] },
  { text: 'The before and after transformation', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Expectation vs reality', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A cat meme in real life', partyPacks: ['general'], genres: ['pop_culture', 'nature'] },
  { text: 'The distracted person meme', partyPacks: ['general'], genres: ['pop_culture'], ageRating: 'teen' },
  { text: 'An awkward stock photo pose', partyPacks: ['general', 'office_party'], genres: ['pop_culture'] },
  { text: 'The this is fine dog', partyPacks: ['general'], genres: ['pop_culture', 'nature'] },
  { text: 'A challenge gone wrong', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Evolution of a meme', partyPacks: ['general'], genres: ['pop_culture'] },

  // More pop culture
  { text: 'A fan convention costume', partyPacks: ['general'], genres: ['pop_culture', 'fantasy'] },
  { text: 'Trading card collection', partyPacks: ['general', 'kids_birthday'], genres: ['pop_culture'] },
  { text: 'A midnight movie premiere line', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Celebrity impersonation', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A podcast recording setup', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Binging a whole series in one day', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A fan art masterpiece', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'Award show moment', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'A vintage record collection', partyPacks: ['general'], genres: ['pop_culture'] },
  { text: 'The next big thing', partyPacks: ['general'], genres: ['pop_culture'] },
];

// ============ FOOD & COOKING GENRE ============
export const FOOD_COOKING_QUESTIONS: GenreQuestionData[] = [
  // Kitchen disasters
  { text: 'A recipe gone terribly wrong', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Smoke alarm going off while cooking', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Pasta boiling over', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Too much spice reaction', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A kitchen covered in flour', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Burnt toast catastrophe', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A soufflé that collapsed', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Oil splatter battle', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'The wrong ingredient was added', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A blender explosion', partyPacks: ['general'], genres: ['food_cooking'] },

  // Cooking shows
  { text: 'A cooking competition final round', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'Chopping vegetables at lightning speed', partyPacks: ['general'], genres: ['food_cooking', 'sports'] },
  { text: 'A chef tasting their creation', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'The secret ingredient reveal', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'A cooking show host enthusiastic', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'Flambé moment', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Plating like a professional', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A kitchen timer panic', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Mystery basket challenge', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'The judges reactions', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },

  // Baking
  { text: 'A towering wedding cake', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Cookie decorating with too much frosting', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Bread rising too much', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A pie with a perfect lattice', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Cupcake frosting art', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A donut assembly line', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Pretzel twisting', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A macaron tower', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Cinnamon roll perfection', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Gingerbread construction', partyPacks: ['general', 'christmas'], genres: ['food_cooking'] },

  // Restaurant scenes
  { text: 'A waiter balancing too many plates', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A busy kitchen during rush hour', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'The chef special', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A food critic tasting', partyPacks: ['general'], genres: ['food_cooking', 'pop_culture'] },
  { text: 'A sushi chef at work', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Pizza tossing in the air', partyPacks: ['general'], genres: ['food_cooking', 'sports'] },
  { text: 'A food truck adventure', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'The dessert menu temptation', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'An all-you-can-eat challenge', partyPacks: ['general'], genres: ['food_cooking', 'sports'] },
  { text: 'A fancy restaurant experience', partyPacks: ['general'], genres: ['food_cooking'] },

  // Food art
  { text: 'Food arranged as a face', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'A vegetable sculpture', partyPacks: ['general'], genres: ['food_cooking', 'nature'] },
  { text: 'Latte art gone wrong', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A bento box masterpiece', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Fruit carved into animals', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking', 'nature'] },
  { text: 'Rainbow layered cake', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'The perfect cheese board', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A spaghetti art project', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Chocolate fountain dreams', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'An ice cream sundae mountain', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },

  // More food fun
  { text: 'A food fight breaking out', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'Eating something too sour', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A giant sandwich tower', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Noodle slurping contest', partyPacks: ['general'], genres: ['food_cooking', 'sports'] },
  { text: 'A messy taco eating', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Brain freeze from ice cream', partyPacks: ['general', 'kids_birthday'], genres: ['food_cooking'] },
  { text: 'The worlds longest hot dog', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A pizza with everything on it', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'Breakfast in bed disaster', partyPacks: ['general'], genres: ['food_cooking'] },
  { text: 'A midnight snack raid', partyPacks: ['general'], genres: ['food_cooking'] },
];

// ============ SPORTS GENRE ============
export const SPORTS_QUESTIONS: GenreQuestionData[] = [
  // Team sports
  { text: 'A soccer goal celebration', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A basketball slam dunk', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A football touchdown dance', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A baseball home run', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A volleyball spike', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A hockey goalie save', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A rugby tackle', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A cricket match', partyPacks: ['general'], genres: ['sports'] },
  { text: 'Team huddle before the big game', partyPacks: ['general'], genres: ['sports'] },
  { text: 'Lifting the championship trophy', partyPacks: ['general'], genres: ['sports'] },

  // Individual sports
  { text: 'A tennis serve at full power', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A golf swing gone wrong', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A gymnast sticking the landing', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A figure skater spin', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A swimmer at the starting block', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A track and field sprint finish', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A weightlifter lift', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A bowler getting a strike', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A boxer in the ring', partyPacks: ['general'], genres: ['sports'], ageRating: 'teen' },
  { text: 'A martial artist kick', partyPacks: ['general'], genres: ['sports'] },

  // Extreme sports
  { text: 'A skateboard trick gone wrong', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A BMX jump', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A snowboarder doing a flip', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A rock climber reaching the top', partyPacks: ['general'], genres: ['sports', 'nature'] },
  { text: 'A surfer riding a huge wave', partyPacks: ['general', 'summer_bbq'], genres: ['sports', 'nature'] },
  { text: 'A skydiver freefall', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A bungee jump moment', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A parkour runner', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A motocross racer', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A base jump off a cliff', partyPacks: ['general'], genres: ['sports', 'nature'] },

  // Sports moments
  { text: 'A photo finish at the race', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A ref making a controversial call', partyPacks: ['general'], genres: ['sports'], ageRating: 'teen' },
  { text: 'Fans doing the wave', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A mascot dancing', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A sports blooper reel moment', partyPacks: ['general'], genres: ['sports', 'pop_culture'] },
  { text: 'The underdog winning', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A nail-biting penalty kick', partyPacks: ['general'], genres: ['sports'] },
  { text: 'Overtime game winner', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A sports interview moment', partyPacks: ['general'], genres: ['sports', 'pop_culture'] },
  { text: 'The pre-game warmup', partyPacks: ['general'], genres: ['sports'] },

  // Fun sports
  { text: 'A mini golf hole-in-one attempt', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A trampoline trick', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A hula hoop champion', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A ping pong battle', partyPacks: ['general', 'office_party'], genres: ['sports'] },
  { text: 'A water balloon toss', partyPacks: ['general', 'summer_bbq', 'kids_birthday'], genres: ['sports'] },
  { text: 'A wheelie on a bicycle', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A cartwheel attempt', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A limbo competition', partyPacks: ['general', 'summer_bbq'], genres: ['sports'] },
  { text: 'A jump rope marathon', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },
  { text: 'A silly relay race', partyPacks: ['general', 'kids_birthday'], genres: ['sports'] },

  // More sports
  { text: 'A coach giving a pep talk', partyPacks: ['general'], genres: ['sports'] },
  { text: 'An athlete training montage', partyPacks: ['general'], genres: ['sports', 'pop_culture'] },
  { text: 'Sports equipment explosion', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A water break during a hot game', partyPacks: ['general'], genres: ['sports'] },
  { text: 'The locker room celebration', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A sports injury dramatic fall', partyPacks: ['general'], genres: ['sports'] },
  { text: 'An esports tournament', partyPacks: ['general'], genres: ['sports', 'pop_culture'] },
  { text: 'A yoga pose gone wrong', partyPacks: ['general'], genres: ['sports'] },
  { text: 'A marathon runner at the finish', partyPacks: ['general'], genres: ['sports'] },
  { text: 'An obstacle course challenge', partyPacks: ['general'], genres: ['sports'] },
];

// ============ FANTASY GENRE ============
export const FANTASY_QUESTIONS: GenreQuestionData[] = [
  // Magical creatures
  { text: 'A dragon learning to fly', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'A unicorn at the salon', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A phoenix rising from ashes', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A mermaid with legs for a day', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A griffin playing fetch', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A centaur at a race track', partyPacks: ['general'], genres: ['fantasy', 'sports'] },
  { text: 'A fairy godmother on vacation', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A troll under a bridge toll booth', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A pegasus at the airport', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'An elf making toys', partyPacks: ['general', 'christmas'], genres: ['fantasy'] },

  // Magic users
  { text: 'A wizard who lost their wand', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A witch brewing coffee', partyPacks: ['general'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A sorcerer at magic school', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'An enchanter at a talent show', partyPacks: ['general'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A magic carpet in traffic', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A crystal ball showing bad news', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A spell book with spelling errors', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A potion mixing mishap', partyPacks: ['general', 'halloween'], genres: ['fantasy'] },
  { text: 'An invisibility cloak malfunction', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A magic mirror selfie', partyPacks: ['general'], genres: ['fantasy', 'pop_culture'] },

  // Fantasy quests
  { text: 'A knight on a noble quest', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A princess rescuing a prince', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A treasure map adventure', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A hero facing the final boss', partyPacks: ['general'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A quest party meeting at a tavern', partyPacks: ['general'], genres: ['fantasy'], ageRating: 'teen' },
  { text: 'A dungeon with a twist', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A magic sword choosing its owner', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A side quest distraction', partyPacks: ['general'], genres: ['fantasy', 'pop_culture'] },
  { text: 'A castle under siege', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'The chosen one training', partyPacks: ['general'], genres: ['fantasy'] },

  // Fantasy worlds
  { text: 'A floating island city', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'An enchanted forest entrance', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A giant beanstalk', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'An underwater kingdom', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A magical library', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A portal to another world', partyPacks: ['general'], genres: ['fantasy', 'scifi'] },
  { text: 'A rainbow bridge', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A kingdom in the clouds', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A fairy tale village', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A giant mushroom forest', partyPacks: ['general'], genres: ['fantasy', 'nature'] },

  // Fairy tales
  { text: 'A glass slipper fitting', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A frog waiting to be kissed', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'Three bears coming home', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'A wolf in grandmas clothes', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A spinning wheel curse', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A pumpkin carriage', partyPacks: ['general', 'halloween', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A tower with very long hair', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A house made of candy', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'food_cooking'] },
  { text: 'A magic bean trade', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy', 'nature'] },
  { text: 'A happily ever after moment', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },

  // More fantasy
  { text: 'A dragon hoarding treasure', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A gnome guarding a garden', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'A magical transformation', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A wish being granted', partyPacks: ['general', 'kids_birthday'], genres: ['fantasy'] },
  { text: 'A legendary weapon discovery', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A mythical beast tamed', partyPacks: ['general'], genres: ['fantasy', 'nature'] },
  { text: 'An ancient prophecy fulfilled', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A magical artifact', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A fantasy map creation', partyPacks: ['general'], genres: ['fantasy'] },
  { text: 'A legendary hero retirement', partyPacks: ['general'], genres: ['fantasy'], ageRating: 'teen' },
];

// ============ SCI-FI GENRE ============
export const SCIFI_QUESTIONS: GenreQuestionData[] = [
  // Space travel
  { text: 'A spaceship taking off', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'An astronaut floating in space', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A moon landing moment', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A space station dinner', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A warp speed jump', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A meteor shower outside the window', partyPacks: ['general'], genres: ['scifi', 'nature'] },
  { text: 'Zero gravity problems', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A spacewalk repair', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'Landing on a new planet', partyPacks: ['general'], genres: ['scifi', 'nature'] },
  { text: 'A space race between ships', partyPacks: ['general'], genres: ['scifi', 'sports'] },

  // Robots and AI
  { text: 'A robot learning to dance', partyPacks: ['general', 'kids_birthday'], genres: ['scifi', 'pop_culture'] },
  { text: 'An AI having an existential crisis', partyPacks: ['general'], genres: ['scifi'], ageRating: 'teen' },
  { text: 'A robot butler serving dinner', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A cyborg at the gym', partyPacks: ['general'], genres: ['scifi', 'sports'] },
  { text: 'A robot dog playing fetch', partyPacks: ['general', 'kids_birthday'], genres: ['scifi', 'nature'] },
  { text: 'An android in disguise', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A robot uprising meeting', partyPacks: ['general'], genres: ['scifi'], ageRating: 'teen' },
  { text: 'A friendly robot helper', partyPacks: ['general', 'kids_birthday'], genres: ['scifi'] },
  { text: 'A robot with emotions', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A malfunctioning robot', partyPacks: ['general'], genres: ['scifi'] },

  // Aliens
  { text: 'An alien trying human food', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A first contact handshake', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'An alien tourist on Earth', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A flying saucer in the backyard', partyPacks: ['general', 'kids_birthday'], genres: ['scifi'] },
  { text: 'An alien learning Earth customs', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A friendly alien pet', partyPacks: ['general', 'kids_birthday'], genres: ['scifi', 'nature'] },
  { text: 'An alien abduction story time', partyPacks: ['general'], genres: ['scifi'], ageRating: 'teen' },
  { text: 'An intergalactic peace treaty', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'An alien disguised as a human', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A multi-species space crew', partyPacks: ['general'], genres: ['scifi'] },

  // Future technology
  { text: 'A flying car commute', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A teleporter malfunction', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A hologram video call', partyPacks: ['general', 'office_party'], genres: ['scifi'] },
  { text: 'A food replicator making dinner', partyPacks: ['general'], genres: ['scifi', 'food_cooking'] },
  { text: 'A time travel mix-up', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A virtual reality adventure', partyPacks: ['general'], genres: ['scifi', 'pop_culture'] },
  { text: 'A jetpack malfunction', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A cryogenic sleep awakening', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A cloning experiment', partyPacks: ['general'], genres: ['scifi'], ageRating: 'teen' },
  { text: 'A mind-reading device', partyPacks: ['general'], genres: ['scifi'] },

  // Space exploration
  { text: 'A Mars colony settlement', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'Discovering an alien artifact', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A space garden', partyPacks: ['general'], genres: ['scifi', 'nature'] },
  { text: 'Mining asteroids for resources', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A black hole observation', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A space traffic jam', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'An interstellar road trip', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'Space pirates boarding', partyPacks: ['general'], genres: ['scifi', 'fantasy'] },
  { text: 'A neutron star up close', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'Building a dyson sphere', partyPacks: ['general'], genres: ['scifi'] },

  // More sci-fi
  { text: 'A laser sword duel', partyPacks: ['general'], genres: ['scifi', 'sports'] },
  { text: 'A space suit fashion show', partyPacks: ['general'], genres: ['scifi', 'pop_culture'] },
  { text: 'An escape pod launch', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A mutation experiment gone right', partyPacks: ['general'], genres: ['scifi'], ageRating: 'teen' },
  { text: 'An intergalactic sports competition', partyPacks: ['general'], genres: ['scifi', 'sports'] },
  { text: 'A quantum computer solving problems', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A forcefield activation', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'A parallel universe meeting', partyPacks: ['general'], genres: ['scifi'] },
  { text: 'An antigravity dance party', partyPacks: ['general'], genres: ['scifi', 'pop_culture'] },
  { text: 'The end of the universe party', partyPacks: ['general'], genres: ['scifi'], ageRating: 'teen' },
];

// ============ NATURE GENRE ============
export const NATURE_QUESTIONS: GenreQuestionData[] = [
  // Wildlife
  { text: 'A family of ducks crossing the road', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A squirrel hoarding acorns', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A bee pollinating flowers', partyPacks: ['general', 'summer_bbq'], genres: ['nature'] },
  { text: 'A spider building its web', partyPacks: ['general'], genres: ['nature'] },
  { text: 'Birds in a birdbath', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A fox sneaking through the night', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A deer in headlights', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A raccoon raiding the garbage', partyPacks: ['general'], genres: ['nature', 'food_cooking'] },
  { text: 'A butterfly migration', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A skunk spray warning', partyPacks: ['general'], genres: ['nature'] },

  // Ocean life
  { text: 'A whale breaching the surface', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A school of tropical fish', partyPacks: ['general'], genres: ['nature'] },
  { text: 'An octopus opening a jar', partyPacks: ['general'], genres: ['nature', 'food_cooking'] },
  { text: 'A sea turtle swimming', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A dolphin jumping through hoops', partyPacks: ['general', 'kids_birthday'], genres: ['nature', 'sports'] },
  { text: 'A coral reef city', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A jellyfish glowing in the dark', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A hermit crab moving homes', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A starfish on the beach', partyPacks: ['general', 'summer_bbq'], genres: ['nature'] },
  { text: 'A deep sea creature discovery', partyPacks: ['general'], genres: ['nature', 'scifi'] },

  // Jungle and safari
  { text: 'A lion pride resting', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A giraffe eating from treetops', partyPacks: ['general'], genres: ['nature', 'food_cooking'] },
  { text: 'Monkeys swinging through vines', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'An elephant at a watering hole', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A hippo yawning', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A zebra herd pattern', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A chameleon changing colors', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A gorilla family moment', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A crocodile sunbathing', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A parrot learning words', partyPacks: ['general'], genres: ['nature', 'pop_culture'] },

  // Nature scenes
  { text: 'A waterfall in the jungle', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A rainbow after the storm', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A volcano erupting', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A desert oasis', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A Northern Lights display', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A forest in autumn colors', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A cherry blossom tree', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A mountain peak sunrise', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A cave with crystals', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A giant redwood tree', partyPacks: ['general'], genres: ['nature'] },

  // Garden life
  { text: 'A sunflower following the sun', partyPacks: ['general', 'summer_bbq'], genres: ['nature'] },
  { text: 'A ladybug on a leaf', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A worm aerating the soil', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A vegetable garden growing', partyPacks: ['general', 'summer_bbq'], genres: ['nature', 'food_cooking'] },
  { text: 'A bird building a nest', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A caterpillar becoming a butterfly', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A beehive buzzing', partyPacks: ['general'], genres: ['nature', 'food_cooking'] },
  { text: 'A pond with lily pads', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A mushroom ring in the forest', partyPacks: ['general'], genres: ['nature', 'fantasy'] },
  { text: 'A rose garden in bloom', partyPacks: ['general'], genres: ['nature'] },

  // More nature
  { text: 'A beaver building a dam', partyPacks: ['general'], genres: ['nature'] },
  { text: 'An owl hunting at night', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A panda eating bamboo', partyPacks: ['general'], genres: ['nature', 'food_cooking'] },
  { text: 'A penguin colony', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A baby animal taking first steps', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A bird migration pattern', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A forest fire and regrowth', partyPacks: ['general'], genres: ['nature'] },
  { text: 'A tide pool ecosystem', partyPacks: ['general', 'summer_bbq'], genres: ['nature'] },
  { text: 'A seed sprouting into a plant', partyPacks: ['general', 'kids_birthday'], genres: ['nature'] },
  { text: 'A four seasons time lapse', partyPacks: ['general'], genres: ['nature'] },
];

// Export all genre question arrays
export const ALL_GENRE_QUESTIONS: GenreQuestionData[] = [
  ...POP_CULTURE_QUESTIONS,
  ...FOOD_COOKING_QUESTIONS,
  ...SPORTS_QUESTIONS,
  ...FANTASY_QUESTIONS,
  ...SCIFI_QUESTIONS,
  ...NATURE_QUESTIONS,
];
