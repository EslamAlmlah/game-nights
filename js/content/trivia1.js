// Trivia, batch 1: "d|en q|ar q|en right|ar right|en w1|ar w1|en w2|ar w2|en w3|ar w3" per line. The right answer is first; the game shuffles.
DATA.triviaLines = (DATA.triviaLines || []).concat(`
1|What is the capital of Lebanon?|ما هي عاصمة لبنان؟|Beirut|بيروت|Tripoli|طرابلس|Sidon|صيدا|Byblos|جبيل
1|What is the capital of Jordan?|ما هي عاصمة الأردن؟|Amman|عمّان|Irbid|إربد|Aqaba|العقبة|Zarqa|الزرقاء
1|What is the capital of Egypt?|ما هي عاصمة مصر؟|Cairo|القاهرة|Alexandria|الإسكندرية|Giza|الجيزة|Luxor|الأقصر
1|What is the capital of Iraq?|ما هي عاصمة العراق؟|Baghdad|بغداد|Basra|البصرة|Mosul|الموصل|Erbil|أربيل
1|What is the capital of Saudi Arabia?|ما هي عاصمة السعودية؟|Riyadh|الرياض|Jeddah|جدة|Mecca|مكة|Dammam|الدمام
1|What is the capital of Turkey?|ما هي عاصمة تركيا؟|Ankara|أنقرة|Istanbul|إسطنبول|Izmir|إزمير|Antalya|أنطاليا
1|What is the capital of Sweden?|ما هي عاصمة السويد؟|Stockholm|ستوكهولم|Gothenburg|غوتنبرغ|Malmö|مالمو|Uppsala|أوبسالا
1|What is the capital of Germany?|ما هي عاصمة ألمانيا؟|Berlin|برلين|Munich|ميونخ|Hamburg|هامبورغ|Frankfurt|فرانكفورت
1|What is the capital of France?|ما هي عاصمة فرنسا؟|Paris|باريس|Lyon|ليون|Marseille|مرسيليا|Nice|نيس
1|What is the capital of Italy?|ما هي عاصمة إيطاليا؟|Rome|روما|Milan|ميلانو|Venice|البندقية|Naples|نابولي
1|What is the capital of Spain?|ما هي عاصمة إسبانيا؟|Madrid|مدريد|Barcelona|برشلونة|Seville|إشبيلية|Valencia|فالنسيا
1|What is the capital of Japan?|ما هي عاصمة اليابان؟|Tokyo|طوكيو|Osaka|أوساكا|Kyoto|كيوتو|Hiroshima|هيروشيما
1|What is the capital of the United Kingdom?|ما هي عاصمة المملكة المتحدة؟|London|لندن|Manchester|مانشستر|Liverpool|ليفربول|Edinburgh|إدنبرة
1|What is the capital of Morocco?|ما هي عاصمة المغرب؟|Rabat|الرباط|Casablanca|الدار البيضاء|Marrakesh|مراكش|Fez|فاس
1|What is the capital of the UAE?|ما هي عاصمة الإمارات؟|Abu Dhabi|أبوظبي|Dubai|دبي|Sharjah|الشارقة|Ajman|عجمان
2|What is the capital of Canada?|ما هي عاصمة كندا؟|Ottawa|أوتاوا|Toronto|تورنتو|Vancouver|فانكوفر|Montreal|مونتريال
2|What is the capital of Australia?|ما هي عاصمة أستراليا؟|Canberra|كانبرا|Sydney|سيدني|Melbourne|ملبورن|Perth|بيرث
2|What is the capital of Norway?|ما هي عاصمة النرويج؟|Oslo|أوسلو|Bergen|بيرغن|Stavanger|ستافانغر|Trondheim|تروندهايم
2|What is the capital of Denmark?|ما هي عاصمة الدنمارك؟|Copenhagen|كوبنهاغن|Aarhus|آرهوس|Odense|أودنسه|Aalborg|ألبورغ
2|What is the capital of Finland?|ما هي عاصمة فنلندا؟|Helsinki|هلسنكي|Turku|توركو|Tampere|تامبيري|Oulu|أولو
2|What is the capital of Brazil?|ما هي عاصمة البرازيل؟|Brasília|برازيليا|Rio de Janeiro|ريو دي جانيرو|São Paulo|ساو باولو|Salvador|سلفادور
2|What is the capital of Tunisia?|ما هي عاصمة تونس؟|Tunis|تونس|Sfax|صفاقس|Sousse|سوسة|Kairouan|القيروان
2|What is the capital of Algeria?|ما هي عاصمة الجزائر؟|Algiers|الجزائر|Oran|وهران|Constantine|قسنطينة|Annaba|عنابة
2|What is the capital of Qatar?|ما هي عاصمة قطر؟|Doha|الدوحة|Al Wakrah|الوكرة|Al Khor|الخور|Lusail|لوسيل
2|What is the capital of Kuwait?|ما هي عاصمة الكويت؟|Kuwait City|مدينة الكويت|Hawalli|حولي|Jahra|الجهراء|Ahmadi|الأحمدي
2|What is the capital of Oman?|ما هي عاصمة عُمان؟|Muscat|مسقط|Salalah|صلالة|Sohar|صحار|Nizwa|نزوى
2|What is the capital of Yemen?|ما هي عاصمة اليمن؟|Sana'a|صنعاء|Aden|عدن|Taiz|تعز|Mukalla|المكلا
2|What is the capital of Libya?|ما هي عاصمة ليبيا؟|Tripoli|طرابلس|Benghazi|بنغازي|Misrata|مصراتة|Sirte|سرت
2|What is the capital of Sudan?|ما هي عاصمة السودان؟|Khartoum|الخرطوم|Port Sudan|بورتسودان|Omdurman|أم درمان|Kassala|كسلا
2|What is the capital of Bahrain?|ما هي عاصمة البحرين؟|Manama|المنامة|Muharraq|المحرق|Riffa|الرفاع|Isa Town|مدينة عيسى
2|What is the capital of Russia?|ما هي عاصمة روسيا؟|Moscow|موسكو|Saint Petersburg|سانت بطرسبرغ|Kazan|قازان|Sochi|سوتشي
2|What is the capital of China?|ما هي عاصمة الصين؟|Beijing|بكين|Shanghai|شنغهاي|Hong Kong|هونغ كونغ|Guangzhou|غوانزو
2|What is the capital of India?|ما هي عاصمة الهند؟|New Delhi|نيودلهي|Mumbai|مومباي|Bangalore|بنغالور|Kolkata|كولكاتا
2|What is the capital of South Korea?|ما هي عاصمة كوريا الجنوبية؟|Seoul|سيول|Busan|بوسان|Incheon|إنتشون|Daegu|دايغو
2|What is the capital of Greece?|ما هي عاصمة اليونان؟|Athens|أثينا|Thessaloniki|سالونيك|Patras|باتراس|Heraklion|هيراكليون
2|What is the capital of the Netherlands?|ما هي عاصمة هولندا؟|Amsterdam|أمستردام|Rotterdam|روتردام|The Hague|لاهاي|Utrecht|أوترخت
2|What is the capital of Portugal?|ما هي عاصمة البرتغال؟|Lisbon|لشبونة|Porto|بورتو|Faro|فارو|Braga|براغا
2|What is the capital of Argentina?|ما هي عاصمة الأرجنتين؟|Buenos Aires|بوينس آيرس|Córdoba|قرطبة|Rosario|روساريو|Mendoza|مندوسا
2|What is the capital of Mexico?|ما هي عاصمة المكسيك؟|Mexico City|مكسيكو سيتي|Guadalajara|غوادالاخارا|Cancún|كانكون|Monterrey|مونتيري
3|What is the capital of Switzerland?|ما هي عاصمة سويسرا؟|Bern|برن|Zurich|زيورخ|Geneva|جنيف|Basel|بازل
3|What is the capital of New Zealand?|ما هي عاصمة نيوزيلندا؟|Wellington|ويلينغتون|Auckland|أوكلاند|Christchurch|كرايستشيرش|Queenstown|كوينزتاون
3|What is the capital of Turkey's neighbour Georgia?|ما هي عاصمة جورجيا جارة تركيا؟|Tbilisi|تبليسي|Batumi|باتومي|Kutaisi|كوتايسي|Yerevan|يريفان
3|What is the capital of Kazakhstan?|ما هي عاصمة كازاخستان؟|Astana|أستانا|Almaty|ألماتي|Shymkent|شيمكنت|Tashkent|طشقند
3|What is the capital of Nigeria?|ما هي عاصمة نيجيريا؟|Abuja|أبوجا|Lagos|لاغوس|Kano|كانو|Ibadan|إبادان
3|What is the capital of Pakistan?|ما هي عاصمة باكستان؟|Islamabad|إسلام آباد|Karachi|كراتشي|Lahore|لاهور|Peshawar|بيشاور
3|What is the capital of Iceland?|ما هي عاصمة آيسلندا؟|Reykjavík|ريكيافيك|Akureyri|أكوريري|Oslo|أوسلو|Nuuk|نوك
3|What is the capital of Mauritania?|ما هي عاصمة موريتانيا؟|Nouakchott|نواكشوط|Nouadhibou|نواذيبو|Bamako|باماكو|Dakar|داكار
3|What is the capital of Vietnam?|ما هي عاصمة فيتنام؟|Hanoi|هانوي|Ho Chi Minh City|هو تشي منه|Da Nang|دا نانغ|Hue|هوي
3|What is the capital of Morocco's neighbour Mali?|ما هي عاصمة مالي؟|Bamako|باماكو|Timbuktu|تمبكتو|Niamey|نيامي|Dakar|داكار
1|What is the largest ocean on Earth?|ما هو أكبر محيط على الأرض؟|Pacific|الهادئ|Atlantic|الأطلسي|Indian|الهندي|Arctic|المتجمد الشمالي
1|Which is the largest continent?|ما هي أكبر قارة؟|Asia|آسيا|Africa|أفريقيا|Europe|أوروبا|North America|أمريكا الشمالية
1|Which river flows through Cairo?|أي نهر يمر في القاهرة؟|The Nile|النيل|The Euphrates|الفرات|The Tigris|دجلة|The Jordan|الأردن
1|Which country is shaped like a boot?|أي دولة شكلها مثل الجزمة؟|Italy|إيطاليا|Spain|إسبانيا|Greece|اليونان|Portugal|البرتغال
1|In which country are the pyramids of Giza?|في أي دولة أهرامات الجيزة؟|Egypt|مصر|Sudan|السودان|Mexico|المكسيك|Iraq|العراق
1|Which country has the most people (2024)?|أي دولة فيها أكبر عدد سكان (2024)؟|India|الهند|China|الصين|USA|أمريكا|Indonesia|إندونيسيا
1|How many continents are there?|كم عدد القارات؟|7|7|5|5|6|6|8|8
1|What is the largest country in the world by area?|ما هي أكبر دولة في العالم مساحةً؟|Russia|روسيا|Canada|كندا|China|الصين|USA|أمريكا
1|What is the hottest continent?|ما هي أحر قارة؟|Africa|أفريقيا|Asia|آسيا|Australia|أستراليا|South America|أمريكا الجنوبية
1|Which city is famous for the Eiffel Tower?|أي مدينة مشهورة ببرج إيفل؟|Paris|باريس|London|لندن|Rome|روما|Berlin|برلين
1|Which city has the Burj Khalifa?|في أي مدينة برج خليفة؟|Dubai|دبي|Abu Dhabi|أبوظبي|Doha|الدوحة|Riyadh|الرياض
1|Which Syrian city is famous for its citadel and soap?|أي مدينة سورية مشهورة بقلعتها وصابونها؟|Aleppo|حلب|Hama|حماة|Tartus|طرطوس|Daraa|درعا
1|Which Syrian city is famous for its water wheels (norias)?|أي مدينة سورية مشهورة بالنواعير؟|Hama|حماة|Homs|حمص|Idlib|إدلب|Raqqa|الرقة
1|Which sea is so salty you float easily in it?|أي بحر مالح لدرجة إنك بتطوف فيه بسهولة؟|The Dead Sea|البحر الميت|The Red Sea|البحر الأحمر|The Black Sea|البحر الأسود|The Caspian Sea|بحر قزوين
2|Which is the longest river in the world (most common answer)?|ما هو أطول نهر في العالم (الجواب الأشهر)؟|The Nile|النيل|The Amazon|الأمازون|The Yangtze|اليانغتسي|The Mississippi|المسيسيبي
2|What is the tallest mountain in the world?|ما هو أعلى جبل في العالم؟|Mount Everest|إيفرست|K2|كي 2|Kilimanjaro|كليمنجارو|Mont Blanc|مون بلان
2|What is the largest desert in the world (hot)?|ما هي أكبر صحراء حارة في العالم؟|The Sahara|الصحراء الكبرى|Arabian Desert|صحراء العرب|Gobi|غوبي|Kalahari|كالاهاري
2|Which Syrian city is on the Mediterranean coast?|أي مدينة سورية على ساحل المتوسط؟|Latakia|اللاذقية|Homs|حمص|Deir ez-Zor|دير الزور|Palmyra|تدمر
2|Which river flows through Deir ez-Zor?|أي نهر يمر في دير الزور؟|The Euphrates|الفرات|The Orontes|العاصي|The Barada|بردى|The Tigris|دجلة
2|Which river flows through Damascus?|أي نهر يمر في دمشق؟|Barada|بردى|Orontes|العاصي|Euphrates|الفرات|Khabur|الخابور
2|Which river flows through Hama and Homs?|أي نهر يمر في حماة وحمص؟|Orontes|العاصي|Barada|بردى|Euphrates|الفرات|Yarmouk|اليرموك
2|Which ancient city in the Syrian desert was ruled by Queen Zenobia?|أي مدينة قديمة بالبادية السورية حكمتها الملكة زنوبيا؟|Palmyra|تدمر|Bosra|بصرى|Ugarit|أوغاريت|Apamea|أفاميا
2|Which country has the most islands in the world?|أي دولة فيها أكتر جزر بالعالم؟|Sweden|السويد|Indonesia|إندونيسيا|Philippines|الفلبين|Japan|اليابان
2|What is the smallest country in the world?|ما هي أصغر دولة في العالم؟|Vatican City|الفاتيكان|Monaco|موناكو|Malta|مالطا|San Marino|سان مارينو
2|Which strait separates Europe and Africa?|أي مضيق يفصل أوروبا عن أفريقيا؟|Strait of Gibraltar|مضيق جبل طارق|Bosphorus|البوسفور|Strait of Hormuz|مضيق هرمز|Bab el-Mandeb|باب المندب
2|Which city sits on two continents?|أي مدينة واقعة على قارتين؟|Istanbul|إسطنبول|Cairo|القاهرة|Athens|أثينا|Moscow|موسكو
2|Which country has the city of Petra?|بأي دولة مدينة البتراء؟|Jordan|الأردن|Syria|سوريا|Egypt|مصر|Saudi Arabia|السعودية
2|In which country is Machu Picchu?|في أي دولة ماتشو بيتشو؟|Peru|البيرو|Mexico|المكسيك|Chile|تشيلي|Bolivia|بوليفيا
2|Which ocean lies between Africa and Australia?|أي محيط بين أفريقيا وأستراليا؟|Indian Ocean|المحيط الهندي|Pacific Ocean|المحيط الهادئ|Atlantic Ocean|المحيط الأطلسي|Southern Ocean|المحيط الجنوبي
2|Which country is home to the kangaroo?|أي دولة موطن الكنغر؟|Australia|أستراليا|New Zealand|نيوزيلندا|South Africa|جنوب أفريقيا|Brazil|البرازيل
2|What is the largest lake in Africa?|ما هي أكبر بحيرة في أفريقيا؟|Lake Victoria|بحيرة فيكتوريا|Lake Tanganyika|بحيرة تنجانيقا|Lake Chad|بحيرة تشاد|Lake Malawi|بحيرة ملاوي
3|Which is the largest lake in Syria (artificial)?|ما هي أكبر بحيرة بسوريا (اصطناعية)؟|Lake Assad|بحيرة الأسد|Lake Qattinah|بحيرة قطينة|Lake Mzeireeb|بحيرة المزيريب|Lake Jabboul|سبخة الجبول
3|What is the highest mountain in Syria?|ما هو أعلى جبل في سوريا؟|Mount Hermon|جبل الشيخ|Mount Qasioun|جبل قاسيون|Mount Kassab|جبل الأقرع|Mount Simeon|جبل سمعان
3|Which mountain overlooks Damascus?|أي جبل يطل على دمشق؟|Qasioun|قاسيون|Hermon|الشيخ|Al-Arab|جبل العرب|Al-Zawiya|جبل الزاوية
3|Which country has the most time zones (including territories)?|أي دولة عندها أكتر مناطق زمنية (مع أقاليمها)؟|France|فرنسا|Russia|روسيا|USA|أمريكا|China|الصين
3|Which desert is the driest non-polar desert in the world?|ما هي أجف صحراء غير قطبية بالعالم؟|Atacama|أتاكاما|Sahara|الصحراء الكبرى|Gobi|غوبي|Namib|ناميب
3|Which African country was never colonised (except a brief Italian occupation)?|أي دولة أفريقية ما استُعمرت أبداً (إلا احتلال إيطالي قصير)؟|Ethiopia|إثيوبيا|Kenya|كينيا|Egypt|مصر|Morocco|المغرب
3|Which European capital stands on the Danube along with Vienna and Budapest?|أي عاصمة أوروبية على نهر الدانوب مع فيينا وبودابست؟|Bratislava|براتيسلافا|Prague|براغ|Warsaw|وارسو|Zagreb|زغرب
3|What is the deepest lake in the world?|ما هي أعمق بحيرة بالعالم؟|Lake Baikal|بحيرة بايكال|Lake Superior|بحيرة سوبيريور|Lake Tanganyika|بحيرة تنجانيقا|Caspian Sea|بحر قزوين
3|Which country has the longest coastline in the world?|أي دولة عندها أطول ساحل بالعالم؟|Canada|كندا|Russia|روسيا|Norway|النرويج|Australia|أستراليا
3|How many countries border Syria?|كم دولة بتحد سوريا؟|5|5|4|4|6|6|3|3
1|How many legs does a spider have?|كم رجل للعنكبوت؟|8|8|6|6|10|10|4|4
1|What is the largest animal on Earth?|ما هو أكبر حيوان على الأرض؟|Blue whale|الحوت الأزرق|Elephant|الفيل|Giraffe|الزرافة|Great white shark|القرش الأبيض
1|What do bees make?|شو بتصنع النحلة؟|Honey|العسل|Milk|الحليب|Silk|الحرير|Wax only|الشمع بس
1|Which animal is known as the king of the jungle?|أي حيوان بيلقبوه ملك الغابة؟|Lion|الأسد|Tiger|النمر|Elephant|الفيل|Bear|الدب
1|What is a baby cat called?|شو اسم صغير القطة بالإنجليزي؟|Kitten|Kitten|Puppy|Puppy|Cub|Cub|Foal|Foal
1|Which bird can't fly but runs very fast?|أي طير ما بيطير بس بيركض كتير سريع؟|Ostrich|النعامة|Eagle|النسر|Parrot|الببغاء|Pigeon|الحمامة
1|What is the fastest land animal?|ما هو أسرع حيوان بري؟|Cheetah|الفهد|Lion|الأسد|Horse|الحصان|Gazelle|الغزال
1|How many legs does an insect have?|كم رجل للحشرة؟|6|6|8|8|4|4|10|10
1|Which animal has a trunk?|أي حيوان عنده خرطوم؟|Elephant|الفيل|Rhino|وحيد القرن|Hippo|فرس النهر|Camel|الجمل
1|What do pandas mainly eat?|شو بياكل الباندا بشكل رئيسي؟|Bamboo|الخيزران|Fish|السمك|Fruit|الفواكه|Grass|العشب
1|Which animal is called the 'ship of the desert'?|أي حيوان بيسموه سفينة الصحراء؟|Camel|الجمل|Horse|الحصان|Donkey|الحمار|Goat|الماعز
1|What colour is a flamingo usually?|شو لون طائر الفلامنغو عادةً؟|Pink|زهري|White|أبيض|Blue|أزرق|Yellow|أصفر
2|How many hearts does an octopus have?|كم قلب للأخطبوط؟|3|3|1|1|2|2|4|4
2|What is the only mammal that can truly fly?|ما هو الحيوان الثديي الوحيد اللي بيطير فعلاً؟|Bat|الخفاش|Flying squirrel|السنجاب الطائر|Owl|البومة|Penguin|البطريق
2|Which animal sleeps standing up?|أي حيوان بينام وهو واقف؟|Horse|الحصان|Dog|الكلب|Cat|القطة|Rabbit|الأرنب
2|How many teeth does an adult human usually have?|كم سن عند الإنسان البالغ عادةً؟|32|32|28|28|30|30|36|36
2|What is the largest bird in the world?|ما هو أكبر طير بالعالم؟|Ostrich|النعامة|Eagle|النسر|Albatross|القطرس|Emu|الإيمو
2|Which animal's fingerprints are almost identical to humans'?|أي حيوان بصماته شبه بصمات الإنسان تقريباً؟|Koala|الكوالا|Monkey|القرد|Panda|الباندا|Dog|الكلب
2|What is a group of lions called?|شو اسم مجموعة الأسود بالإنجليزي؟|Pride|Pride|Pack|Pack|Herd|Herd|Flock|Flock
2|Which sea creature has no brain, heart or bones?|أي كائن بحري ما عنده دماغ ولا قلب ولا عظام؟|Jellyfish|قنديل البحر|Octopus|الأخطبوط|Shark|القرش|Crab|السلطعون
2|How long is an elephant pregnant for, roughly?|قديش مدة حمل الفيل تقريباً؟|22 months|22 شهر|9 months|9 أشهر|12 months|12 شهر|5 months|5 أشهر
2|What is the slowest mammal in the world?|ما هو أبطأ حيوان ثديي بالعالم؟|Sloth|الكسلان|Turtle|السلحفاة|Koala|الكوالا|Snail|الحلزون
2|Which bird is a symbol of peace?|أي طير رمز للسلام؟|Dove|الحمامة|Eagle|النسر|Crow|الغراب|Owl|البومة
2|Which animal can change its colour to blend in?|أي حيوان بيقدر يغير لونه ليتخبى؟|Chameleon|الحرباء|Frog|الضفدع|Lizard|السحلية|Snake|الأفعى
3|What colour is a polar bear's skin?|شو لون جلد الدب القطبي؟|Black|أسود|White|أبيض|Pink|زهري|Grey|رمادي
3|How many stomach chambers does a cow have?|كم حجرة بمعدة البقرة؟|4|4|2|2|3|3|1|1
3|What is the only bird that can fly backwards?|ما هو الطير الوحيد اللي بيطير لورا؟|Hummingbird|الطائر الطنان|Swallow|السنونو|Sparrow|العصفور|Parrot|الببغاء
3|Which animal has the longest lifespan among these?|أي حيوان من هدول بيعيش أطول؟|Greenland shark|قرش غرينلاند|Elephant|الفيل|Parrot|الببغاء|Horse|الحصان
3|What is a male bee called?|شو اسم ذكر النحل؟|Drone|اليعسوب (الذكر)|Worker|العاملة|Queen|الملكة|Hornet|الدبور
3|How many eyes does a bee have?|كم عين للنحلة؟|5|5|2|2|4|4|8|8
3|Which mammal lays eggs?|أي حيوان ثديي بيبيض؟|Platypus|خلد الماء|Dolphin|الدلفين|Bat|الخفاش|Kangaroo|الكنغر
1|What is H2O?|شو هو H2O؟|Water|الماء|Salt|الملح|Oxygen|الأكسجين|Sugar|السكر
1|How many hours are in a day?|كم ساعة في اليوم؟|24|24|12|12|20|20|36|36
1|What gas do plants take in from the air?|أي غاز بتمتصه النباتات من الهوا؟|Carbon dioxide|ثاني أكسيد الكربون|Oxygen|الأكسجين|Nitrogen|النيتروجين|Helium|الهيليوم
1|What is the closest star to Earth?|ما هو أقرب نجم للأرض؟|The Sun|الشمس|Sirius|الشعرى|Polaris|النجم القطبي|Vega|النسر الواقع
1|What is the freezing point of water in Celsius?|درجة تجمد الماء بالسيلسيوس؟|0°|0°|10°|10°|-10°|-10°|32°|32°
1|What is the boiling point of water at sea level in Celsius?|درجة غليان الماء عند سطح البحر؟|100°|100°|90°|90°|80°|80°|120°|120°
1|Which planet do we live on?|على أي كوكب عايشين؟|Earth|الأرض|Mars|المريخ|Venus|الزهرة|Saturn|زحل
1|Which planet has famous rings?|أي كوكب مشهور بحلقاته؟|Saturn|زحل|Mars|المريخ|Mercury|عطارد|Venus|الزهرة
1|What is the biggest planet in our solar system?|ما هو أكبر كوكب بالمجموعة الشمسية؟|Jupiter|المشتري|Saturn|زحل|Neptune|نبتون|Earth|الأرض
1|What organ pumps blood around the body?|أي عضو بيضخ الدم بالجسم؟|The heart|القلب|The lungs|الرئتين|The liver|الكبد|The brain|الدماغ
1|How many colours are in a rainbow?|كم لون بقوس قزح؟|7|7|5|5|6|6|8|8
1|Which planet is closest to the Sun?|أي كوكب أقرب للشمس؟|Mercury|عطارد|Venus|الزهرة|Mars|المريخ|Earth|الأرض
2|What is the hardest natural substance?|ما هي أقسى مادة طبيعية؟|Diamond|الألماس|Iron|الحديد|Gold|الذهب|Granite|الغرانيت
2|What is the largest organ of the human body?|ما هو أكبر عضو بجسم الإنسان؟|Skin|الجلد|Liver|الكبد|Brain|الدماغ|Lungs|الرئتين
2|How many bones are in the adult human body?|كم عظمة بجسم الإنسان البالغ؟|206|206|186|186|226|226|300|300
2|What is the chemical symbol for gold?|ما هو الرمز الكيميائي للذهب؟|Au|Au|Ag|Ag|Go|Go|Gd|Gd
2|What is the chemical symbol for iron?|ما هو الرمز الكيميائي للحديد؟|Fe|Fe|Ir|Ir|In|In|Fr|Fr
2|Which gas makes up most of the air we breathe?|أي غاز بيشكل أغلب الهوا اللي منتنفسه؟|Nitrogen|النيتروجين|Oxygen|الأكسجين|Carbon dioxide|ثاني أكسيد الكربون|Hydrogen|الهيدروجين
2|How long does light from the Sun take to reach Earth?|قديش بياخد ضو الشمس ليوصل للأرض؟|About 8 minutes|حوالي 8 دقائق|About 8 seconds|حوالي 8 ثواني|About 1 hour|حوالي ساعة|About 1 day|حوالي يوم
2|Which planet is the hottest?|أي كوكب هو الأحر؟|Venus|الزهرة|Mercury|عطارد|Mars|المريخ|Jupiter|المشتري
2|What part of the plant makes food using sunlight?|أي جزء من النبتة بيصنع الغذاء من ضو الشمس؟|The leaves|الأوراق|The roots|الجذور|The flowers|الزهور|The seeds|البذور
2|What is the smallest bone in the human body found in?|وين موجودة أصغر عظمة بجسم الإنسان؟|The ear|الأذن|The toe|إصبع الرجل|The nose|الأنف|The finger|الإصبع
2|What do we call animals that eat only plants?|شو منسمي الحيوانات اللي بتاكل نباتات بس؟|Herbivores|العاشبة|Carnivores|اللاحمة|Omnivores|القارتة|Insectivores|آكلة الحشرات
2|How many planets are in our solar system?|كم كوكب بالمجموعة الشمسية؟|8|8|9|9|7|7|10|10
2|Which blood type is the universal donor?|أي زمرة دم هي المعطي العام؟|O negative|O سالب|AB positive|AB موجب|A positive|A موجب|B negative|B سالب
2|What is the centre of an atom called?|شو اسم مركز الذرة؟|Nucleus|النواة|Electron|الإلكترون|Proton only|البروتون بس|Shell|الغلاف
3|What is the most common element in the universe?|ما هو أكثر عنصر منتشر بالكون؟|Hydrogen|الهيدروجين|Helium|الهيليوم|Oxygen|الأكسجين|Carbon|الكربون
3|What is the speed of light, roughly?|قديش سرعة الضو تقريباً؟|300,000 km/s|300 ألف كم/ث|30,000 km/s|30 ألف كم/ث|3,000 km/s|3 آلاف كم/ث|1 million km/s|مليون كم/ث
3|What is the chemical symbol for sodium?|ما هو الرمز الكيميائي للصوديوم؟|Na|Na|So|So|Sd|Sd|S|S
3|Which planet has the most moons (as of 2024)?|أي كوكب عنده أكتر أقمار (حتى 2024)؟|Saturn|زحل|Jupiter|المشتري|Uranus|أورانوس|Neptune|نبتون
3|Who proposed the theory of relativity?|مين طرح نظرية النسبية؟|Albert Einstein|ألبرت أينشتاين|Isaac Newton|إسحاق نيوتن|Nikola Tesla|نيكولا تسلا|Galileo|غاليليو
3|What is the pH of pure water?|قديش الـ pH للماء النقي؟|7|7|0|0|10|10|5|5
3|Which vitamin does the body make from sunlight?|أي فيتامين بيصنعه الجسم من ضو الشمس؟|Vitamin D|فيتامين د|Vitamin C|فيتامين ج|Vitamin A|فيتامين أ|Vitamin B12|فيتامين ب12
3|Which Muslim scholar is called the father of algebra?|مين العالم المسلم الملقب بأبو الجبر؟|Al-Khwarizmi|الخوارزمي|Ibn Sina|ابن سينا|Al-Biruni|البيروني|Ibn Rushd|ابن رشد
3|Who wrote 'The Canon of Medicine'?|مين كتب كتاب القانون في الطب؟|Ibn Sina (Avicenna)|ابن سينا|Al-Razi|الرازي|Ibn al-Haytham|ابن الهيثم|Al-Farabi|الفارابي
3|Which scientist is famous for early work on optics in Cairo?|أي عالم مشهور بأعمال البصريات المبكرة بالقاهرة؟|Ibn al-Haytham|ابن الهيثم|Al-Kindi|الكندي|Jabir ibn Hayyan|جابر بن حيان|Omar Khayyam|عمر الخيام
3|How many chromosomes do humans normally have?|كم كروموسوم عند الإنسان عادةً؟|46|46|23|23|44|44|48|48
3|What is the rarest blood type?|ما هي أندر زمرة دم؟|AB negative|AB سالب|O positive|O موجب|A positive|A موجب|B positive|B موجب
`.trim().split("\n"));
