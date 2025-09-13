import LaundryProTemplate from './LaundryProTemplate';
import SparkleHomeTemplate from './SparkleHomeTemplate';
import PetFriendlyTemplate from './PetFriendlyTemplate';

export const postcardTemplates = [
  {
    id: 'laundry-pro',
    name: 'Laundry Pro',
    description: 'Modern laundry service with multiple offers',
    category: 'cleaning',
    component: LaundryProTemplate,
    thumbnail: '/template-thumbnails/laundry-pro.jpg',
    defaultData: {
      businessName: 'ABC LAUNDRY',
      headline: 'DROP OFF YOUR',
      subheadline: 'DRY CLEANING!',
      services: [
        { title: 'FREE', description: 'Single Item Cleaning', disclaimer: 'With this card' },
        { title: 'FREE', description: 'Soap for One Wash', disclaimer: 'With this card' },
        { title: 'FREE', description: 'Drying on Monday', disclaimer: 'With this card' },
        { title: 'FREE', description: 'Folding for 10 Items', disclaimer: 'With this card' }
      ],
      phone: '1-800-628-1804',
      website: 'www.website.com',
      callToAction: 'CALL OR VISIT US TODAY!'
    }
  },
  {
    id: 'sparkle-home',
    name: 'Sparkle Home',
    description: 'Premium home cleaning with special offer',
    category: 'cleaning',
    component: SparkleHomeTemplate,
    thumbnail: '/template-thumbnails/sparkle-home.jpg',
    defaultData: {
      businessName: 'ABC CLEANING',
      headline: 'MAKE YOUR HOME',
      subheadline: 'sparkle with',
      tagline: 'PREMIUM',
      mainText: 'CLEANING SERVICES!',
      offerAmount: '$100 OFF',
      offerDescription: 'your first deep clean',
      offerDisclaimer: 'See back for details',
      services: ['Residential Cleaning', 'Deep Cleaning', 'Move In/Out Cleaning'],
      phone: '1-800-628-1804',
      website: 'www.website.com',
      callToAction: 'Call or visit us online to book your service!'
    }
  },
  {
    id: 'pet-friendly',
    name: 'Pet Friendly',
    description: 'Playful design for pet-related cleaning services',
    category: 'cleaning',
    component: PetFriendlyTemplate,
    thumbnail: '/template-thumbnails/pet-friendly.jpg',
    defaultData: {
      businessName: 'ABC CARPET CLEANING',
      headlineTop: "Don't let",
      headlineMain1: 'Food Stains',
      headlineMain2: 'Crayons or',
      headlineMain3: 'Dirty Paws',
      headlineBottom: 'ruin your carpets',
      offer: '1 Room Cleaned FREE!',
      offerDisclaimer: 'See back for details.',
      phone: '1-800-628-1804',
      website: 'www.website.com',
      callToAction: 'Call or visit us online today!'
    }
  }
];

export default postcardTemplates;