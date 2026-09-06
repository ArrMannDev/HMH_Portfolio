import { useMemo, useState } from 'react';
import { categoryLabels, projects, type Project, type ProjectCategory } from '../data/projects';
import DepthCarousel, { type DepthCarouselItem } from './DepthCarousel';
import ArtworkDialog from './ArtworkDialog';

type Filter = 'all' | ProjectCategory;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'posters', label: 'Posters' },
  { value: 'branding', label: 'Branding' },
  { value: 'campaign', label: 'Campaign' },
];

export default function SelectedWork() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [preview, setPreview] = useState<{ project: Project; imageIndex: number } | null>(null);
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = activeFilter === 'all'
    ? featuredProjects
    : featuredProjects.filter((project) => project.categories.includes(activeFilter));
  const carouselItems = useMemo<DepthCarouselItem[]>(() => visibleProjects.flatMap((project) => (
    project.images.map((image, imageIndex) => ({
      image: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      projectId: project.id,
      imageIndex,
      imageCount: project.images.length,
    }))
  )), [visibleProjects]);
  const [activeSlide, setActiveSlide] = useState(0);
  const activeItem = carouselItems[activeSlide] ?? carouselItems[0];
  const activeProject = activeItem
    ? visibleProjects.find((project) => project.id === activeItem.projectId)
    : undefined;

  const changeFilter = (filter: Filter) => {
    setActiveFilter(filter);
    setActiveSlide(0);
  };

  return (
    <section id="work" className="work-section" aria-labelledby="work-title">
      <div className="work-inner">
        <header className="work-heading">
          <p className="work-label">Selected work</p>
          <h2 id="work-title" className="work-title">Work that speaks visually.</h2>
          <p className="work-copy">A selection of visual work created for brands, campaigns and ideas.</p>
        </header>

        <div className="work-filters" role="group" aria-label="Filter selected work by category">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`work-filter${activeFilter === filter.value ? ' is-active' : ''}`}
              type="button"
              aria-pressed={activeFilter === filter.value}
              onClick={() => changeFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleProjects.length > 0 ? (
          <div className="work-carousel-layout">
            <div className="work-carousel-shell">
              <DepthCarousel
                key={activeFilter}
                items={carouselItems}
                cardWidth={440}
                cardHeight={520}
                radius={16}
                tint="#161514"
                depth={190}
                spread={82}
                tilt={18}
                perspective={1400}
                visibleCards={3}
                falloff={0.14}
                blur={2}
                autoplay={false}
                loop
                onChange={(index) => setActiveSlide(index)}
                onItemClick={(item) => {
                  const project = projects.find((entry) => entry.id === item.projectId);
                  if (project) setPreview({ project, imageIndex: item.imageIndex });
                }}
              />
            </div>

            {activeProject && activeItem && (
              <article
                className="work-active-meta"
                data-project-slug={activeProject.slug}
                aria-live="polite"
              >
                <div>
                  <h3 className="work-project-title">
                    {activeProject.title ?? <span>[Project title needed]</span>}
                  </h3>
                  <p className="work-project-type">{activeProject.projectType}</p>
                  {activeItem.imageCount > 1 && (
                    <p className="work-image-position">
                      Campaign image {activeItem.imageIndex + 1} of {activeItem.imageCount}
                    </p>
                  )}
                </div>
                <ul className="work-categories" aria-label="Project categories">
                  {activeProject.categories.map((category) => (
                    <li key={category}>{categoryLabels[category]}</li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        ) : (
          <div className="work-empty" role="status">
            <p>No featured {categoryLabels[activeFilter as ProjectCategory].toLowerCase()} project has been added yet.</p>
          </div>
        )}
      </div>
      {preview && (
        <ArtworkDialog
          project={preview.project}
          initialIndex={preview.imageIndex}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
