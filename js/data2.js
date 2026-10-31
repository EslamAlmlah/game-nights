// Content for the second batch of games, plus more Would You Rather.

DATA.cw = {
  en: [
    ["OCEAN", "Huge body of salt water"], ["MOON", "Lights up the night sky"], ["COFFEE", "Morning drink"], ["HONEY", "Made by bees"],
    ["BREAD", "Baked loaf"], ["RIVER", "Flowing water"], ["CAMEL", "Ship of the desert"], ["LEMON", "Sour yellow fruit"],
    ["APPLE", "Keeps the doctor away"], ["PIZZA", "Italian pie with cheese"], ["GUITAR", "Six-string instrument"], ["RAIN", "Falls from clouds"],
    ["SNOW", "White winter flakes"], ["STAR", "Twinkles at night"], ["HEART", "It beats for you"], ["LOVE", "What this site is made of"],
    ["SMILE", "Happy face"], ["CLOCK", "Tells the time"], ["PHONE", "How we call each other"], ["TRAIN", "Runs on rails"],
    ["PLANE", "Flies you to me"], ["BEACH", "Sand by the sea"], ["TIGER", "Striped big cat"], ["EAGLE", "Bird of prey"],
    ["OLIVE", "Small fruit, big oil"], ["MANGO", "Tropical orange fruit"], ["PILLOW", "Rest your head on it"], ["CANDLE", "Wax light"],
    ["DREAM", "Happens while you sleep"], ["MUSIC", "Songs and melodies"], ["PARIS", "City of the Eiffel Tower"], ["CHESS", "Game of kings and pawns"],
    ["ROSE", "Red flower with thorns"], ["TEA", "Hot drink in a glass"], ["SUGAR", "Sweet white crystals"], ["GARDEN", "Where flowers grow"],
    ["WINTER", "Coldest season"], ["SUMMER", "Hottest season"], ["DIAMOND", "Hardest gem"], ["KEY", "Opens a lock"],
    ["BOOK", "You read it"], ["SMOKE", "Comes from fire"], ["CLOUD", "Fluffy and white in the sky"], ["HOUSE", "Where you live"]
  ],
  ar: [
    ["بحر", "مياه مالحة واسعة"], ["شمس", "نجم النهار"], ["قمر", "ينوّر الليل"], ["كتاب", "بتقرأه"], ["قلم", "بتكتب فيه"],
    ["بيت", "مكان السكن"], ["باب", "بتدخل منه"], ["شجرة", "لها جذع وأغصان"], ["وردة", "زهرة حلوة"], ["قهوة", "مشروب الصبح"],
    ["شاي", "بيتشرب بكاسات صغيرة"], ["خبز", "بيطلع من الفرن"], ["حليب", "من البقرة"], ["عسل", "بيعمله النحل"], ["مطر", "بينزل من الغيم"],
    ["ثلج", "أبيض وبارد"], ["جبل", "أعلى من التلة"], ["نهر", "ماء جاري"], ["سماء", "فوقنا وزرقاء"], ["نجمة", "بتلمع بالليل"],
    ["قطة", "بتموء"], ["اسد", "ملك الغابة"], ["حصان", "بتركبه وبيركض"], ["سمكة", "بتعيش بالمي"], ["طيارة", "بتطير بالمسافرين"],
    ["سيارة", "لها أربع دواليب"], ["مفتاح", "بيفتح القفل"], ["ساعة", "بتعرف منها الوقت"], ["دمشق", "عاصمة سوريا"], ["حلب", "مدينة القلعة والصابون"],
    ["زيتون", "شجرة الزيت"], ["ليمون", "حامض وأصفر"], ["تفاح", "فاكهة حمرا أو خضرا"], ["بطيخ", "فاكهة الصيف الكبيرة"], ["كبة", "برغل ولحم"],
    ["فلافل", "أقراص حمص مقلية"], ["مدرسة", "مكان التعليم"], ["نافذة", "بتطل منها"], ["حب", "شعور بين قلبين"], ["عرس", "حفلة زواج"],
    ["حمص", "مدينة ابن الوليد، أو أكلة"], ["شاورما", "سندويشة لحم أو دجاج"], ["قمرالدين", "مشروب رمضان من المشمش"], ["ياسمين", "زهرة الشام البيضا"]
  ]
};

