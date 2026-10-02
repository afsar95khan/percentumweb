export interface BlogPost {
  slug: string;
  image: string;
  date: string;
  title: string;
  summary: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'forstaelse-av-lanerenter',
    image: '/assets/blog-laptop.jpg',
    date: 'June 25, 2023',
    title: 'Forståelse av lånerenter gjort enkelt',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'lan-forklart',
    image: '/assets/about-workspace.png',
    date: 'June 25, 2023',
    title: 'Lån forklart: En nybegynnerguide til å låne penger',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'mote-med-banken',
    image: '/assets/blog-finance.jpg',
    date: 'June 25, 2023',
    title: 'Slik forbereder du deg på et møte med banken',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'for-du-soker-lan',
    image: '/assets/blog-paperwork.jpg',
    date: 'June 25, 2023',
    title: 'Dette bør du vite før du søker om lån',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'sammenligne-lanetilbud',
    image: '/assets/blog-laptop.jpg',
    date: 'June 25, 2023',
    title: 'Sammenlign lånetilbud og finn gode vilkår',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'oversikt-over-okonomien',
    image: '/assets/blog-finance.jpg',
    date: 'June 25, 2023',
    title: 'Få bedre oversikt over økonomien din',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'refinansiering',
    image: '/assets/blog-finance.jpg',
    date: 'June 25, 2023',
    title: 'Refinansiering: Når kan det lønne seg?',
    summary: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets.",
  },
  {
    slug: 'hvor-mye-kan-du-lane',
    image: '/assets/blog-laptop.jpg',
    date: 'June 25, 2023',
    title: 'Hva påvirker hvor mye du kan låne?',
    summary: 'Banken vurderer flere sider av økonomien når den ser på låneevne.',
  },
  {
    slug: 'dokumentasjon-til-lanesoknad',
    image: '/assets/blog-paperwork.jpg',
    date: 'June 25, 2023',
    title: 'Dokumentene du trenger til lånesøknaden',
    summary: 'En oversikt over dokumentasjonen som vanligvis gjør søknadsprosessen enklere.',
  },
  {
    slug: 'crowdfunding-finansiering',
    image: '/assets/about-crowdfunding.png',
    date: 'July 2, 2023',
    title: 'Crowdfunding som finansieringsmulighet',
    summary: 'Hvordan en bredere investorbase kan være et supplement til tradisjonell finansiering.',
  },
  {
    slug: 'bankens-lanevurdering',
    image: '/assets/blog-finance.jpg',
    date: 'July 9, 2023',
    title: 'Slik vurderer banken en lånesøknad',
    summary: 'Innsikt i hvilke faktorer som ofte inngår i bankens vurdering av en søknad.',
  },
  {
    slug: 'egenkapital-og-boligkjop',
    image: '/assets/blog-paperwork.jpg',
    date: 'July 16, 2023',
    title: 'Egenkapital og boligkjøp: En enkel oversikt',
    summary: 'Forstå hvordan egenkapital påvirker boligkjøpet og finansieringsbehovet ditt.',
  },
  {
    slug: 'fast-eller-flytende-rente',
    image: '/assets/blog-laptop.jpg',
    date: 'July 23, 2023',
    title: 'Fast eller flytende rente – hva bør du velge?',
    summary: 'Vi forklarer forskjeller du kan vurdere når du velger rentetype.',
  },
  {
    slug: 'finansiering-for-bedrifter',
    image: '/assets/blog-finance.jpg',
    date: 'July 30, 2023',
    title: 'Finansiering for små og mellomstore bedrifter',
    summary: 'En introduksjon til vanlige finansieringsbehov og løsninger for bedrifter.',
  },
  {
    slug: 'budsjett-for-laneopptak',
    image: '/assets/blog-paperwork.jpg',
    date: 'August 6, 2023',
    title: 'Slik lager du et godt budsjett før låneopptak',
    summary: 'Et realistisk budsjett hjelper deg å vurdere hvor stort lån økonomien tåler.',
  },
  {
    slug: 'prosjektfinansiering-eiendom',
    image: '/assets/about-crowdfunding.png',
    date: 'August 13, 2023',
    title: 'Prosjektfinansiering for eiendom',
    summary: 'Viktige hensyn når du skal planlegge finansiering av et eiendomsprosjekt.',
  },
  {
    slug: 'effektiv-rente',
    image: '/assets/blog-laptop.jpg',
    date: 'August 20, 2023',
    title: 'Hva betyr effektiv rente?',
    summary: 'Se hvordan effektiv rente kan gjøre kostnadene ved ulike lån lettere å sammenligne.',
  },
  {
    slug: 'okonomisk-trygghet',
    image: '/assets/blog-finance.jpg',
    date: 'August 27, 2023',
    title: 'Gode råd på veien mot økonomisk trygghet',
    summary: 'Noen enkle grep for å skape bedre oversikt og trygghet rundt økonomien.',
  },
];
