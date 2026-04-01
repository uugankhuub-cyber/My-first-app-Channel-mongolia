import { Category, ContentItem, Quote } from './types';

export const TRANSLATIONS = {
  mn: {
    nav_home: "Нүүр",
    nav_categories: "Ангилал",
    nav_video: "Видео",
    nav_about: "Бидний тухай",
    search_placeholder: "Мэдлэг, баримт, түүх, технологи хайх...",
    login: "Нэвтрэх",
    hero_title: "Сонирхолтой мэдлэгийг",
    hero_title_highlight: "энгийнээр",
    hero_subtitle: "Өдөр бүр шинэ сонин хачин баримт, шинжлэх ухаан, түүхийн тайлбарууд",
    featured: "Онцлох мэдлэг",
    latest: "Шинээр нэмэгдсэн",
    trending: "Тренд мэдлэг",
    view_all: "Бүгдийг үзэх",
    did_you_know: "Та мэдэх үү?",
    join_us: "Бидэнтэй нэгдээрэй",
    join_text: "Шинэ мэдлэгийг цаг алдалгүй аваарай.",
    follow: "Дагах",
    views: "үзсэн",
    min_read: "минут",
    watch: "Үзэх",
    read: "Унших",
    like: "Таалагдлаа",
    share: "Хуваалцах",
    save: "Хадгалах",
    related: "Төстэй мэдлэгүүд",
    admin: "Админ",
    ad_space: "Сурталчилгаа",
    sort_by: "Эрэмбэлэх:",
    newest: "Шинэ нь эхэндээ",
    all_knowledge: "Бүх мэдлэг",
    no_results: "Илэрц олдсонгүй.",
    search_results: "Илэрц:",
    footer_desc: "Сонирхолтой баримт, шинжлэх ухаан, технологийн мэдлэгийг хамгийн энгийнээр.",
    links: "Холбоос",
    contact: "Холбоо барих",
    privacy: "Нууцлалын бодлого",
    terms: "Үйлчилгээний нөхцөл",
    copyright: "2025 Channel Mongolia. Бүх эрх хуулиар хамгаалагдсан.",
    
    // Pages
    contact_title: "Холбоо барих",
    contact_name: "Таны нэр",
    contact_email: "И-мэйл хаяг",
    contact_message: "Зурвас",
    contact_send: "Илгээх",
    privacy_title: "Нууцлалын бодлого",
    terms_title: "Үйлчилгээний нөхцөл",
    video_knowledge: "Видео мэдлэг",

    // Theme
    theme_dark: "Харанхуй горим",
    theme_light: "Өдрийн горим",

    // Sidebar Titles
    sb_most_viewed: "Хамгийн их үзэлттэй мэдээлэл",
    sb_trending: "Өнөөдрийн тренд",
    sb_editors_pick: "Редакторын онцлох",
    sb_categories: "Ангиллаар үзэх",
    sb_latest: "Сүүлд нэмэгдсэн",
    sb_quote: "Өнөөдрийн бодол",
    sb_time_filter: "Цаг хугацаагаар",
    sb_read_time: "Унших хугацаа",
    sb_saved: "Хамгийн их хадгалсан",
    
    time_just_now: "Саяхан",
    time_hours_ago: "цагийн өмнө",
    read_min: "мин уншина",
    published_date: "Нийтэлсэн огноо",
    view_count: "Үзсэн тоо",

    // New Features
    recommended_for_you: "Танд санал болгох мэдлэг",
    recommended_desc: "Таны сонирхолд тулгуурласан контент",
    daily_knowledge: "Өнөөдрийн мэдлэг",
    daily_feedback_q: "Энэ танд сонирхолтой байв уу?",
    daily_yes: "Таалагдсан",
    daily_no: "Таалагдаагүй",
    daily_thanks: "Баярлалаа! Бид танд илүү тохирох мэдээллийг хүргэх болно.",
    quiz_title: "Хариу нь юу вэ?",
    quiz_reveal: "Хариуг харах",
    quiz_hide: "Хариуг нуух",
    loading: "Уншиж байна...",
    back: "Буцах"
  },
  en: {
    nav_home: "Home",
    nav_categories: "Categories",
    nav_video: "Video",
    nav_about: "About Us",
    search_placeholder: "Search for knowledge, facts, history...",
    login: "Sign In",
    hero_title: "Interesting knowledge,",
    hero_title_highlight: "simply explained",
    hero_subtitle: "Daily interesting facts, science, and historical explanations.",
    featured: "Featured",
    latest: "Latest",
    trending: "Trending",
    view_all: "View All",
    did_you_know: "Did you know?",
    join_us: "Join Us",
    join_text: "Get the latest knowledge without delay.",
    follow: "Follow",
    views: "views",
    min_read: "min",
    watch: "Watch",
    read: "Read",
    like: "Like",
    share: "Share",
    save: "Save",
    related: "Related",
    admin: "Admin",
    ad_space: "Advertisement",
    sort_by: "Sort by:",
    newest: "Newest first",
    all_knowledge: "All Knowledge",
    no_results: "No results found.",
    search_results: "Results:",
    footer_desc: "Interesting facts, science, and technology knowledge explained simply.",
    links: "Links",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    copyright: "2025 Channel Mongolia. All rights reserved.",
    
    // Pages
    contact_title: "Contact Us",
    contact_name: "Your Name",
    contact_email: "Email Address",
    contact_message: "Message",
    contact_send: "Send",
    privacy_title: "Privacy Policy",
    terms_title: "Terms of Service",
    video_knowledge: "Video Knowledge",

    // Theme
    theme_dark: "Dark Mode",
    theme_light: "Light Mode",

    // Sidebar Titles
    sb_most_viewed: "Most Viewed",
    sb_trending: "Trending Today",
    sb_editors_pick: "Editor's Pick",
    sb_categories: "Browse Categories",
    sb_latest: "Latest Updates",
    sb_quote: "Thought of the Day",
    sb_time_filter: "Time Filter",
    sb_read_time: "Reading Time",
    sb_saved: "Most Saved",

    time_just_now: "Just now",
    time_hours_ago: "hours ago",
    read_min: "min read",
    published_date: "Published Date",
    view_count: "Views",

    // New Features
    recommended_for_you: "Recommended for You",
    recommended_desc: "Content based on your interests",
    daily_knowledge: "Today's Knowledge",
    daily_feedback_q: "Was this interesting?",
    daily_yes: "Yes",
    daily_no: "No",
    daily_thanks: "Thanks! We will adjust your feed.",
    quiz_title: "What is the answer?",
    quiz_reveal: "Show Answer",
    quiz_hide: "Hide Answer",
    loading: "Loading...",
    back: "Back"
  }
};

