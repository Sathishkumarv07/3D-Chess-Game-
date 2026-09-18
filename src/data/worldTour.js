// World Tour Data: Countries, Masters, Venues, and Passport System

export const WORLD_COUNTRIES = [
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    city: 'New Delhi / Chennai',
    venueName: 'Chaturanga Royal Palace',
    venueDesc: 'The ancient birthplace of chess in the 6th century. Played upon sandalwood and ivory in majestic royal courtyards.',
    boardTheme: 'india_palace',
    environment: 'india_palace',
    difficulty: 'master',
    master: {
      name: 'Master Anand',
      title: 'Grandmaster',
      rating: 1950,
      avatar: '👑',
      playstyle: 'Lightning Tactician & Dynamic Openings',
      favoriteOpening: "King's Indian & Sicilian Defense",
      quote: 'Chess is a sea in which a gnat may drink and an elephant may bathe. Welcome to its birthplace!',
      winQuote: 'Spectacular tactical vision! You honor the heritage of Chaturanga.',
      lossQuote: 'The ancient masters taught us that patience precedes power. Try again!'
    },
    stampBadge: '🪷',
    stampColor: '#ff9933',
    rewardXp: 500
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    city: 'Kyoto',
    venueName: 'Kyoto Zen Garden Pavilion',
    venueDesc: 'Serene Tatami matting and minimalist bamboo aesthetics surrounded by stone lanterns and falling cherry blossom petals.',
    boardTheme: 'japan_zen',
    environment: 'japan_zen',
    difficulty: 'difficult',
    master: {
      name: 'Sensei Kenji',
      title: 'National Master',
      rating: 1650,
      avatar: '🌸',
      playstyle: 'Patient Fortress & Shogi-Inspired Precision',
      favoriteOpening: 'Caro-Kann Defense',
      quote: 'Like falling cherry blossoms, every chess move must be deliberate, graceful, and irrevocable.',
      winQuote: 'Impressive composure. Your mind remains unclouded by haste.',
      lossQuote: 'In stillness, one finds clarity. Steady your breath and challenge me once more.'
    },
    stampBadge: '⛩️',
    stampColor: '#f43f5e',
    rewardXp: 350
  },
  {
    id: 'russia',
    name: 'Russia',
    flag: '🇷🇺',
    city: 'Moscow',
    venueName: 'Soviet Grandmaster Hall',
    venueDesc: 'Historic 1980s championship arena featuring heavy polished walnut tables, vintage green tournament lamps, and deep strategic tension.',
    boardTheme: 'russia_hall',
    environment: 'russia_hall',
    difficulty: 'master',
    master: {
      name: 'GM Garry',
      title: 'Super Grandmaster',
      rating: 2150,
      avatar: '🐻',
      playstyle: 'Ferocious Attacker & Concrete Calculation',
      favoriteOpening: "Queen's Gambit & Najdorf Sicilian",
      quote: 'Chess is mental torture! Prepare for deep calculation and unrelenting pressure.',
      winQuote: 'Incredible depth! You calculated through my assault like a true world champion.',
      lossQuote: 'Weak squares cannot hide from deep analysis. Back to the training board!'
    },
    stampBadge: '⭐',
    stampColor: '#dc2626',
    rewardXp: 750
  },
  {
    id: 'iceland',
    name: 'Iceland',
    flag: '🇮🇸',
    city: 'Reykjavik',
    venueName: 'Reykjavik Frost Arena',
    venueDesc: 'Commemorating the historic 1972 Match of the Century under the ethereal glow of the Arctic Aurora Borealis.',
    boardTheme: 'iceland_frost',
    environment: 'iceland_frost',
    difficulty: 'master',
    master: {
      name: 'Champion Magnus',
      title: 'World Champion',
      rating: 2300,
      avatar: '❄️',
      playstyle: 'Relentless Positional Squeeze & Endgame Perfection',
      favoriteOpening: 'Ruy Lopez & English Opening',
      quote: 'I enjoy squeezing water from stone. In the endgame, there is nowhere to hide.',
      winQuote: 'Outstanding conversion! That was an endgame performance worthy of a grandmaster.',
      lossQuote: 'A single microscopic concession is all I need in the endgame. Good fight.'
    },
    stampBadge: '❄️',
    stampColor: '#06b6d4',
    rewardXp: 1000
  },
  {
    id: 'egypt',
    name: 'Egypt',
    flag: '🇪🇬',
    city: 'Cairo / Luxor',
    venueName: "Pharaoh's Obsidian Chamber",
    venueDesc: 'Deep sandstone catacombs illuminated by flickering torchlight, played upon volcanic black obsidian and gold-veined lapis lazuli.',
    boardTheme: 'egypt_pharaoh',
    environment: 'egypt_pharaoh',
    difficulty: 'difficult',
    master: {
      name: 'Master Ramses',
      title: 'Pharaoh of the Board',
      rating: 1720,
      avatar: '🏺',
      playstyle: 'Ancient Traps & Mysterious Gambits',
      favoriteOpening: 'Scotch Game & King’s Gambit',
      quote: 'The royal game of Senet walked before Chess. Will your pieces survive the judgment of the gods?',
      winQuote: 'The golden scarab smiles upon your intellect. You have conquered the desert sands!',
      lossQuote: 'Your pieces have been claimed by the dunes of eternity. Rise again!'
    },
    stampBadge: '𓂀',
    stampColor: '#eab308',
    rewardXp: 400
  },
  {
    id: 'england',
    name: 'England',
    flag: '🇬🇧',
    city: 'London',
    venueName: 'Simpson’s-in-the-Strand Club',
    venueDesc: 'The cradle of 19th-century romantic chess and The Immortal Game. Polished boxwood, antique rosewood, and rain tapping on stained glass.',
    boardTheme: 'england_club',
    environment: 'england_club',
    difficulty: 'difficult',
    master: {
      name: 'Sir Henry',
      title: 'Gentleman Master',
      rating: 1820,
      avatar: '🎩',
      playstyle: 'Romantic Era Sacrifices & Classical Principles',
      favoriteOpening: "Evans Gambit & Italian Game",
      quote: 'A true gentleman never refuses a gambit, nor misses an opportunity for a brilliant queen sacrifice.',
      winQuote: 'Jolly good show! A most splendid display of romantic chess wizardry!',
      lossQuote: 'A gallant try, old chap. Shall we order another pot of tea and have another go?'
    },
    stampBadge: '🦁',
    stampColor: '#6366f1',
    rewardXp: 450
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    city: 'Paris',
    venueName: 'Café de la Régence',
    venueDesc: 'The world-famous Parisian coffeehouse where Philidor, Voltaire, Rousseau, and Morphy forged modern chess theory over bistro marble tables.',
    boardTheme: 'france_bistro',
    environment: 'france_bistro',
    difficulty: 'difficult',
    master: {
      name: 'Maître Sophie',
      title: 'Academy Strategist',
      rating: 1680,
      avatar: '🥐',
      playstyle: 'Philidor Pawn Chains & French Defense Mastery',
      favoriteOpening: 'French Defense & Queen’s Indian',
      quote: 'Pawns are the soul of chess! Align them with care, and the kingdom will flourish.',
      winQuote: 'Magnifique! Your pawn skeleton was unbreakable and your endgame sublime.',
      lossQuote: 'Your structure faltered in the center, mon ami. Study Philidor once more!'
    },
    stampBadge: '⚜️',
    stampColor: '#3b82f6',
    rewardXp: 380
  },
  {
    id: 'brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    city: 'Rio de Janeiro',
    venueName: 'Copacabana Samba Arena',
    venueDesc: 'High-energy tropical venue with emerald rainforest hues, golden sunlit sand, and daring improvisational chess rhythm.',
    boardTheme: 'brazil_rio',
    environment: 'brazil_rio',
    difficulty: 'hard',
    master: {
      name: 'Mestre Lucas',
      title: 'Carnival Champion',
      rating: 1550,
      avatar: '🦜',
      playstyle: 'Wild Fireworks, Flank Attacks & Samba Rhythm',
      favoriteOpening: 'Sicilian Dragon & Grand Prix Attack',
      quote: 'Chess without rhythm is boring! Let’s dance across the sixty-four squares!',
      winQuote: 'Que beleza! You danced right through my blitzkrieg attack! Parabéns!',
      lossQuote: 'Too slow for the samba! Quicken your tactical tempo and join the dance again!'
    },
    stampBadge: '🌴',
    stampColor: '#22c55e',
    rewardXp: 300
  }
];

const PASSPORT_STORAGE_KEY = 'chessx_world_passport';

export function getPassportStamps() {
  try {
    const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordPassportWin(countryId) {
  try {
    const stamps = getPassportStamps();
    stamps[countryId] = {
      unlockedAt: Date.now(),
      wins: (stamps[countryId]?.wins || 0) + 1
    };
    localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(stamps));
    return stamps;
  } catch {
    return {};
  }
}
