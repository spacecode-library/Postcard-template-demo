export const backgroundImages = {
  cleaning: [
    {
      id: 'clean-carpet-1',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
      name: 'Clean Carpet Texture',
      credit: 'Unsplash'
    },
    {
      id: 'clean-floor-1',
      url: 'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=1200&h=800&fit=crop',
      name: 'Wooden Floor',
      credit: 'Unsplash'
    },
    {
      id: 'clean-home-1',
      url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&h=800&fit=crop',
      name: 'Clean Living Room',
      credit: 'Unsplash'
    },
    {
      id: 'clean-texture-1',
      url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&h=800&fit=crop',
      name: 'Soft Gradient',
      credit: 'Unsplash'
    },
    {
      id: 'clean-abstract-1',
      url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=800&fit=crop',
      name: 'Purple Gradient',
      credit: 'Unsplash'
    },
    {
      id: 'clean-minimal-1',
      url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&h=800&fit=crop',
      name: 'Colorful Gradient',
      credit: 'Unsplash'
    },
    {
      id: 'clean-fresh-1',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop',
      name: 'Fresh Fabric',
      credit: 'Unsplash'
    },
    {
      id: 'clean-bubbles-1',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
      name: 'Soap Bubbles',
      credit: 'Unsplash'
    }
  ],
  business: [
    {
      id: 'biz-office-1',
      url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop',
      name: 'Modern Office',
      credit: 'Unsplash'
    },
    {
      id: 'biz-abstract-1',
      url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=800&fit=crop',
      name: 'Blue Abstract',
      credit: 'Unsplash'
    }
  ],
  restaurant: [
    {
      id: 'food-table-1',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop',
      name: 'Restaurant Table',
      credit: 'Unsplash'
    },
    {
      id: 'food-ingredients-1',
      url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200&h=800&fit=crop',
      name: 'Fresh Ingredients',
      credit: 'Unsplash'
    }
  ]
};

export const getAllBackgrounds = () => {
  return Object.values(backgroundImages).flat();
};

export const getBackgroundsByCategory = (category) => {
  return backgroundImages[category] || [];
};