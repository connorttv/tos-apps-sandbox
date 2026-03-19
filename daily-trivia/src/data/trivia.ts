export type Category =
  | 'science'
  | 'history'
  | 'geography'
  | 'pop-culture'
  | 'technology'
  | 'nature'
  | 'food-drink'
  | 'sports'
  | 'space'
  | 'animals'

export interface TriviaItem {
  id: string
  category: Category
  type: 'fact' | 'qa'
  text: string
  answer?: string
  source?: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  science: 'Science',
  history: 'History',
  geography: 'Geography',
  'pop-culture': 'Pop Culture',
  technology: 'Technology',
  nature: 'Nature',
  'food-drink': 'Food & Drink',
  sports: 'Sports',
  space: 'Space',
  animals: 'Animals',
}

export const ALL_CATEGORIES: Category[] = Object.keys(CATEGORY_LABELS) as Category[]

export const triviaItems: TriviaItem[] = [
  // ── Science ──────────────────────────────────────────────────────────────
  { id: 'sci-01', category: 'science', type: 'fact', text: 'A teaspoonful of neutron star would weigh about 6 billion tons.' },
  { id: 'sci-02', category: 'science', type: 'fact', text: 'Bananas are naturally radioactive due to their potassium content.' },
  { id: 'sci-03', category: 'science', type: 'fact', text: 'Hot water freezes faster than cold water — a phenomenon called the Mpemba effect.' },
  { id: 'sci-04', category: 'science', type: 'fact', text: 'Your body contains about 37.2 trillion cells.' },
  { id: 'sci-05', category: 'science', type: 'fact', text: 'Lightning is five times hotter than the surface of the sun.' },
  { id: 'sci-06', category: 'science', type: 'fact', text: 'Sound travels about 4.3 times faster in water than in air.' },
  { id: 'sci-07', category: 'science', type: 'fact', text: 'A single bolt of lightning contains enough energy to toast 100,000 slices of bread.' },
  { id: 'sci-08', category: 'science', type: 'fact', text: 'DNA in all your cells stretched out would reach from the Earth to Pluto and back.' },
  { id: 'sci-09', category: 'science', type: 'qa', text: 'What is the hardest natural substance on Earth?', answer: 'Diamond' },
  { id: 'sci-10', category: 'science', type: 'qa', text: 'What gas makes up about 78% of Earth\'s atmosphere?', answer: 'Nitrogen' },
  { id: 'sci-11', category: 'science', type: 'qa', text: 'What temperature is the same in both Celsius and Fahrenheit?', answer: '-40 degrees' },
  { id: 'sci-12', category: 'science', type: 'qa', text: 'How many bones does an adult human body have?', answer: '206' },
  { id: 'sci-13', category: 'science', type: 'qa', text: 'What is the most abundant element in the universe?', answer: 'Hydrogen' },

  // ── History ──────────────────────────────────────────────────────────────
  { id: 'his-01', category: 'history', type: 'fact', text: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.' },
  { id: 'his-02', category: 'history', type: 'fact', text: 'Oxford University is older than the Aztec Empire.' },
  { id: 'his-03', category: 'history', type: 'fact', text: 'The shortest war in history lasted 38 minutes — between Britain and Zanzibar in 1896.' },
  { id: 'his-04', category: 'history', type: 'fact', text: 'Ancient Romans used crushed mouse brains as toothpaste.' },
  { id: 'his-05', category: 'history', type: 'fact', text: 'Vikings used the bones of slain animals when smithing new weapons believing this would enchant the weapon with the animal\'s spirit.' },
  { id: 'his-06', category: 'history', type: 'fact', text: 'The Great Fire of London in 1666 destroyed 13,200 houses but only six verified deaths were recorded.' },
  { id: 'his-07', category: 'history', type: 'fact', text: 'Napoleon was actually above average height for his era at about 5\'7".' },
  { id: 'his-08', category: 'history', type: 'fact', text: 'The first alarm clock could only ring at 4 AM.' },
  { id: 'his-09', category: 'history', type: 'qa', text: 'In what year did the Titanic sink?', answer: '1912' },
  { id: 'his-10', category: 'history', type: 'qa', text: 'Who was the first person to circumnavigate the globe?', answer: 'Ferdinand Magellan\'s expedition' },
  { id: 'his-11', category: 'history', type: 'qa', text: 'What ancient wonder was located in Alexandria, Egypt?', answer: 'The Lighthouse (Pharos)' },
  { id: 'his-12', category: 'history', type: 'qa', text: 'How long did the Hundred Years\' War actually last?', answer: '116 years' },
  { id: 'his-13', category: 'history', type: 'qa', text: 'Which civilization invented paper?', answer: 'Ancient China' },

  // ── Geography ────────────────────────────────────────────────────────────
  { id: 'geo-01', category: 'geography', type: 'fact', text: 'Russia spans 11 time zones — more than any other country.' },
  { id: 'geo-02', category: 'geography', type: 'fact', text: 'Canada has more lakes than the rest of the world combined.' },
  { id: 'geo-03', category: 'geography', type: 'fact', text: 'Africa is the only continent that spans all four hemispheres.' },
  { id: 'geo-04', category: 'geography', type: 'fact', text: 'The Dead Sea is so salty that nothing can sink in it.' },
  { id: 'geo-05', category: 'geography', type: 'fact', text: 'Istanbul is the only city in the world that sits on two continents.' },
  { id: 'geo-06', category: 'geography', type: 'fact', text: 'Australia is wider than the Moon.' },
  { id: 'geo-07', category: 'geography', type: 'fact', text: 'There is a town in Norway called Hell — and it freezes over every winter.' },
  { id: 'geo-08', category: 'geography', type: 'qa', text: 'What is the smallest country in the world?', answer: 'Vatican City' },
  { id: 'geo-09', category: 'geography', type: 'qa', text: 'What is the longest river in the world?', answer: 'The Nile' },
  { id: 'geo-10', category: 'geography', type: 'qa', text: 'Which desert is the largest in the world?', answer: 'Antarctica' },
  { id: 'geo-11', category: 'geography', type: 'qa', text: 'What country has the most natural lakes?', answer: 'Canada' },
  { id: 'geo-12', category: 'geography', type: 'qa', text: 'What is the deepest ocean trench?', answer: 'Mariana Trench' },

  // ── Pop Culture ──────────────────────────────────────────────────────────
  { id: 'pop-01', category: 'pop-culture', type: 'fact', text: 'The "Friends" cast negotiated a salary of $1 million per episode each for the final two seasons.' },
  { id: 'pop-02', category: 'pop-culture', type: 'fact', text: 'The word "emoji" comes from the Japanese words for picture (e) and character (moji).' },
  { id: 'pop-03', category: 'pop-culture', type: 'fact', text: 'Mickey Mouse was the first animated character to receive a star on the Hollywood Walk of Fame.' },
  { id: 'pop-04', category: 'pop-culture', type: 'fact', text: 'The first YouTube video ever uploaded was titled "Me at the Zoo" in April 2005.' },
  { id: 'pop-05', category: 'pop-culture', type: 'fact', text: '"Jaws" was the first movie to earn $100 million at the box office.' },
  { id: 'pop-06', category: 'pop-culture', type: 'fact', text: 'The average person spends about two weeks of their life waiting for traffic lights to change.' },
  { id: 'pop-07', category: 'pop-culture', type: 'fact', text: 'Pac-Man was originally called Puck Man but was changed to prevent vandalism of arcade machines.' },
  { id: 'pop-08', category: 'pop-culture', type: 'qa', text: 'What is the best-selling video game of all time?', answer: 'Minecraft' },
  { id: 'pop-09', category: 'pop-culture', type: 'qa', text: 'What year was the first iPhone released?', answer: '2007' },
  { id: 'pop-10', category: 'pop-culture', type: 'qa', text: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci' },
  { id: 'pop-11', category: 'pop-culture', type: 'qa', text: 'What is the highest-grossing film of all time (not adjusted for inflation)?', answer: 'Avatar' },
  { id: 'pop-12', category: 'pop-culture', type: 'qa', text: 'What band holds the record for most Grammy Awards?', answer: 'Beyoncé' },

  // ── Technology ────────────────────────────────────────────────────────────
  { id: 'tec-01', category: 'technology', type: 'fact', text: 'The first computer bug was an actual bug — a moth found in a Harvard Mark II computer in 1947.' },
  { id: 'tec-02', category: 'technology', type: 'fact', text: 'The entire computing power of the Apollo 11 mission was less than a modern calculator.' },
  { id: 'tec-03', category: 'technology', type: 'fact', text: 'Over 6,000 new computer viruses are created every single month.' },
  { id: 'tec-04', category: 'technology', type: 'fact', text: 'The QWERTY keyboard layout was designed to slow typists down and prevent typewriter jams.' },
  { id: 'tec-05', category: 'technology', type: 'fact', text: 'Email existed before the World Wide Web.' },
  { id: 'tec-06', category: 'technology', type: 'fact', text: 'The first 1 GB hard drive, introduced in 1980, weighed over 500 pounds.' },
  { id: 'tec-07', category: 'technology', type: 'fact', text: 'About 90% of the world\'s currency exists only on computers — not as physical cash.' },
  { id: 'tec-08', category: 'technology', type: 'qa', text: 'Who is credited with inventing the World Wide Web?', answer: 'Tim Berners-Lee' },
  { id: 'tec-09', category: 'technology', type: 'qa', text: 'What programming language was created by James Gosling in 1995?', answer: 'Java' },
  { id: 'tec-10', category: 'technology', type: 'qa', text: 'What does "HTTP" stand for?', answer: 'HyperText Transfer Protocol' },
  { id: 'tec-11', category: 'technology', type: 'qa', text: 'What year was Bitcoin created?', answer: '2009' },
  { id: 'tec-12', category: 'technology', type: 'qa', text: 'What company created the first commercially successful smartphone?', answer: 'BlackBerry (RIM)' },

  // ── Nature ───────────────────────────────────────────────────────────────
  { id: 'nat-01', category: 'nature', type: 'fact', text: 'Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.' },
  { id: 'nat-02', category: 'nature', type: 'fact', text: 'A single tree can absorb up to 48 pounds of carbon dioxide per year.' },
  { id: 'nat-03', category: 'nature', type: 'fact', text: 'Bamboo can grow up to 35 inches in a single day.' },
  { id: 'nat-04', category: 'nature', type: 'fact', text: 'The Amazon Rainforest produces about 20% of the world\'s oxygen.' },
  { id: 'nat-05', category: 'nature', type: 'fact', text: 'There are more trees on Earth than stars in the Milky Way.' },
  { id: 'nat-06', category: 'nature', type: 'fact', text: 'A cloud can weigh more than a million pounds.' },
  { id: 'nat-07', category: 'nature', type: 'fact', text: 'Sunflowers can be used to clean up radioactive waste through a process called phytoremediation.' },
  { id: 'nat-08', category: 'nature', type: 'qa', text: 'What is the tallest type of grass?', answer: 'Bamboo' },
  { id: 'nat-09', category: 'nature', type: 'qa', text: 'What percentage of Earth\'s water is fresh water?', answer: 'About 3%' },
  { id: 'nat-10', category: 'nature', type: 'qa', text: 'What natural phenomenon is measured on the Richter scale?', answer: 'Earthquakes' },
  { id: 'nat-11', category: 'nature', type: 'qa', text: 'What is the largest living organism on Earth?', answer: 'Honey fungus (Armillaria)' },
  { id: 'nat-12', category: 'nature', type: 'qa', text: 'How old is the oldest known living tree?', answer: 'Over 5,000 years' },

  // ── Food & Drink ─────────────────────────────────────────────────────────
  { id: 'fod-01', category: 'food-drink', type: 'fact', text: 'Peanuts are not nuts — they are legumes that grow underground.' },
  { id: 'fod-02', category: 'food-drink', type: 'fact', text: 'The average person eats about 35 tons of food in a lifetime.' },
  { id: 'fod-03', category: 'food-drink', type: 'fact', text: 'White chocolate isn\'t technically chocolate because it contains no cocoa solids.' },
  { id: 'fod-04', category: 'food-drink', type: 'fact', text: 'Apples float in water because they are 25% air.' },
  { id: 'fod-05', category: 'food-drink', type: 'fact', text: 'Ketchup was sold as medicine in the 1830s.' },
  { id: 'fod-06', category: 'food-drink', type: 'fact', text: 'Strawberries are not berries, but bananas are.' },
  { id: 'fod-07', category: 'food-drink', type: 'fact', text: 'Honey is the only food that includes all the substances necessary to sustain life.' },
  { id: 'fod-08', category: 'food-drink', type: 'qa', text: 'What country consumes the most coffee per capita?', answer: 'Finland' },
  { id: 'fod-09', category: 'food-drink', type: 'qa', text: 'What fruit is known as the "king of fruits"?', answer: 'Durian' },
  { id: 'fod-10', category: 'food-drink', type: 'qa', text: 'What is the most consumed manufactured drink in the world?', answer: 'Tea' },
  { id: 'fod-11', category: 'food-drink', type: 'qa', text: 'What spice is the most expensive by weight?', answer: 'Saffron' },
  { id: 'fod-12', category: 'food-drink', type: 'qa', text: 'In which country did french fries originate?', answer: 'Belgium' },

  // ── Sports ───────────────────────────────────────────────────────────────
  { id: 'spo-01', category: 'sports', type: 'fact', text: 'A golf ball has 336 dimples on average.' },
  { id: 'spo-02', category: 'sports', type: 'fact', text: 'The Olympic flag\'s five rings represent the five inhabited continents.' },
  { id: 'spo-03', category: 'sports', type: 'fact', text: 'Table tennis balls travel off the paddle at speeds up to 100 mph.' },
  { id: 'spo-04', category: 'sports', type: 'fact', text: 'The first Olympic Games were held in 776 BC in Olympia, Greece.' },
  { id: 'spo-05', category: 'sports', type: 'fact', text: 'A regulation baseball has exactly 108 stitches.' },
  { id: 'spo-06', category: 'sports', type: 'fact', text: 'Fencing is one of only five sports that have been in every modern Olympic Games.' },
  { id: 'spo-07', category: 'sports', type: 'fact', text: 'The longest tennis match in history lasted 11 hours and 5 minutes at Wimbledon in 2010.' },
  { id: 'spo-08', category: 'sports', type: 'qa', text: 'How many players are on a standard soccer team?', answer: '11' },
  { id: 'spo-09', category: 'sports', type: 'qa', text: 'What sport is known as "the gentleman\'s game"?', answer: 'Cricket' },
  { id: 'spo-10', category: 'sports', type: 'qa', text: 'In which city were the first modern Olympics held?', answer: 'Athens' },
  { id: 'spo-11', category: 'sports', type: 'qa', text: 'What is the diameter of a basketball hoop in inches?', answer: '18 inches' },
  { id: 'spo-12', category: 'sports', type: 'qa', text: 'How long is a marathon in miles?', answer: '26.2 miles' },

  // ── Space ────────────────────────────────────────────────────────────────
  { id: 'spa-01', category: 'space', type: 'fact', text: 'A day on Venus is longer than a year on Venus.' },
  { id: 'spa-02', category: 'space', type: 'fact', text: 'There are more stars in the universe than grains of sand on all of Earth\'s beaches.' },
  { id: 'spa-03', category: 'space', type: 'fact', text: 'If you could fly a plane to Pluto, the trip would take more than 800 years.' },
  { id: 'spa-04', category: 'space', type: 'fact', text: 'The footprints on the Moon will last for 100 million years because there is no wind.' },
  { id: 'spa-05', category: 'space', type: 'fact', text: 'Saturn\'s density is low enough that it would float if placed in water.' },
  { id: 'spa-06', category: 'space', type: 'fact', text: 'Space is completely silent because there is no atmosphere to carry sound.' },
  { id: 'spa-07', category: 'space', type: 'fact', text: 'The International Space Station orbits the Earth every 90 minutes.' },
  { id: 'spa-08', category: 'space', type: 'fact', text: 'One million Earths could fit inside the Sun.' },
  { id: 'spa-09', category: 'space', type: 'qa', text: 'What planet has the most moons?', answer: 'Saturn' },
  { id: 'spa-10', category: 'space', type: 'qa', text: 'What is the hottest planet in our solar system?', answer: 'Venus' },
  { id: 'spa-11', category: 'space', type: 'qa', text: 'How long does it take light from the Sun to reach Earth?', answer: 'About 8 minutes' },
  { id: 'spa-12', category: 'space', type: 'qa', text: 'What is the largest planet in our solar system?', answer: 'Jupiter' },
  { id: 'spa-13', category: 'space', type: 'qa', text: 'What is the name of the galaxy we live in?', answer: 'The Milky Way' },

  // ── Animals ──────────────────────────────────────────────────────────────
  { id: 'ani-01', category: 'animals', type: 'fact', text: 'An octopus has three hearts, nine brains, and blue blood.' },
  { id: 'ani-02', category: 'animals', type: 'fact', text: 'A group of flamingos is called a "flamboyance."' },
  { id: 'ani-03', category: 'animals', type: 'fact', text: 'Cows have best friends and get stressed when separated from them.' },
  { id: 'ani-04', category: 'animals', type: 'fact', text: 'A mantis shrimp can punch with the force of a .22 caliber bullet.' },
  { id: 'ani-05', category: 'animals', type: 'fact', text: 'Elephants are the only animals that can\'t jump.' },
  { id: 'ani-06', category: 'animals', type: 'fact', text: 'Sea otters hold hands while sleeping to keep from drifting apart.' },
  { id: 'ani-07', category: 'animals', type: 'fact', text: 'A snail can sleep for up to three years.' },
  { id: 'ani-08', category: 'animals', type: 'fact', text: 'Dolphins have names for each other and can call out to specific individuals.' },
  { id: 'ani-09', category: 'animals', type: 'qa', text: 'What is the fastest land animal?', answer: 'Cheetah' },
  { id: 'ani-10', category: 'animals', type: 'qa', text: 'How many hearts does an octopus have?', answer: 'Three' },
  { id: 'ani-11', category: 'animals', type: 'qa', text: 'What is the largest mammal on Earth?', answer: 'Blue whale' },
  { id: 'ani-12', category: 'animals', type: 'qa', text: 'What animal has the longest lifespan?', answer: 'Greenland shark (~400 years)' },
  { id: 'ani-13', category: 'animals', type: 'qa', text: 'How many legs does a lobster have?', answer: 'Ten' },
]
