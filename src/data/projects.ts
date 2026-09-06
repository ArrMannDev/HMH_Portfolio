import artwork1 from '../assets/images/art-work1.jpg';
import artwork2 from '../assets/images/art-work2.jpg';
import artwork3 from '../assets/images/art-work3.jpg';
import artwork4 from '../assets/images/art-work4.jpg';

export type ProjectCategory = 'social-media' | 'advertising' | 'posters' | 'branding' | 'campaign';
export type ProjectLayout = 'featured' | 'portrait' | 'square';

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: 'portrait' | 'square';
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
};

export const projects: Project[] = [
  {
    id: 'featured-project-03',
    slug: 'featured-project-03',
    title: null,
    projectType: 'Social Media Campaign',
    categories: ['social-media', 'advertising', 'campaign'],
    images: [
      {
        src: artwork3,
        alt: 'Pink mobile app promotion featuring a phone, doughnuts and an illustrated character',
        width: 1280,
        height: 1280,
        aspectRatio: 'square',
      },
      {
        src: artwork4,
        alt: 'Pink social media promotion featuring a phone, iced coffee, doughnuts and an illustrated character',
        width: 1280,
        height: 1280,
        aspectRatio: 'square',
      },
    ],
    featured: true,
    layout: 'featured',
  },
  {
    id: 'featured-project-01',
    slug: 'featured-project-01',
    title: null,
    projectType: 'Commercial Visual Design',
    categories: ['advertising'],
    images: [
      {
        src: artwork1,
        alt: 'Red land cargo information design featuring a freight truck',
        width: 904,
        height: 1280,
        aspectRatio: 'portrait',
      },
    ],
    featured: true,
    layout: 'portrait',
  },
  {
    id: 'featured-project-02',
    slug: 'featured-project-02',
    title: null,
    projectType: 'Poster Design',
    categories: ['posters', 'advertising'],
    images: [
      {
        src: artwork2,
        alt: 'Vintage travel poster composition featuring a white high-top sneaker, luggage and a compass',
        width: 1280,
        height: 1280,
        aspectRatio: 'square',
      },
    ],
    featured: true,
    layout: 'square',
  },
];
