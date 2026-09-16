import artwork1 from '../assets/images/art-work1.jpg';
import artwork2 from '../assets/images/art-work2.jpg';
import artwork3 from '../assets/images/art-work3.jpg';
import artwork4 from '../assets/images/art-work4.jpg';
import artwork5 from '../assets/images/art-work5.jpg';
import artwork6 from '../assets/images/art-work6.jpg';
import artwork7 from '../assets/images/art-work7.jpg';
import artwork8 from '../assets/images/art-work8.jpg';
import artwork9 from '../assets/images/art-work9.jpg';
import artwork10 from '../assets/images/art-work10.jpg';
import artwork11 from '../assets/images/art-work11.jpg';
import artwork12 from '../assets/images/art-work12.jpg';
import artwork13 from '../assets/images/art-work13.jpg';
import artwork14 from '../assets/images/art-work14.jpg';
import artwork15 from '../assets/images/art-work15.jpg';
import artwork16 from '../assets/images/art-work16.jpg';
import artwork17 from '../assets/images/art-work17.jpg';
import artwork18 from '../assets/images/art-work18.jpg';
import artwork19 from '../assets/images/art-work19.jpg';

export type ProjectCategory = 'social-media' | 'advertising' | 'posters' | 'branding' | 'campaign' | 'illustration';
export type ProjectLayout = 'featured' | 'portrait' | 'square' | 'landscape';

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: 'portrait' | 'square' | 'landscape';
};

export type Project = {
  id: string;
  slug: string;
  title: string | null;
  projectType: string;
  categories: ProjectCategory[];
  images: ProjectImage[];
  featured: boolean;
  layout: ProjectLayout;
};

export const categoryLabels: Record<ProjectCategory, string> = {
  'social-media': 'Social Media',
  advertising: 'Advertising',
  posters: 'Posters',
  branding: 'Branding',
  campaign: 'Campaign',
  illustration: 'Illustration',
};

