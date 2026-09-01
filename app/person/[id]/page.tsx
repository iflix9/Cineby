import { Metadata } from 'next';
import Image from 'next/image';
import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { PersonDetails, PersonCombinedCredits, Media } from '@/types/tmdb';
import { BackButton } from '@/components/features/back-button';
import { MovieCard } from '@/components/ui/movie-card';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await fetchTMDB<PersonDetails>(`/person/${id}`);
    return {
      title: `${person.name} - Cineby`,
      description: person.biography || `Details about ${person.name}`,
    };
  } catch (e) {
    return {
      title: 'Person Not Found - Cineby',
    };
  }
}

function formatDateAndAge(dateToFormat: string | null, birthDateStr: string | null, deathDateStr?: string | null) {
  if (!dateToFormat) return '';
  const date = new Date(dateToFormat);
  if (isNaN(date.getTime())) return dateToFormat;
  
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);
  
  if (!birthDateStr) return formattedDate;
  
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return formattedDate;

  const endDate = deathDateStr ? new Date(deathDateStr) : new Date();
  
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const m = endDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return `${formattedDate} (${age} years old)`;
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let person: PersonDetails | null = null;
  let credits: PersonCombinedCredits | null = null;
  
  try {
    person = await fetchTMDB<PersonDetails>(`/person/${id}`);
    credits = await fetchTMDB<PersonCombinedCredits>(`/person/${id}/combined_credits`);
  } catch (error) {
    console.error('Failed to fetch person details:', error);
  }

  if (!person) {
    return (
      <div className="relative min-h-screen pt-24 px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center bg-zinc-950">
        <h1 className="text-2xl font-bold text-white mb-4">Person not found</h1>
        <BackButton />
      </div>
    );
  }

  // Sort credits by popularity or release date
  const allCredits = credits ? [...credits.cast, ...credits.crew] : [];
  
  // Deduplicate and filter credits (they can be both cast and crew for same media)
  const uniqueCreditsMap = new Map<number, Media>();
  allCredits.forEach(credit => {
    // TMDB combined credits returns items with media_type
    if (credit.media_type) {
      if (!uniqueCreditsMap.has(credit.id)) {
        uniqueCreditsMap.set(credit.id, credit as unknown as Media);
      }
    }
  });

  const uniqueCreditsList = Array.from(uniqueCreditsMap.values());
  // Sort by popularity to show most known works first
  uniqueCreditsList.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  
  // Take top 20 for "Known For"
  const knownFor = uniqueCreditsList.slice(0, 20);

  return (
    <div className="relative min-h-screen pb-24 md:pb-32 pt-24 md:pt-32 bg-zinc-950">
      <BackButton />
      
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Left Column: Photo and Personal Info */}
        <div className="md:w-[300px] shrink-0 flex flex-col items-center md:items-start">
          <div className="relative w-full max-w-[240px] md:max-w-full aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl mb-6">
            <Image 
              src={getImageUrl(person.profile_path, 'w500')}
              alt={person.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 240px, 300px"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="w-full text-center md:text-left hidden md:block">
            <h3 className="text-lg font-bold text-white mb-4">Personal Info</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-400">Known For</h4>
                <p className="text-sm text-zinc-100">{person.known_for_department}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-zinc-400">Gender</h4>
                <p className="text-sm text-zinc-100">{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Not specified'}</p>
              </div>
              
              {person.birthday && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400">Birthday</h4>
                  <p className="text-sm text-zinc-100">{formatDateAndAge(person.birthday, person.birthday, person.deathday)}</p>
                </div>
              )}
              
              {person.deathday && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400">Day of Death</h4>
                  <p className="text-sm text-zinc-100">{formatDateAndAge(person.deathday, person.birthday, person.deathday)}</p>
                </div>
              )}
              
              {person.place_of_birth && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400">Place of Birth</h4>
                  <p className="text-sm text-zinc-100">{person.place_of_birth}</p>
                </div>
              )}
              
              {person.also_known_as && person.also_known_as.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400">Also Known As</h4>
                  <div className="flex flex-col gap-1 mt-1">
                    {person.also_known_as.map((name, i) => (
                      <span key={i} className="text-sm text-zinc-100">{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column: Name, Bio, Known For */}
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 text-center md:text-left tracking-tight">
            {person.name}
          </h1>
          
          {/* Mobile Personal Info Summary (only visible on mobile) */}
          <div className="md:hidden flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6 text-sm text-zinc-300">
            {person.known_for_department && <span>{person.known_for_department}</span>}
            {person.birthday && (
              <>
                <span className="text-zinc-600">&bull;</span>
                <span>Born: {person.birthday.split('-')[0]}</span>
              </>
            )}
            {person.place_of_birth && (
              <>
                <span className="text-zinc-600">&bull;</span>
                <span>{person.place_of_birth}</span>
              </>
            )}
          </div>
          
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-3">Biography</h3>
            <div className="text-zinc-300 text-sm sm:text-base leading-relaxed space-y-4">
              {person.biography ? (
                person.biography.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p className="italic text-zinc-500">We don&apos;t have a biography for {person.name}.</p>
              )}
            </div>
          </div>
          
          {knownFor.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-red-600 rounded-sm"></div>
                <h3 className="text-xl font-bold text-white">Known For</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {knownFor.map((media) => (
                  <MovieCard key={`${media.media_type}-${media.id}`} media={media} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
