export const allergenList = [
  { code: 'Gluten', label: 'Gluten' },
  { code: 'Lactose', label: 'Lactose' },
  { code: 'FruitsNoix', label: 'Fruits à coque' },
  { code: 'Crustaces', label: 'Crustacés' },
  { code: 'Poisson', label: 'Poisson' },
  { code: 'Oeuf', label: 'Œuf' },
  { code: 'Arachide', label: 'Arachide' },
  { code: 'Soja', label: 'Soja' },
  { code: 'Sesame', label: 'Sésame' },
];

export const testimonials = [
  {
    id: 'avis-1',
    author: 'Claire & Mathieu',
    event: 'Mariage intimiste',
    quote:
      'Une équipe extraordinaire : écoute, flexibilité, professionnalisme. Le dîner a dépassé toutes nos attentes !',
    rating: 5,
  },
  {
    id: 'avis-2',
    author: 'Société Bordelaise',
    event: 'Séminaire annuel',
    quote:
      'Organisation impeccable pour 120 convives. Les ateliers culinaires ont marqué les esprits, merci !',
    rating: 5,
  },
  {
    id: 'avis-3',
    author: 'Famille D.',
    event: 'Brunch de Pâques',
    quote:
      'Menus adaptés aux allergies de nos enfants, livraison ponctuelle. Julie et José sont adorables.',
    rating: 4,
  },
];

export const users = [
  {
    id: 'admin',
    first_name: 'Julie',
    last_name: 'Martin',
    email: 'julie@vite-gourmand.fr',
    phone: '+33 6 12 34 56 78',
    address: '12 rue du Chai, 33000 Bordeaux',
    role: 'administrateur',
    password: 'Admin2025!',
  },
  {
    id: 'employee',
    first_name: 'José',
    last_name: 'Gomez',
    email: 'jose@vite-gourmand.fr',
    phone: '+33 6 98 76 54 32',
    address: '45 avenue des Epicuriens, 33200 Bordeaux',
    role: 'employe',
    password: 'Employe2025!',
  },
];