// Updated Editorial Hierarchy with phonetic slugs
export const CATEGORIES: Category[] = [
  { id: '7', label: 'Монгол', label_en: 'Mongolia', slug: 'mongol' },
  { id: '2', label: 'Дэлхий', label_en: 'World', slug: 'delhii' },
  { id: '1', label: 'Хүмүүс', label_en: 'People', slug: 'humuus' },
  { id: '4', label: 'Шинжлэх ухаан', label_en: 'Science', slug: 'shinzhleh-uhaan' },
  { id: '3', label: 'Түүх, газарзүй', label_en: 'History & Geography', slug: 'tuuh-gazarzui' },
  { id: '5', label: 'Урлаг', label_en: 'Art', slug: 'urlag' },
  { id: '6', label: 'Спорт', label_en: 'Sports', slug: 'sport' },
  { id: '8', label: 'Амьтан, ургамал', label_en: 'Flora & Fauna', slug: 'amitun-urgamal' },
];

export const MOCK_CONTENT: ContentItem[] = [
  {
    id: '101',
    title: 'Хар нүхний нууц: Бидний мэдэхгүй ертөнц',
    title_en: 'Secrets of Black Holes: The World We Don\'t Know',
    description: 'Хар нүх гэж юу вэ? Түүний цаана цаг хугацаа хэрхэн өөрчлөгддөг тухай сонирхолтой баримтууд.',
    description_en: 'What is a black hole? Interesting facts about how time changes beyond the event horizon.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=1',
    category: 'Шинжлэх ухаан', // Mapped to Science
    category_en: 'Science',
    views: 15420,
    publishedDate: '2023-10-24',
    readTime: '5 мин',
    readTimeValue: 5,
    isVideo: true,
    tags: ['Сансар', 'Физик', 'Хар нүх'],
    tags_en: ['Space', 'Physics', 'Black Hole'],
    contentBody: 'Хар нүх бол орон зай, цаг хугацааны онцгой бүс юм...',
    contentBody_en: 'A black hole is a region of spacetime where gravity is so strong that nothing can escape...',
    isTrending: true,
    likes: 1200,
    quiz: {
      question: "Хар нүхнээс юу зугтаж чадах вэ?",
      answer: "Гэрэл ч зугтаж чадахгүй. Хар нүхний татах хүч маш их тул гэрэл хүртэл сорогддог."
    }
  },
  {
    id: '102',
    title: 'Өнгөний сэтгэл зүй: Цэнхэр өнгө танд ямар мэдрэмж төрүүлдэг вэ?',
    title_en: 'Color Psychology: How Blue Makes You Feel',
    description: 'Өнгө бидний сэтгэл санаа, шийдвэр гаргалтад хэрхэн нөлөөлдөг вэ?',
    description_en: 'How colors influence our mood and decision-making processes.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=2',
    category: 'Хүмүүс', // Mapped to People/Psychology context
    category_en: 'People',
    views: 8200,
    publishedDate: '2023-10-22',
    readTime: '4 мин',
    readTimeValue: 4,
    isVideo: false,
    tags: ['Сэтгэл зүй', 'Өнгө', 'Маркетинг'],
    tags_en: ['Psychology', 'Color', 'Marketing'],
    isEditorPick: true,
    likes: 850
  },
  {
    id: '103',
    title: 'Хиймэл оюун ухаан хүн төрөлхтнийг орлох уу?',
    title_en: 'Will AI Replace Humanity?',
    description: 'Технологийн хурдацтай хөгжил бидний ирээдүйг хэрхэн өөрчлөх вэ?',
    description_en: 'How rapid technological development will change our future.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=3',
    category: 'Шинжлэх ухаан', // Mapped to Science/Tech
    category_en: 'Science',
    views: 23000,
    publishedDate: '2023-10-20',
    readTime: '8 мин',
    readTimeValue: 8,
    isVideo: true,
    tags: ['AI', 'Ирээдүй', 'Робот'],
    tags_en: ['AI', 'Future', 'Robots'],
    isTrending: true,
    likes: 3400,
    quiz: {
      question: "AI гэдэг нь юуны товчлол вэ?",
      answer: "Artificial Intelligence буюу Хиймэл Оюун Ухаан."
    }
  },
  {
    id: '104',
    title: 'Чингис хааны цэргийн тактик дэлхийг хэрхэн өөрчилсөн бэ?',
    title_en: 'How Genghis Khan\'s Military Tactics Changed the World',
    description: 'Монголын эзэнт гүрний түүхэн дэх хамгийн аугаа стратегиудын тухай.',
    description_en: 'About the greatest strategies in the history of the Mongol Empire.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=4',
    category: 'Түүх, газарзүй', // Mapped to History
    category_en: 'History & Geography',
    views: 45000,
    publishedDate: '2023-10-18',
    readTime: '10 мин',
    readTimeValue: 10,
    isVideo: true,
    tags: ['Түүх', 'Чингис Хаан', 'Дайн'],
    tags_en: ['History', 'Genghis Khan', 'War'],
    likes: 5200,
    quiz: {
       question: "Монгол цэргийн гол зэвсэг юу байсан бэ?",
       answer: "Нум сум. Монгол нум нь хол тусгалтай, хүчтэй байсан."
    }
  },
  {
    id: '105',
    title: 'Квант физикийг энгийнээр тайлбарлах нь',
    title_en: 'Quantum Physics Explained Simply',
    description: 'Шинжлэх ухааны хамгийн хэцүү сэдвийг хүн бүрт ойлгомжтойгоор.',
    description_en: 'The hardest topic in science made easy for everyone.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=5',
    category: 'Шинжлэх ухаан', // Mapped to Science
    category_en: 'Science',
    views: 1200,
    publishedDate: '2023-10-15',
    readTime: '6 мин',
    readTimeValue: 6,
    isVideo: false,
    tags: ['Физик', 'Шинжлэх ухаан'],
    tags_en: ['Physics', 'Science'],
    isEditorPick: true
  },
  {
    id: '106',
    title: 'Дэлхийн хамгийн хачирхалтай 10 амьтан',
    title_en: '10 Strangest Animals on Earth',
    description: 'Та өмнө нь хэзээ ч сонсож байгаагүй сонин хачин амьтдын тухай.',
    description_en: 'Weird animals you have never heard of before.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=6',
    category: 'Амьтан, ургамал', // Mapped to Flora & Fauna
    category_en: 'Flora & Fauna',
    views: 32000,
    publishedDate: '2023-10-12',
    readTime: '3 мин',
    readTimeValue: 3,
    isVideo: true,
    tags: ['Байгаль', 'Амьтад'],
    tags_en: ['Nature', 'Animals'],
    likes: 1500
  }
];

export const INTERESTING_FACTS = {
  mn: [
    "Зөгийн бал хэзээ ч мууддаггүй цорын ганц хүнс юм.",
    "Наймаалж гурван зүрхтэй байдаг.",
    "Хүн амьдралынхаа туршид дунджаар дэлхийг 3 удаа тойрох хэмжээний алхдаг.",
    "Сансарт дуу чимээ сонсогддоггүй.",
    "Гадил жимс бол жимсгэнэ, харин гүзээлзгэнэ бол жимсгэнэ биш.",
  ],
  en: [
    "Honey is the only food that never spoils.",
    "Octopuses have three hearts.",
    "The average person walks the equivalent of 3 times around the world in a lifetime.",
    "There is no sound in space.",
    "Bananas are berries, but strawberries are not.",
  ]
};

export const QUOTES: Quote[] = [
  {
    text: "Мэдлэг бол хүч.",
    text_en: "Knowledge is power.",
    author: "Francis Bacon"
  },
  {
    text: "Сурахад хэзээ ч оройтохгүй.",
    text_en: "It is never too late to learn.",
    author: "Unknown"
  }
];