export const INITIAL_BOOKS = [
  {
    id: "dune-1",
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    genre: "Bilim Kurgu",
    spineColor: "#d97706",
    spinePattern: "sand",
    pages: 712,
    year: "1965",
    readDate: "12 Ocak 2024",
    status: "read", // 'read' | 'reading' | 'want_to_read'
    favorite: true,
    review: "Dünya inşası ve ekolojik felsefesi açısından şimdiye kadar yazılmış en muazzam bilim kurgu başyapıtı. Arrakis çölü ve baharatın peşindeki politik entrikalar büyüleyici.",
    quotes: [
      "Korku katilidir aklın. Korku, mutlak bir yıkım getiren küçük ölümdür.",
      "Gizem öğrenilecek bir şey değil, yaşanacak bir gerçekliktir."
    ],
    shelfNumber: 1
  },
  {
    id: "1984-george-orwell",
    title: "1984",
    author: "George Orwell",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    genre: "Edebiyat",
    spineColor: "#dc2626",
    spinePattern: "minimal",
    pages: 352,
    year: "1949",
    readDate: "3 Şubat 2024",
    status: "read",
    favorite: true,
    review: "Totaliterizmin, dilin (Newspeak) ve tarihin manipülasyonunun ne kadar korkutucu olabileceğini gösteren zamansız bir distopya. Çifte düşün kavramı günümüz dünyasında bile ürpertici derecede geçerli.",
    quotes: [
      "Büyük Birader seni izliyor.",
      "Geçmişi kontrol eden geleceği kontrol eder; şimdiyi kontrol eden geçmişi kontrol eder."
    ],
    shelfNumber: 1
  },
  {
    id: "albert-camus-yabanci",
    title: "Yabancı",
    author: "Albert Camus",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    genre: "Felsefe",
    spineColor: "#1e293b",
    spinePattern: "classic",
    pages: 110,
    year: "1942",
    readDate: "20 Mart 2024",
    status: "read",
    favorite: false,
    review: "Absürdizmin en vurucu romanı. Meursault'nun toplumun yapay ahlak kurallarına, yalanlarına ve duygusal beklentilerine boyun eğmeyişi ve hayatın anlamsızlığıyla yüzleşmesi sarsıcı.",
    quotes: [
      "Bugün annem öldü. Belki de dün, bilmiyorum.",
      "İnsan ne yaparsa yapsın sonunda pişman oluyordu."
    ],
    shelfNumber: 1
  },
  {
    id: "marcus-aurelius-meditations",
    title: "Kendime Düşünceler",
    author: "Marcus Aurelius",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    genre: "Felsefe",
    spineColor: "#78350f",
    spinePattern: "leather",
    pages: 180,
    year: "180",
    readDate: "15 Nisan 2024",
    status: "read",
    favorite: true,
    review: "Bir Roma imparatorunun savaş çadırında gece yarısı sadece kendi ruhunu terbiye etmek için yazdığı samimi Stoacı notlar. Zihninizin kontrolü sizde olduğu sürece dış etkenler sizi incitemez.",
    quotes: [
      "Kafanın içindeki düşünceler neyse ruhun da ona benzer.",
      "Dış olaylar seni rahatsız ediyorsa, acı çeken onlar değil, senin onlar hakkındaki yargındır."
    ],
    shelfNumber: 1
  },
  {
    id: "sapiens-harari",
    title: "Sapiens: Hayvanlardan Tanrılara",
    author: "Yuval Noah Harari",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    genre: "Tarih & Sosyoloji",
    spineColor: "#047857",
    spinePattern: "modern",
    pages: 412,
    year: "2011",
    readDate: "2 Mayıs 2024",
    status: "read",
    favorite: false,
    review: "İnsan türünün dedikodu, ortak kurgular (para, din, şirketler) ve tarım devrimiyle dünyayı nasıl fethettiğini anlatan akıcı ve ufuk açıcı bir özet.",
    quotes: [
      "Tarih, çok az insanın yaptığı ama herkesin ceremesini çektiği bir şeydir.",
      "Büyük kitleler halinde iş birliği yapabilen tek canlı Homo sapiens'tir."
    ],
    shelfNumber: 1
  },
  {
    id: "stefan-zweig-satranc",
    title: "Satranç",
    author: "Stefan Zweig",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    genre: "Psikoloji",
    spineColor: "#475569",
    spinePattern: "minimal",
    pages: 84,
    year: "1942",
    readDate: "10 Haziran 2024",
    status: "read",
    favorite: false,
    review: "Zweig'ın intiharından önce yazdığı son başyapıt. Gestapo'nun tecrit hücresinde zihnini satranç oyunlarıyla parçalayan Dr. B'nin psikolojik çözülüşü insanı nefessiz bırakıyor.",
    quotes: [
      "Hiçbir şey, insan ruhu üzerinde hiçbir şey yapmamanın baskısı kadar ezici olamazdı."
    ],
    shelfNumber: 2
  },
  {
    id: "carl-sagan-cosmos",
    title: "Kozmos",
    author: "Carl Sagan",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    genre: "Bilim",
    spineColor: "#1e1b4b",
    spinePattern: "stars",
    pages: 384,
    year: "1980",
    readDate: "Şu an okunuyor",
    status: "reading",
    favorite: true,
    review: "Evrenin ihtişamı ve insanın o devasa boşluktaki küçücük ama anlamlı yeri. Sagan'ın şiirsel üslubu bilimi adeta bir ibadete dönüştürüyor.",
    quotes: [
      "Bizler evrenin kendi kendini tanımasının bir yoluyuz. Yıldız tozundan yapıldık.",
      "Olağanüstü iddialar olağanüstü kanıtlar gerektirir."
    ],
    shelfNumber: 2
  },
  {
    id: "franz-kafka-donusum",
    title: "Dönüşüm",
    author: "Franz Kafka",
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    genre: "Edebiyat",
    spineColor: "#334155",
    spinePattern: "classic",
    pages: 104,
    year: "1915",
    readDate: "22 Temmuz 2024",
    status: "read",
    favorite: false,
    review: "Gregor Samsa bir sabah dev bir böceğe dönüştüğünde, ailenin ve kapitalist işleyişin sevgi kılıfı altındaki pragmatizmi acımasızca gözler önüne seriliyor.",
    quotes: [
      "Gregor Samsa bir sabah huzursuz düşlerden uyandığında, kendini yatağında devasa bir böceğe dönüşmüş olarak buldu."
    ],
    shelfNumber: 2
  },
  {
    id: "aldous-huxley-brave-new-world",
    title: "Cesur Yeni Dünya",
    author: "Aldous Huxley",
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    genre: "Bilim Kurgu",
    spineColor: "#0284c7",
    spinePattern: "modern",
    pages: 272,
    year: "1932",
    readDate: "İstek Listesi",
    status: "want_to_read",
    favorite: false,
    review: "Acının, hüznün ve sanatın soma adlı bir uyuşturucu ve yapay mutlulukla yok edildiği bir dünya.",
    quotes: [
      "Ama ben rahatlık istemiyorum. Ben Tanrı'yı istiyorum, şiir istiyorum, gerçek tehlike istiyorum, özgürlük istiyorum, iyilik istiyorum, günah istiyorum."
    ],
    shelfNumber: 2
  }
];

export const GENRES = [
  "Tümü",
  "Bilim Kurgu",
  "Felsefe",
  "Edebiyat",
  "Psikoloji",
  "Tarih & Sosyoloji",
  "Bilim"
];