export const menus = [
  {
    id: 'menu-noel-signature',
    title: 'Menu Signature de Noël',
    description:
      'Un menu festif pensé pour émerveiller vos convives lors des fêtes de fin d’année, mettant à l’honneur les produits locaux de saison.',
    theme: 'Noël',
    regime: 'Classique',
    minimum_guests: 8,
    base_price: 520,
    price_per_additional_guest: 58,
    stock: 5,
    highlight: 'L’accord mets-vins peut être ajouté sur demande.',
    conditions_ordering:
      'Commande au minimum 10 jours avant la prestation pour garantir la disponibilité des produits festifs.',
    conditions_storage:
      'Prévoir un espace réfrigéré dédié. Les desserts glacés doivent rester à -18°C jusqu’au service.',
    conditions_notes: 'Inclut la livraison dans un rayon de 20 km autour de Bordeaux.',
    images: ['/assets/menu-noel-1.svg', '/assets/menu-noel-2.svg'],
    dishes: [
      {
        id: 'entree-foie-gras',
        name: 'Foie gras mi-cuit, chutney de figues',
        description: 'Servi avec pain d’épices maison légèrement toasté.',
        course_type: 'Entrée',
        is_signature: 1,
        allergens: ['Gluten', 'Lactose'],
      },
      {
        id: 'entree-saint-jacques',
        name: 'Noix de Saint-Jacques snackées, velouté de panais',
        description: 'Huile de truffe blanche et noisettes torréfiées.',
        course_type: 'Entrée',
        allergens: ['FruitsNoix', 'Poisson'],
      },
      {
        id: 'plat-chapon',
        name: 'Chapon fermier farci aux morilles',
        description: 'Jus corsé, mousseline de céleri et carottes confites.',
        course_type: 'Plat',
        is_signature: 1,
        allergens: ['Lactose'],
      },
      {
        id: 'plat-bar',
        name: 'Bar sauvage en croûte de sel',
        description: 'Beurre blanc au champagne, pommes Anna.',
        course_type: 'Plat',
        allergens: ['Lactose', 'Poisson'],
      },
      {
        id: 'dessert-buche',
        name: 'Bûche de Noël marron & poire',
        description: 'Meringue croustillante, mousse légère et insert fruité.',
        course_type: 'Dessert',
        is_signature: 1,
        allergens: ['Lactose', 'Oeuf'],
      },
      {
        id: 'dessert-sorbet',
        name: 'Duo de sorbets clémentine et épices douces',
        description: 'Servi avec tuile croustillante aux amandes.',
        course_type: 'Dessert',
        allergens: ['FruitsNoix'],
      },
    ],
  },
  {
    id: 'menu-paques-printanier',
    title: 'Menu Printanier de Pâques',
    description:
      'Une célébration gourmande des premiers légumes verts accompagnant des viandes délicates et des desserts légers.',
    theme: 'Pâques',
    regime: 'Classique',
    minimum_guests: 6,
    base_price: 360,
    price_per_additional_guest: 48,
    stock: 7,
    highlight: 'Version sans lactose disponible sur demande.',
    conditions_ordering:
      'Commande 7 jours avant la prestation. Possibilité d’adapter les plats aux enfants.',
    conditions_storage:
      'Entrées à conserver entre 0 et 4°C. Plats à réchauffer doucement au four à 120°C.',
    images: ['/assets/menu-paques-1.svg'],
    dishes: [
      {
        id: 'entree-asperges',
        name: 'Asperges vertes grillées, œuf parfait',
        description: 'Sauce hollandaise légère et croustillant de coppa.',
        course_type: 'Entrée',
        allergens: ['Oeuf'],
      },
      {
        id: 'entree-ceviche',
        name: 'Ceviche de dorade, agrumes et coriandre',
        description: 'Perles de yuzu et crumble salé.',
        course_type: 'Entrée',
        allergens: ['Poisson', 'Gluten'],
      },
      {
        id: 'plat-agneau',
        name: 'Selle d’agneau rôtie aux herbes',
        description: 'Polenta crémeuse au parmesan, primeurs glacés.',
        course_type: 'Plat',
        allergens: ['Lactose'],
      },
      {
        id: 'plat-risotto',
        name: 'Risotto crémeux à la fève et pecorino',
        description: 'Huile de basilic, chips de pancetta.',
        course_type: 'Plat',
        allergens: ['Lactose'],
      },
      {
        id: 'dessert-pavlova',
        name: 'Pavlova aux fruits rouges',
        description: 'Crème légère à la vanille et coulis de fraises.',
        course_type: 'Dessert',
        allergens: ['Oeuf'],
      },
      {
        id: 'dessert-tarte-citron',
        name: 'Tartelette au citron & basilic',
        description: 'Meringue italienne brûlée.',
        course_type: 'Dessert',
        allergens: ['Gluten', 'Lactose', 'Oeuf'],
      },
    ],
  },
  {
    id: 'menu-brunch-bien-etre',
    title: 'Brunch Bien-Être',
    description:
      'Une offre végétarienne gourmande et vitaminée pour accompagner vos événements matinaux ou vos lendemains de fête.',
    theme: 'Brunch',
    regime: 'Végétarien',
    minimum_guests: 10,
    base_price: 280,
    price_per_additional_guest: 24,
    stock: 12,
    highlight: 'Option jus détox pressé à froid incluse.',
    conditions_ordering: 'Commande minimum 5 jours avant. Livraison possible dès 8h.',
    conditions_storage:
      'Jus frais à consommer dans les 24h. Prévoir de la glace carbonique pour les smoothies.',
    images: ['/assets/menu-brunch-1.svg', '/assets/menu-brunch-2.svg'],
    dishes: [
      {
        id: 'entree-bowls',
        name: 'Bowls de quinoa aux légumes croquants',
        description: 'Pois chiches épicés, grenade, sauce tahini citronnée.',
        course_type: 'Entrée',
        allergens: ['Sesame'],
      },
      {
        id: 'entree-toast-avocat',
        name: 'Toasts avocat, feta et graines',
        description: 'Pain au levain, pickles d’oignons rouges.',
        course_type: 'Entrée',
        allergens: ['Gluten', 'FruitsNoix'],
      },
      {
        id: 'plat-shakshuka',
        name: 'Shakshuka aux épinards et pois verts',
        description: 'Servie avec yaourt grec et herbes fraîches.',
        course_type: 'Plat',
        allergens: ['Lactose', 'Oeuf'],
      },
      {
        id: 'plat-pancakes',
        name: 'Pancakes soufflés au lait d’amande',
        description: 'Sirop d’érable, fruits de saison et granola maison.',
        course_type: 'Plat',
        is_signature: 1,
        allergens: ['Gluten', 'FruitsNoix'],
      },
      {
        id: 'dessert-brownie',
        name: 'Brownie chocolat noir & noix de pécan',
        description: 'Version vegan disponible sur simple demande.',
        course_type: 'Dessert',
        allergens: ['FruitsNoix'],
      },
      {
        id: 'dessert-salade-fruits',
        name: 'Salade de fruits exotiques',
        description: 'Sirop léger au gingembre et citron vert.',
        course_type: 'Dessert',
      },
    ],
  },
  {
    id: 'menu-vegan-evenement',
    title: 'Menu Vegan Événementiel',
    description:
      'Une proposition 100% végétale, élégante et riche en saveurs, pensée pour les palais curieux et engagés.',
    theme: 'Événement',
    regime: 'Vegan',
    minimum_guests: 15,
    base_price: 690,
    price_per_additional_guest: 42,
    stock: 9,
    highlight: 'Certifié 100% bio et sans allergènes majeurs.',
    conditions_ordering:
      'Réservation 12 jours en amont afin d’assurer les approvisionnements spécifiques.',
    conditions_storage:
      'Plats livrés en contenants consignés. Retour des contenants sous 72h.',
    conditions_notes:
      'Une dégustation privée est offerte pour toute commande supérieure à 30 couverts.',
    images: ['/assets/menu-vegan-1.svg'],
    dishes: [
      {
        id: 'entree-terrine-legumes',
        name: 'Terrine de légumes rôtis, houmous fumé',
        description: 'Chapelure de noisettes torréfiées, huile verte.',
        course_type: 'Entrée',
        is_signature: 1,
        allergens: ['FruitsNoix', 'Sesame'],
      },
      {
        id: 'entree-tartare-betterave',
        name: 'Tartare de betterave et pomme granny',
        description: 'Crème d’amande et croustillant de quinoa.',
        course_type: 'Entrée',
        allergens: ['FruitsNoix'],
      },
      {
        id: 'plat-wellington',
        name: 'Wellington de champignons et patate douce',
        description: 'Pâte feuilletée végétale, jus de légumes racines.',
        course_type: 'Plat',
        allergens: ['Gluten'],
      },
      {
        id: 'plat-gnocchis',
        name: 'Gnocchis de potimarron, crème de cajou',
        description: 'Éclats de pistache et huile de sauge.',
        course_type: 'Plat',
        allergens: ['FruitsNoix'],
      },
      {
        id: 'dessert-dome-chocolat',
        name: 'Dôme chocolat intense et praliné noisette',
        description: 'Insert passion, biscuit cacao croustillant.',
        course_type: 'Dessert',
        allergens: ['FruitsNoix'],
      },
      {
        id: 'dessert-poire-epice',
        name: 'Poires pochées aux épices douces',
        description: 'Crème fouettée de coco, streusel cacao.',
        course_type: 'Dessert',
      },
    ],
  },
];