// Secret word race: English 5 letters, Arabic 4 letters.
DATA.wr = {
  en: ("apple beach bread brain candy chair charm cloud coast crown dance dream drink eagle earth faith feast field flame "
    + "flute fruit ghost glass grape grass happy heart honey horse house juice knife laugh lemon light lucky magic mango "
    + "money month music night ocean olive paint party peace pearl phone piano pilot pizza plant queen quiet radio river "
    + "robot salad sauce shine skirt sleep smile snake spice spoon sport storm sugar sunny sweet table tiger toast tower "
    + "train truth uncle voice watch water whale world youth zebra").split(" "),
  ar: ("كتاب بيوت شجرة وردة قهوة حليب سماء نجمة حصان سمكة ساعة دمشق بطيخ "
    + "مدرس قلبي حبيب سلام ربيع خريف شتاء جميل كبير صغير طويل قمري نهار ليلة بنات شباب سوري عربي "
    + "دفتر مطبخ سكين شمعة غيمة رمان مشمش جزرة بصلة خيار فطور عشاء غداء سفرة موسم صديق عيون ضحكة").split(" ")
};

DATA.wyr.push(
  [{en:"Live without the internet",ar:"تعيش بدون إنترنت"},{en:"Live without air conditioning / heating",ar:"تعيش بدون تكييف أو تدفئة"}],
  [{en:"Be able to fly a plane",ar:"تعرف تسوق طيارة"},{en:"Be able to drive any car like a pro",ar:"تسوق أي سيارة متل المحترفين"}],
  [{en:"Have a pet dragon",ar:"تربي تنين"},{en:"Have a pet unicorn",ar:"تربي حصان وحيد القرن"}],
  [{en:"Eat only sweet food",ar:"تاكل حلو بس"},{en:"Eat only salty food",ar:"تاكل مالح بس"}],
  [{en:"Always lose at board games",ar:"تخسر دايماً بألعاب الطاولة"},{en:"Always lose at video games",ar:"تخسر دايماً بألعاب الفيديو"}],
  [{en:"Get a handwritten letter",ar:"توصلك رسالة بخط اليد"},{en:"Get a surprise voice note",ar:"يوصلك فويس مفاجأة"}],
  [{en:"Meet your favourite celebrity",ar:"تلتقي بمشهورك المفضل"},{en:"Meet your great-great-grandparents",ar:"تلتقي بجدود جدودك"}],
  [{en:"Have a rewind button for your life",ar:"زر ترجيع لحياتك"},{en:"Have a pause button for your life",ar:"زر إيقاف مؤقت لحياتك"}],
  [{en:"Live in a treehouse",ar:"تعيش ببيت على شجرة"},{en:"Live in a houseboat",ar:"تعيش ببيت عالمي"}],
  [{en:"Be stuck in an elevator with your boss",ar:"تعلق بالمصعد مع مديرك"},{en:"Be stuck in an elevator with your ex",ar:"تعلق بالمصعد مع حبيبك القديم"}],
  [{en:"Never use emojis again",ar:"ما تستعمل إيموجي أبداً"},{en:"Only text in emojis",ar:"تبعت رسايل بالإيموجي بس"}],
  [{en:"Have Fairuz sing at your wedding",ar:"فيروز تغني بعرسك"},{en:"Have Umm Kulthum's orchestra at your wedding",ar:"فرقة أم كلثوم بعرسك"}],
  [{en:"Spend a day at the beach",ar:"يوم بالبحر"},{en:"Spend a day in the snow",ar:"يوم بالتلج"}],
  [{en:"Have unlimited free flights",ar:"طيران مجاني بلا حدود"},{en:"Have unlimited free food",ar:"أكل مجاني بلا حدود"}],
  [{en:"Know when you'll meet next",ar:"تعرف إيمتى رح تلتقوا"},{en:"Be surprised by it",ar:"تتفاجأ فيه"}],
  [{en:"Be a famous chef",ar:"طباخ مشهور"},{en:"Be a famous singer",ar:"مغني مشهور"}],
  [{en:"Wear pyjamas everywhere",ar:"تلبس بيجاما بكل مكان"},{en:"Wear a suit everywhere",ar:"تلبس طقم رسمي بكل مكان"}],
  [{en:"Have every day be Friday",ar:"كل يوم جمعة"},{en:"Have every day be your birthday",ar:"كل يوم عيد ميلادك"}],
  [{en:"Give up chocolate",ar:"تترك الشوكولا"},{en:"Give up cheese",ar:"تترك الجبنة"}],
  [{en:"Have a photographic memory",ar:"ذاكرة فوتوغرافية"},{en:"Be able to forget anything you want",ar:"تقدر تنسى أي شي بدك ياه"}],
  [{en:"Be the best player at every game",ar:"تكون الأشطر بكل لعبة"},{en:"Always have the most fun even when losing",ar:"تنبسط أكتر شي حتى لو خسرت"}],
  [{en:"Have a big family dinner every week",ar:"عزيمة عيلة كبيرة كل أسبوع"},{en:"Have a quiet dinner for two every night",ar:"عشا هادي لشخصين كل ليلة"}],
  [{en:"Explore an old castle at night",ar:"تستكشف قلعة قديمة بالليل"},{en:"Explore a jungle in the day",ar:"تستكشف غابة بالنهار"}],
  [{en:"Speak to your 10-year-old self",ar:"تحكي مع حالك وعمرك 10 سنين"},{en:"Speak to your 80-year-old self",ar:"تحكي مع حالك وعمرك 80"}],
  [{en:"Have the house always clean",ar:"البيت دايماً نضيف"},{en:"Have the fridge always full",ar:"البراد دايماً مليان"}],
  [{en:"Wake up to the smell of coffee",ar:"تفيق على ريحة القهوة"},{en:"Wake up to the smell of fresh bread",ar:"تفيق على ريحة الخبز الطازة"}],
  [{en:"Be a superhero no one knows about",ar:"بطل خارق ما حدا بيعرفه"},{en:"Be famous for something silly",ar:"مشهور بشي سخيف"}],
  [{en:"Go on a hot-air balloon ride",ar:"تطلع بمنطاد"},{en:"Go on a submarine ride",ar:"تنزل بغواصة"}],
  [{en:"Never argue again",ar:"ما تتناقشوا أبداً"},{en:"Always make up in 5 minutes",ar:"دايماً تتصالحوا خلال 5 دقايق"}],
  [{en:"Get one long call",ar:"مكالمة وحدة طويلة"},{en:"Get many short sweet messages all day",ar:"رسايل قصيرة حلوة طول النهار"}],
  [{en:"Eat at a street food stall",ar:"تاكل من بسطة أكل بالشارع"},{en:"Eat at a fancy restaurant",ar:"تاكل بمطعم فخم"}],
  [{en:"Have a garden full of jasmine",ar:"جنينة مليانة ياسمين"},{en:"Have a balcony with a sea view",ar:"بلكونة على البحر"}],
  [{en:"Be in a movie",ar:"تمثل بفيلم"},{en:"Write a movie",ar:"تكتب فيلم"}],
  [{en:"Only listen to old songs",ar:"تسمع أغاني قديمة بس"},{en:"Only listen to new songs",ar:"تسمع أغاني جديدة بس"}],
  [{en:"Have a robot that cooks",ar:"روبوت بيطبخ"},{en:"Have a robot that cleans",ar:"روبوت بينضف"}],
  [{en:"Never feel cold",ar:"ما تبرد أبداً"},{en:"Never feel hot",ar:"ما تشوب أبداً"}],
  [{en:"Visit Japan",ar:"تزور اليابان"},{en:"Visit Brazil",ar:"تزور البرازيل"}],
  [{en:"Win every argument",ar:"تربح كل نقاش"},{en:"Win every game",ar:"تربح كل لعبة"}],
  [{en:"Lose your sense of taste",ar:"تفقد حاسة الذوق"},{en:"Lose your sense of smell",ar:"تفقد حاسة الشم"}],
  [{en:"Have a movie made about your life",ar:"ينعمل فيلم عن حياتك"},{en:"Have a song written about you",ar:"تنكتب أغنية عنك"}],
  [{en:"Be able to breathe underwater",ar:"تتنفس تحت المي"},{en:"Be able to walk on walls",ar:"تمشي على الحيطان"}],
  [{en:"Plan the perfect date",ar:"تخطط لموعد مثالي"},{en:"Be surprised with the perfect date",ar:"تتفاجأ بموعد مثالي"}],
  [{en:"Have breakfast in bed",ar:"فطور بالتخت"},{en:"Have dinner under the stars",ar:"عشا تحت النجوم"}],
  [{en:"Only drink water forever",ar:"تشرب مي بس للأبد"},{en:"Never drink water but anything else is fine",ar:"ما تشرب مي أبداً بس غيرها مسموح"}],
  [{en:"Be a kid again for a day",ar:"ترجع ولد ليوم"},{en:"Be 30 years older for a day",ar:"تكبر 30 سنة ليوم"}],
  [{en:"Live in a big city",ar:"تعيش بمدينة كبيرة"},{en:"Live in a small village",ar:"تعيش بضيعة صغيرة"}],
  [{en:"Find a treasure map",ar:"تلاقي خريطة كنز"},{en:"Find a time machine",ar:"تلاقي آلة زمن"}],
  [{en:"Dance in the rain",ar:"ترقص تحت المطر"},{en:"Sing in the shower loudly every day",ar:"تغني بالحمام بصوت عالي كل يوم"}],
  [{en:"Always know what your partner is thinking",ar:"تعرف دايماً شريكك شو عم يفكر"},{en:"Your partner always knows what you're thinking",ar:"شريكك يعرف دايماً شو عم تفكر"}],
  [{en:"Get a tattoo of your partner's name",ar:"توشم اسم شريكك"},{en:"Get a tattoo your partner designs",ar:"توشم رسمة بيصممها شريكك"}]
);