export const projects: Project[] = [
  {
    id: 'social-media-campaign',
    slug: 'social-media-campaign',
    title: null,
    projectType: 'Social Media Campaign',
    categories: ['social-media', 'advertising', 'campaign'],
    images: [
      { src: artwork3, alt: 'Pink mobile app promotion featuring a phone, doughnuts and an illustrated character', width: 1280, height: 1280, aspectRatio: 'square' },
      { src: artwork4, alt: 'Pink social media promotion featuring a phone, iced coffee, doughnuts and an illustrated character', width: 1280, height: 1280, aspectRatio: 'square' },
    ],
    featured: true,
    layout: 'featured',
  },
  {
    id: 'cargo-information-design',
    slug: 'cargo-information-design',
    title: null,
    projectType: 'Commercial Visual Design',
    categories: ['advertising'],
    images: [
      { src: artwork1, alt: 'Red land cargo information design featuring a freight truck', width: 904, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'portrait',
  },
  {
    id: 'travel-poster',
    slug: 'travel-poster',
    title: null,
    projectType: 'Travel Poster Design',
    categories: ['posters', 'advertising'],
    images: [
      { src: artwork2, alt: 'Vintage travel poster featuring a white high-top sneaker, luggage and a compass', width: 1280, height: 1280, aspectRatio: 'square' },
    ],
    featured: true,
    layout: 'square',
  },
  {
    id: 'cargo-promotion',
    slug: 'cargo-promotion',
    title: null,
    projectType: 'Cargo Promotion',
    categories: ['social-media', 'advertising', 'campaign'],
    images: [
      { src: artwork5, alt: 'Success Cargo August promotion featuring a logistics coordinator, truck and warehouse', width: 1280, height: 1280, aspectRatio: 'square' },
    ],
    featured: true,
    layout: 'square',
  },
  {
    id: 'action-beverage-advertising',
    slug: 'action-beverage-advertising',
    title: null,
    projectType: 'Beverage Advertising',
    categories: ['advertising', 'campaign', 'posters'],
    images: [
      { src: artwork6, alt: 'Dark action-themed energy drink advertisement with a red can and superhero imagery', width: 1280, height: 1280, aspectRatio: 'square' },
    ],
    featured: true,
    layout: 'square',
  },
  {
    id: 'spring-water-advertising',
    slug: 'spring-water-advertising',
    title: null,
    projectType: 'Product Advertising',
    categories: ['advertising', 'posters'],
    images: [
      { src: artwork7, alt: 'Spring water advertisement set in a snowy alpine landscape', width: 904, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'portrait',
  },
  {
    id: 'fragrance-advertising',
    slug: 'fragrance-advertising',
    title: null,
    projectType: 'Fragrance Advertising',
    categories: ['advertising', 'posters'],
    images: [
      { src: artwork8, alt: 'Pink fragrance advertisement featuring a perfume bottle floating above a rose', width: 904, height: 1280, aspectRatio: 'portrait' },
      { src: artwork11, alt: 'Floral perfume advertisement with a glass bottle, pink petals and a soft studio setting', width: 1280, height: 1280, aspectRatio: 'square' },
    ],
    featured: true,
    layout: 'featured',
  },
  {
    id: 'haircare-advertising',
    slug: 'haircare-advertising',
    title: null,
    projectType: 'Haircare Advertising',
    categories: ['advertising', 'posters'],
    images: [
      { src: artwork9, alt: 'Black and gold haircare advertisement featuring glossy hair and product bottles', width: 1280, height: 1280, aspectRatio: 'square' },
      { src: artwork10, alt: 'Light blue haircare advertisement featuring a model and a shampoo bottle', width: 915, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'featured',
  },
  {
    id: 'entertainment-poster',
    slug: 'entertainment-poster',
    title: null,
    projectType: 'Entertainment Poster',
    categories: ['posters'],
    images: [
      { src: artwork12, alt: 'Dark superhero poster with a city skyline and layered comic texture', width: 1280, height: 904, aspectRatio: 'landscape' },
    ],
    featured: true,
    layout: 'landscape',
  },
  {
    id: 'coffee-advertising',
    slug: 'coffee-advertising',
    title: null,
    projectType: 'Coffee Advertising',
    categories: ['advertising', 'posters'],
    images: [
      { src: artwork13, alt: 'Coffee advertisement featuring a jar, cup, beans and a mountain landscape', width: 1280, height: 1280, aspectRatio: 'square' },
    ],
    featured: true,
    layout: 'square',
  },
  {
    id: 'food-promotion',
    slug: 'food-promotion',
    title: null,
    projectType: 'Food Promotion',
    categories: ['advertising', 'campaign', 'posters'],
    images: [
      { src: artwork14, alt: 'Red spicy chicken promotion featuring fried chicken and an order call to action', width: 904, height: 1280, aspectRatio: 'portrait' },
      { src: artwork15, alt: 'Healthy meal promotion featuring grilled chicken, vegetables, grains and avocado', width: 904, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'featured',
  },
  {
    id: 'energy-drink-poster',
    slug: 'energy-drink-poster',
    title: null,
    projectType: 'Energy Drink Poster',
    categories: ['advertising', 'posters'],
    images: [
      { src: artwork16, alt: 'Green energy drink poster featuring a can in a dark rocky environment', width: 904, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'portrait',
  },
  {
    id: 'editorial-illustrations',
    slug: 'editorial-illustrations',
    title: null,
    projectType: 'Editorial Illustration',
    categories: ['posters','illustration'],
    images: [
      { src: artwork17, alt: "Textured Father's Day illustration of a parent and child riding a bicycle", width: 720, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'featured',
  },
  {
    id: 'visual-narratives',
    slug: 'visual-narratives',
    title: null,
    projectType: 'Visual Narratives',
    categories: ['posters'],
    images: [
      { src: artwork18, alt: 'Warm-toned expressive movement poster featuring a dancer in motion', width: 853, height: 1280, aspectRatio: 'portrait' },
      { src: artwork19, alt: 'Dreamlike editorial illustration of a person seated on a flower-covered hill', width: 905, height: 1280, aspectRatio: 'portrait' },
    ],
    featured: true,
    layout: 'featured',
  },
];
