export const venues = [
    {
        id: "v001",
        name: "Phở Hà Nội Số 1",
        nameLocal: {
            vi: "Phở Hà Nội Số 1",
            en: "Hanoi Pho No.1",
            zh: "河内河粉1号",
            ja: "ハノイフォー1号店",
            ko: "하노이 쌀국수 1호점",
            fr: "Phở de Hanoi N°1",
            de: "Hanoi Phở Nr. 1",
            es: "Phở de Hanói N°1",
            it: "Phở di Hanoi N°1",
            pt: "Phở de Hanói N°1",
            ru: "Ханойский Фо №1",
            ar: "فو هانوي رقم 1",
            th: "โฝฮานอย หมายเลข 1",
            id: "Phở Hanoi No.1",
            hi: "हनोई फो नं.1"
        },
        category: "vietnamese",
        description: "Iconic Hanoi-style pho with rich, clear broth simmered for 12 hours. A must-try on the food street.",
        descriptionLocal: {
            vi: "Phở Hà Nội chính gốc với nước dùng trong, ngọt, được ninh xương 12 tiếng. Điểm đến không thể bỏ qua trên phố ẩm thực.",
            en: "Iconic Hanoi-style pho with rich, clear broth simmered for 12 hours. A must-try on the food street.",
            zh: "正宗河内河粉，汤底清澈鲜甜，经过12小时熬制。美食街必尝佳肴。",
            ja: "12時間煮込んだ澄んだスープが特徴の本場ハノイ風フォー。フードストリートで必食の一品。",
            ko: "12시간 끓인 맑고 진한 국물의 정통 하노이 스타일 쌀국수. 푸드 스트리트 필수 방문지.",
            fr: "Le phở de style Hanoï emblématique avec un bouillon riche et clair mijoté pendant 12 heures.",
            de: "Ikonisches Hanoi-Phở mit reichhaltigem, klarem Brühe, 12 Stunden köcheln gelassen.",
            es: "El icónico phở al estilo de Hanói con un caldo rico y claro cocinado a fuego lento durante 12 horas.",
            it: "L'iconico phở in stile Hanoi con un brodo ricco e chiaro cucinato per 12 ore.",
            pt: "O icônico phở do estilo de Hanói com caldo rico e claro cozido por 12 horas.",
            ru: "Знаменитый фо в стиле Ханоя с наваристым прозрачным бульоном, варённым 12 часов.",
            ar: "فو هانوي الأيقوني بمرق غني وصافٍ يُطهى على نار هادئة لمدة 12 ساعة.",
            th: "โฝสไตล์ฮานอยสุดไอคอนิก น้ำซุปใสข้นกลมกล่อม เคี่ยว 12 ชั่วโมง",
            id: "Pho gaya Hanoi yang ikonik dengan kaldu kaya dan bening yang direbus selama 12 jam.",
            hi: "12 घंटे उबाला हुआ समृद्ध, साफ शोरबे के साथ प्रतिष्ठित हनोई-शैली का फो।"
        },
        lat: 10.7769,
        lng: 106.7009,
        address: "26 Lê Lợi, Quận 1, TP.HCM",
        rating: 4.8,
        reviewCount: 1243,
        imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
        isOpen: true,
        audioRadius: 50,
        priceRange: "$",
        tags: ["pho", "noodles", "beef", "traditional"],
        phone: "028 3821 1234",
        website: "https://phohanoi1.example.com",
        hours: {
            Mon: "06:00 - 22:00",
            Tue: "06:00 - 22:00",
            Wed: "06:00 - 22:00",
            Thu: "06:00 - 22:00",
            Fri: "06:00 - 23:00",
            Sat: "06:00 - 23:00",
            Sun: "07:00 - 21:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
            "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
            "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80"
        ],
        menu: [
            { id: "m001", name: "Phở Bò Tái", nameLocal: { vi: "Phở Bò Tái", en: "Rare Beef Pho", zh: "生牛肉河粉" }, description: "Pho with rare sliced beef", price: 65000, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80" },
            { id: "m002", name: "Phở Gà", nameLocal: { vi: "Phở Gà", en: "Chicken Pho", zh: "鸡肉河粉" }, description: "Pho with shredded chicken", price: 60000, isFeatured: false },
            { id: "m003", name: "Phở Chín", nameLocal: { vi: "Phở Chín", en: "Well-done Beef Pho", zh: "熟牛肉河粉" }, description: "Pho with well-done beef brisket", price: 65000, isFeatured: false }
        ],
        reviews: [
            { id: "r001", author: "Nguyễn Minh", rating: 5, comment: "Nước dùng trong và ngọt, thịt tươi mềm. Tuyệt vời!", date: "2025-03-01", lang: "vi" },
            { id: "r002", author: "John Smith", rating: 5, comment: "Best pho I've ever had! The broth is incredibly flavorful.", date: "2025-02-20", lang: "en" },
            { id: "r003", author: "田中太郎", rating: 4, comment: "スープが濃厚で美味しかった。また来たい！", date: "2025-02-15", lang: "ja" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en", "zh", "ja", "ko", "fr"],
        audioTranscripts: {
            vi: "Chào mừng bạn đến với Phở Hà Nội Số 1! Đây là quán phở nổi tiếng nhất trên phố ẩm thực với hơn 20 năm kinh nghiệm. Nước dùng được ninh xương bò trong 12 giờ đồng hồ, tạo nên hương vị đặc trưng không thể quên. Hãy ghé vào thưởng thức!",
            en: "Welcome to Hanoi Pho No.1! This is the most famous pho restaurant on the food street with over 20 years of experience. Our broth is simmered from beef bones for 12 hours, creating an unforgettable flavor. Come in and enjoy!",
            zh: "欢迎来到河内河粉1号！这是美食街上最著名的河粉餐厅，拥有超过20年的经验。我们的汤底由牛骨熬制12小时，风味难以忘怀。请进来享用！",
            ja: "ハノイフォー1号店へようこそ！20年以上の歴史を誇るフードストリートで最も有名なフォーレストランです。牛骨を12時間煮込んだスープは忘れられない風味。ぜひお越しください！",
            ko: "하노이 쌀국수 1호점에 오신 것을 환영합니다! 20년 이상의 경험을 가진 푸드 스트리트에서 가장 유명한 쌀국수 식당입니다. 12시간 동안 소뼈를 끓인 국물은 잊을 수 없는 맛입니다. 어서 들어오세요!",
            fr: "Bienvenue au Phở de Hanoi N°1! C'est le restaurant de phở le plus célèbre de la rue gastronomique avec plus de 20 ans d'expérience."
        }
    },
    {
        id: "v002",
        name: "Bánh Mì Hội An",
        nameLocal: {
            vi: "Bánh Mì Hội An",
            en: "Hoi An Banh Mi",
            zh: "会安越南三明治",
            ja: "ホイアンバインミー",
            ko: "호이안 반미",
            fr: "Bánh Mì de Hội An",
            de: "Hội An Bánh Mì",
            es: "Bánh Mì de Hội An",
            it: "Bánh Mì di Hội An",
            pt: "Bánh Mì de Hội An",
            ru: "Баньми из Хойана",
            ar: "بانه مي هوي آن",
            th: "บานห์มี ฮอยอัน",
            id: "Bánh Mì Hội An",
            hi: "होई एन बान्ह मि"
        },
        category: "banh-mi",
        description: "Crispy baguette stuffed with pâté, char siu, fresh herbs and house sauce. Award-winning recipe since 2015.",
        descriptionLocal: {
            vi: "Bánh mì giòn rụm nhân pate, thịt nướng, rau thơm tươi và sốt đặc biệt. Công thức đạt giải thưởng từ năm 2015.",
            en: "Crispy baguette stuffed with pâté, char siu, fresh herbs and house sauce. Award-winning recipe since 2015.",
            zh: "脆皮法棍夹着肝酱、叉烧肉、新鲜香草和特制酱汁。自2015年以来获奖配方。",
            ja: "パテ、チャーシュー、フレッシュハーブ、特製ソースを詰めたクリスピーバゲット。2015年から受賞レシピ。",
            ko: "파테, 차슈, 신선한 허브, 특제 소스를 넣은 바삭한 바게트. 2015년부터 수상 레시피.",
            fr: "Baguette croustillante farcie de pâté, char siu, herbes fraîches et sauce maison. Recette primée depuis 2015.",
            de: "Knuspriges Baguette mit Pastete, Char Siu, frischen Kräutern und Haussoße. Preisgekröntes Rezept seit 2015.",
            es: "Baguette crujiente rellena de paté, char siu, hierbas frescas y salsa de la casa. Receta galardonada desde 2015.",
            it: "Baguette croccante ripiena di pâté, char siu, erbe fresche e salsa della casa. Ricetta premiata dal 2015.",
            pt: "Baguete crocante recheado com patê, char siu, ervas frescas e molho da casa. Receita premiada desde 2015.",
            ru: "Хрустящий багет с паштетом, свининой чар-шу, свежей зеленью и домашним соусом. Рецепт-победитель с 2015 года.",
            ar: "خبز باجيت مقرمش محشو بالباتيه واللحم المشوي والأعشاب الطازجة والصلصة المنزلية. وصفة حائزة على جوائز منذ 2015.",
            th: "บาแกตกรอบยัดไส้ด้วยพาเต้ หมูชาร์ชิว สมุนไพรสด และซอสพิเศษ สูตรรางวัลตั้งแต่ปี 2015",
            id: "Baguette renyah berisi pâté, char siu, rempah segar dan saus khusus. Resep pemenang penghargaan sejak 2015.",
            hi: "पाते, चार सिउ, ताजी जड़ी-बूटियों और घर की सॉस से भरा कुरकुरा बेगेट। 2015 से पुरस्कार विजेता नुस्खा।"
        },
        lat: 10.7751,
        lng: 106.6986,
        address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
        rating: 4.9,
        reviewCount: 2156,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        isOpen: true,
        audioRadius: 40,
        priceRange: "$",
        tags: ["banh-mi", "bread", "quick-bite", "award-winning"],
        phone: "028 3822 5678",
        hours: {
            Mon: "06:30 - 20:00",
            Tue: "06:30 - 20:00",
            Wed: "06:30 - 20:00",
            Thu: "06:30 - 20:00",
            Fri: "06:30 - 21:00",
            Sat: "06:30 - 21:00",
            Sun: "07:00 - 19:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
        ],
        menu: [
            { id: "m004", name: "Bánh Mì Đặc Biệt", nameLocal: { vi: "Bánh Mì Đặc Biệt", en: "Special Banh Mi", zh: "特制越南三明治" }, description: "Full combo with all fillings", price: 35000, isFeatured: true },
            { id: "m005", name: "Bánh Mì Pate", nameLocal: { vi: "Bánh Mì Pate", en: "Pate Banh Mi", zh: "肝酱越南三明治" }, description: "Classic pate and butter", price: 25000, isFeatured: false },
            { id: "m006", name: "Bánh Mì Chả Lụa", nameLocal: { vi: "Bánh Mì Chả Lụa", en: "Vietnamese Ham Banh Mi" }, description: "Vietnamese pork roll filling", price: 30000, isFeatured: false }
        ],
        reviews: [
            { id: "r004", author: "Trần Thị Lan", rating: 5, comment: "Bánh mì giòn, nhân đầy đặn. Ăn là ghiền ngay!", date: "2025-03-05", lang: "vi" },
            { id: "r005", author: "Marie Dupont", rating: 5, comment: "Le meilleur bánh mì que j'ai mangé! La sauce est incroyable.", date: "2025-02-28", lang: "fr" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en", "zh", "ja", "ko", "fr"],
        audioTranscripts: {
            vi: "Chào mừng đến Bánh Mì Hội An! Chúng tôi tự hào là quán bánh mì ngon nhất phố ẩm thực. Bánh mì giòn rụm, nhân pate béo ngậy, thịt nướng thơm lừng và rau sống tươi mát. Giá chỉ từ 25.000 đồng. Hãy thử ngay!",
            en: "Welcome to Hoi An Banh Mi! We're proud to be the best banh mi on the food street. Crispy bread, rich pâté, fragrant grilled meat and fresh vegetables. Starting from just 25,000 VND. Try it now!",
            zh: "欢迎来到会安越南三明治！我们自豪地成为美食街上最好的越南三明治。面包酥脆，馅料丰富，肉香扑鼻，蔬菜新鲜。仅从25,000越南盾起。快来尝尝！",
            ja: "ホイアンバインミーへようこそ！フードストリートで最高のバインミーを誇りに思います。サクサクのパン、リッチなパテ、香ばしいグリルミート、新鮮な野菜。25,000ドンから。今すぐお試しを！",
            ko: "호이안 반미에 오신 것을 환영합니다! 푸드 스트리트에서 최고의 반미를 자랑스럽게 생각합니다. 바삭한 빵, 풍부한 파테, 향긋한 구운 고기, 신선한 채소. 25,000동부터. 지금 바로 드세요!",
            fr: "Bienvenue au Bánh Mì de Hội An! Nous sommes fiers d'être le meilleur bánh mì de la rue gastronomique. Pain croustillant, pâté riche, viande grillée parfumée et légumes frais."
        }
    },
    {
        id: "v003",
        name: "Cà Phê Trứng Việt",
        nameLocal: {
            vi: "Cà Phê Trứng Việt",
            en: "Vietnamese Egg Coffee",
            zh: "越南鸡蛋咖啡",
            ja: "ベトナムエッグコーヒー",
            ko: "베트남 에그 커피",
            fr: "Café à l'Oeuf Vietnamien",
            de: "Vietnamesischer Eikaffee",
            es: "Café con Huevo Vietnamita",
            it: "Caffè all'Uovo Vietnamita",
            pt: "Café com Ovo Vietnamita",
            ru: "Вьетнамский кофе с яйцом",
            ar: "قهوة البيض الفيتنامية",
            th: "กาแฟไข่เวียดนาม",
            id: "Kopi Telur Vietnam",
            hi: "वियतनामी अंडा कॉफ़ी"
        },
        category: "coffee",
        description: "Legendary Vietnamese egg coffee - a velvety, creamy foam of whisked egg yolk on strong Robusta coffee. A unique Hanoi tradition.",
        descriptionLocal: {
            vi: "Cà phê trứng huyền thoại - lớp kem trứng mịn mướt, béo ngậy trên nền cà phê Robusta đậm đà. Nét ẩm thực độc đáo của Hà Nội.",
            en: "Legendary Vietnamese egg coffee - a velvety, creamy foam of whisked egg yolk on strong Robusta coffee. A unique Hanoi tradition.",
            zh: "传奇越南鸡蛋咖啡——在浓郁罗布斯塔咖啡上覆盖丝滑奶油蛋黄泡沫。河内独特的饮食文化传统。",
            ja: "伝説のベトナムエッグコーヒー - 濃いロブスタコーヒーの上に泡立てた卵黄のベルベットのようなクリーミーな泡。ハノイのユニークな伝統。",
            ko: "전설적인 베트남 에그 커피 - 진한 로부스타 커피 위에 거품을 낸 달걀 노른자의 부드러운 크리미한 거품. 하노이의 독특한 전통.",
            fr: "Le légendaire café à l'œuf vietnamien - une mousse crémeuse et veloutée de jaune d'œuf fouetté sur un café Robusta fort. Une tradition unique de Hanoï.",
            de: "Der legendäre vietnamesische Eikaffee - ein samtiger, cremiger Schaum aus geschlagenem Eigelb auf starkem Robusta-Kaffee.",
            es: "El legendario café con huevo vietnamita: una espuma cremosa y aterciopelada de yema de huevo batida sobre un café Robusta fuerte.",
            it: "Il leggendario caffè all'uovo vietnamita - una schiuma vellutata e cremosa di tuorlo d'uovo sbattuto su un forte caffè Robusta.",
            pt: "O lendário café com ovo vietnamita - uma espuma cremosa e aveludada de gema de ovo batida sobre um forte café Robusta.",
            ru: "Легендарный вьетнамский кофе с яйцом - бархатистая кремовая пена из взбитого яичного желтка на крепком кофе Робуста.",
            ar: "قهوة البيض الفيتنامية الأسطورية - رغوة كريمية ومخملية من صفار البيض المخفوق على قهوة روبوستا قوية.",
            th: "กาแฟไข่เวียดนามในตำนาน - ครีมไข่แดงตีฟูบนกาแฟโรบัสต้าเข้มข้น ประเพณีเฉพาะของฮานอย",
            id: "Kopi telur Vietnam yang legendaris - busa krim yang lembut dan beludru dari kuning telur yang dikocok di atas kopi Robusta yang kuat.",
            hi: "पौराणिक वियतनामी एग कॉफी - मजबूत रोबस्टा कॉफी पर व्हिस्क्ड अंडे की जर्दी का मखमली, मलाईदार झाग।"
        },
        lat: 10.7763,
        lng: 106.7021,
        address: "78 Đồng Khởi, Quận 1, TP.HCM",
        rating: 4.7,
        reviewCount: 876,
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
        isOpen: true,
        audioRadius: 45,
        priceRange: "$$",
        tags: ["coffee", "egg-coffee", "unique", "instagrammable"],
        phone: "028 3823 9012",
        hours: {
            Mon: "07:00 - 21:00",
            Tue: "07:00 - 21:00",
            Wed: "07:00 - 21:00",
            Thu: "07:00 - 21:00",
            Fri: "07:00 - 22:00",
            Sat: "07:00 - 22:00",
            Sun: "08:00 - 20:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
        ],
        menu: [
            { id: "m007", name: "Cà Phê Trứng", nameLocal: { vi: "Cà Phê Trứng", en: "Egg Coffee", zh: "鸡蛋咖啡" }, description: "Classic egg coffee", price: 45000, isFeatured: true },
            { id: "m008", name: "Cà Phê Sữa Đá", nameLocal: { vi: "Cà Phê Sữa Đá", en: "Iced Milk Coffee", zh: "越南冰咖啡" }, description: "Iced Vietnamese coffee with condensed milk", price: 35000, isFeatured: false },
            { id: "m009", name: "Matcha Trứng", nameLocal: { vi: "Matcha Trứng", en: "Egg Matcha", zh: "抹茶鸡蛋" }, description: "Egg foam on matcha", price: 50000, isFeatured: false }
        ],
        reviews: [
            { id: "r006", author: "Lê Văn Hùng", rating: 5, comment: "Cà phê trứng ở đây ngon nhất Sài Gòn. Lớp kem trứng mịn như nhung!", date: "2025-03-10", lang: "vi" },
            { id: "r007", author: "Sarah Johnson", rating: 5, comment: "This egg coffee changed my life! So unique and delicious.", date: "2025-03-08", lang: "en" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en", "zh", "ja", "ko"],
        audioTranscripts: {
            vi: "Chào mừng đến Cà Phê Trứng Việt! Nơi đây mang đến cho bạn trải nghiệm cà phê trứng thượng hạng - ly cà phê Robusta đậm đà phủ lớp kem trứng mịn như nhung. Một hương vị độc đáo chỉ có ở Việt Nam. Hãy ngồi xuống và thưởng thức!",
            en: "Welcome to Vietnamese Egg Coffee! Here we bring you a premium egg coffee experience - strong Robusta coffee topped with velvety egg cream. A unique flavor only found in Vietnam. Sit down and enjoy!",
            zh: "欢迎来到越南鸡蛋咖啡！我们为您带来高级鸡蛋咖啡体验——浓郁的罗布斯塔咖啡上覆盖丝滑蛋黄奶油。越南独有的独特风味。请坐下来享用！",
            ja: "ベトナムエッグコーヒーへようこそ！濃いロブスタコーヒーにベルベットのような卵クリームをトッピングしたプレミアムエッグコーヒー体験をお届けします。ベトナムだけのユニークな風味。どうぞお座りください！",
            ko: "베트남 에그 커피에 오신 것을 환영합니다! 진한 로부스타 커피 위에 부드러운 에그 크림을 올린 프리미엄 에그 커피 경험을 드립니다. 베트남에서만 맛볼 수 있는 독특한 맛. 앉아서 즐겨보세요!"
        }
    },
    {
        id: "v004",
        name: "Lẩu Thái Sầu",
        nameLocal: {
            vi: "Lẩu Thái Sầu",
            en: "Tom Yum Hotpot",
            zh: "泰式火锅",
            ja: "タイ風火鍋",
            ko: "태국식 훠궈",
            fr: "Fondue Thaïlandaise",
            de: "Thai-Feuertopf",
            es: "Fondue Tailandesa",
            it: "Hotpot Tailandese",
            pt: "Fondue Tailandesa",
            ru: "Тайский суп-фондю",
            ar: "فوندو تايلاندي",
            th: "ต้มยำหม้อไฟ",
            id: "Hotpot Thailand",
            hi: "थाई हॉटपॉट"
        },
        category: "hotpot",
        description: "Authentic Tom Yum and Suki hotpot with premium fresh seafood and a wide selection of dipping sauces.",
        descriptionLocal: {
            vi: "Lẩu Thái chua cay chuẩn vị với hải sản tươi cao cấp và nhiều loại nước chấm đặc sắc.",
            en: "Authentic Tom Yum and Suki hotpot with premium fresh seafood and a wide selection of dipping sauces.",
            zh: "正宗冬阴功和素基火锅，配以优质新鲜海鲜和多种蘸料。",
            ja: "トムヤムとスキ火鍋、プレミアム新鮮シーフードと豊富なつけダレ。",
            ko: "정통 똠얌과 수끼 훠궈, 프리미엄 신선 해산물과 다양한 딥핑 소스.",
            fr: "Authentique fondue Tom Yum et Suki avec des fruits de mer frais haut de gamme.",
            de: "Authentischer Tom Yum und Suki Feuertopf mit hochwertigem frischem Meeresfrüchten.",
            es: "Auténtica fondue Tom Yum y Suki con mariscos frescos premium.",
            it: "Autentico hotpot Tom Yum e Suki con frutti di mare freschi premium.",
            pt: "Fondue autêntico Tom Yum e Suki com frutos do mar frescos premium.",
            ru: "Аутентичный суп-фондю Том Ям и Суки с отборными свежими морепродуктами.",
            ar: "فوندو توم يام وسوكي الأصيل مع المأكولات البحرية الطازجة الفاخرة.",
            th: "ต้มยำหม้อไฟและสุกี้แท้ๆ พร้อมอาหารทะเลสดชั้นดี และน้ำจิ้มหลากหลาย",
            id: "Hotpot Tom Yum dan Suki yang otentik dengan makanan laut segar premium.",
            hi: "प्रीमियम ताजे समुद्री भोजन के साथ प्रामाणिक टॉम यम और सुकी हॉटपॉट।"
        },
        lat: 10.7742,
        lng: 106.6977,
        address: "12 Phạm Ngũ Lão, Quận 1, TP.HCM",
        rating: 4.6,
        reviewCount: 654,
        imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
        isOpen: true,
        audioRadius: 60,
        priceRange: "$$",
        tags: ["hotpot", "thai", "seafood", "spicy"],
        phone: "028 3920 3456",
        hours: {
            Mon: "11:00 - 23:00",
            Tue: "11:00 - 23:00",
            Wed: "11:00 - 23:00",
            Thu: "11:00 - 23:00",
            Fri: "11:00 - 24:00",
            Sat: "11:00 - 24:00",
            Sun: "11:00 - 23:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80"
        ],
        menu: [
            { id: "m010", name: "Lẩu Thái Hải Sản", nameLocal: { vi: "Lẩu Thái Hải Sản", en: "Thai Seafood Hotpot", zh: "泰式海鲜火锅" }, description: "Tom yum broth with mixed seafood", price: 380000, isFeatured: true },
            { id: "m011", name: "Lẩu Thái Gà", nameLocal: { vi: "Lẩu Thái Gà", en: "Thai Chicken Hotpot" }, description: "Tom yum with chicken", price: 280000, isFeatured: false }
        ],
        reviews: [
            { id: "r008", author: "Phạm Thị Mai", rating: 5, comment: "Lẩu cay đúng kiểu Thái, nước dùng đậm đà. Hải sản tươi ngon!", date: "2025-03-03", lang: "vi" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en", "th"],
        audioTranscripts: {
            vi: "Chào mừng đến Lẩu Thái Sầu! Thưởng thức nồi lẩu Thái chua cay đúng điệu với hải sản tươi sống được nhập về mỗi ngày. Chúng tôi có hơn 20 loại nước chấm đặc biệt. Bàn cho nhóm bạn, gia đình đều có sẵn. Mời vào dùng bữa!",
            en: "Welcome to Tom Yum Hotpot! Enjoy authentic Thai-style sour and spicy hotpot with fresh seafood imported daily. We have over 20 special dipping sauces. Tables available for groups and families. Come dine with us!",
            th: "ยินดีต้อนรับสู่ต้มยำหม้อไฟ! เพลิดเพลินกับหม้อไฟต้มยำสไตล์ไทยแท้ๆ พร้อมอาหารทะเลสดนำเข้าทุกวัน มีน้ำจิ้มพิเศษกว่า 20 ชนิด"
        }
    },
    {
        id: "v005",
        name: "Hải Sản Bãi Sau",
        nameLocal: {
            vi: "Hải Sản Bãi Sau",
            en: "Bay Sau Seafood",
            zh: "后湾海鲜",
            ja: "バイサウシーフード",
            ko: "바이 사우 해산물",
            fr: "Fruits de Mer Bãi Sau",
            de: "Bãi Sau Meeresfrüchte",
            es: "Mariscos Bãi Sau",
            it: "Frutti di Mare Bãi Sau",
            pt: "Frutos do Mar Bãi Sau",
            ru: "Морепродукты Бай Сау",
            ar: "مأكولات بحرية باي ساو",
            th: "อาหารทะเล บ่ายเซา",
            id: "Seafood Bãi Sau",
            hi: "बाई साउ समुद्री भोजन"
        },
        category: "seafood",
        description: "Fresh grilled seafood direct from the fishing boats - crabs, lobsters, shrimp and fish grilled to perfection with Vietnamese spices.",
        descriptionLocal: {
            vi: "Hải sản tươi nướng thẳng từ tàu đánh cá - cua, tôm hùm, tôm, cá được nướng hoàn hảo với gia vị Việt Nam.",
            en: "Fresh grilled seafood direct from the fishing boats - crabs, lobsters, shrimp and fish grilled to perfection with Vietnamese spices.",
            zh: "直接从渔船上取来的新鲜烤海鲜——螃蟹、龙虾、虾和鱼，配以越南香料烤制完美。",
            ja: "漁船から直接仕入れた新鮮な焼きシーフード - カニ、ロブスター、エビ、魚がベトナムのスパイスで完璧に焼かれています。",
            ko: "어선에서 직접 가져온 신선한 구운 해산물 - 게, 랍스터, 새우, 생선이 베트남 향신료로 완벽하게 구워집니다.",
            fr: "Fruits de mer frais grillés directement des bateaux de pêche - crabes, homards, crevettes et poissons grillés parfaitement avec des épices vietnamiennes.",
            de: "Frische gegrillte Meeresfrüchte direkt von den Fischerbooten - Krabben, Hummer, Garnelen und Fisch perfekt mit vietnamesischen Gewürzen gegrillt.",
            es: "Mariscos frescos a la parrilla directamente de los barcos pesqueros - cangrejos, langostas, camarones y pescado a la parrilla a la perfección con especias vietnamitas.",
            it: "Frutti di mare freschi alla griglia direttamente dai pescherecci - granchi, aragoste, gamberi e pesce alla griglia alla perfezione con spezie vietnamite.",
            pt: "Frutos do mar frescos grelhados diretamente dos barcos de pesca - caranguejos, lagostas, camarões e peixes grelhados na perfeição com especiarias vietnamitas.",
            ru: "Свежие жареные морепродукты прямо с рыболовных судов - крабы, омары, креветки и рыба, идеально приготовленные с вьетнамскими специями.",
            ar: "مأكولات بحرية طازجة مشوية مباشرة من قوارب الصيد - سرطانات البحر والكركند والروبيان والأسماك المشوية بشكل مثالي مع البهارات الفيتنامية.",
            th: "อาหารทะเลสดปิ้งย่างจากเรือประมงโดยตรง - ปู กุ้งมังกร กุ้ง และปลา ย่างสมบูรณ์แบบด้วยเครื่องเทศเวียดนาม",
            id: "Makanan laut segar panggang langsung dari perahu nelayan - kepiting, lobster, udang dan ikan yang dipanggang sempurna dengan bumbu Vietnam.",
            hi: "मछली पकड़ने वाली नावों से सीधे ताज़ा ग्रिल्ड समुद्री भोजन - केकड़े, झींगा मछली, झींगा और मछली वियतनामी मसालों के साथ पूर्णता के लिए ग्रिल की गई।"
        },
        lat: 10.7758,
        lng: 106.6995,
        address: "33 Bùi Viện, Quận 1, TP.HCM",
        rating: 4.7,
        reviewCount: 1089,
        imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
        isOpen: true,
        audioRadius: 55,
        priceRange: "$$$",
        tags: ["seafood", "grilled", "fresh", "premium"],
        phone: "028 3925 7890",
        hours: {
            Mon: "10:00 - 23:00",
            Tue: "10:00 - 23:00",
            Wed: "10:00 - 23:00",
            Thu: "10:00 - 23:00",
            Fri: "10:00 - 24:00",
            Sat: "10:00 - 24:00",
            Sun: "10:00 - 23:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80"
        ],
        menu: [
            { id: "m012", name: "Cua Rang Me", nameLocal: { vi: "Cua Rang Me", en: "Tamarind Crab", zh: "罗望子炒蟹" }, description: "Stir-fried crab in tamarind sauce", price: 450000, isFeatured: true },
            { id: "m013", name: "Tôm Hùm Nướng", nameLocal: { vi: "Tôm Hùm Nướng", en: "Grilled Lobster" }, description: "Grilled lobster with butter and garlic", price: 850000, isFeatured: true },
            { id: "m014", name: "Mực Nướng Sa Tế", nameLocal: { vi: "Mực Nướng Sa Tế", en: "Grilled Squid with Satay" }, description: "Squid grilled with satay sauce", price: 150000, isFeatured: false }
        ],
        reviews: [
            { id: "r009", author: "Hoàng Văn Nam", rating: 5, comment: "Hải sản tươi ngon, giá hợp lý. Cua rang me xuất sắc!", date: "2025-03-07", lang: "vi" },
            { id: "r010", author: "Li Wei", rating: 4, comment: "非常新鲜的海鲜，服务很好。螃蟹和龙虾都很棒！", date: "2025-03-01", lang: "zh" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en", "zh"],
        audioTranscripts: {
            vi: "Chào mừng đến Hải Sản Bãi Sau! Hải sản tươi nhất Sài Gòn đang chờ bạn. Cua, tôm hùm, mực, cá được lấy thẳng từ biển mỗi sáng. Đặc biệt hôm nay có cua rang me và tôm hùm nướng bơ tỏi. Mời vào ăn tối!",
            en: "Welcome to Bay Sau Seafood! The freshest seafood in Saigon awaits you. Crabs, lobsters, squid, and fish brought in fresh from the sea every morning. Today's specials include tamarind crab and garlic butter grilled lobster. Come join us for dinner!",
            zh: "欢迎来到后湾海鲜！西贡最新鲜的海鲜等待着您。每天早上从海里直接带来的螃蟹、龙虾、鱿鱼和鱼。今天的特色菜包括罗望子炒蟹和蒜香黄油烤龙虾。请来用餐！"
        }
    },
    {
        id: "v006",
        name: "Quán Chay Tịnh Tâm",
        nameLocal: {
            vi: "Quán Chay Tịnh Tâm",
            en: "Tinh Tam Vegetarian",
            zh: "净心素食馆",
            ja: "ティンタム精進料理",
            ko: "팅 탐 채식 식당",
            fr: "Restaurant Végétarien Tịnh Tâm",
            de: "Tịnh Tâm Vegetarisch",
            es: "Restaurante Vegetariano Tịnh Tâm",
            it: "Ristorante Vegetariano Tịnh Tâm",
            pt: "Restaurante Vegetariano Tịnh Tâm",
            ru: "Вегетарианский ресторан Тинь Там",
            ar: "مطعم نباتي تينه تام",
            th: "ร้านมังสวิรัติ ทินห์ ตำ",
            id: "Restoran Vegetarian Tịnh Tâm",
            hi: "तिन्ह ताम शाकाहारी रेस्तरां"
        },
        category: "vegetarian",
        description: "Pure Buddhist vegetarian cuisine crafted with mindfulness. Over 50 dishes using fresh herbs, mushrooms, and tofu from local farms.",
        descriptionLocal: {
            vi: "Ẩm thực chay thuần Phật giáo được nấu với tâm thành. Hơn 50 món sử dụng rau thơm, nấm và đậu phụ tươi từ nông trại địa phương.",
            en: "Pure Buddhist vegetarian cuisine crafted with mindfulness. Over 50 dishes using fresh herbs, mushrooms, and tofu from local farms.",
            zh: "用心制作的纯佛教素食料理。50多道菜使用来自当地农场的新鲜香草、蘑菇和豆腐。",
            ja: "心を込めて作られた純粋な仏教精進料理。地元の農場からの新鮮なハーブ、キノコ、豆腐を使った50以上の料理。",
            ko: "마음을 담아 만든 순수한 불교 채식 요리. 지역 농장의 신선한 허브, 버섯, 두부를 사용한 50가지 이상의 요리.",
            fr: "Cuisine végétarienne bouddhiste pure préparée avec soin. Plus de 50 plats utilisant des herbes fraîches, des champignons et du tofu de fermes locales.",
            de: "Reine buddhistische vegetarische Küche mit Achtsamkeit zubereitet. Über 50 Gerichte mit frischen Kräutern, Pilzen und Tofu von lokalen Bauernhöfen.",
            es: "Cocina vegetariana budista pura elaborada con atención plena. Más de 50 platos con hierbas frescas, champiñones y tofu de granjas locales.",
            it: "Cucina vegetariana buddhista pura preparata con consapevolezza. Oltre 50 piatti con erbe fresche, funghi e tofu da fattorie locali.",
            pt: "Culinária vegetariana budista pura elaborada com atenção plena. Mais de 50 pratos usando ervas frescas, cogumelos e tofu de fazendas locais.",
            ru: "Чистая буддийская вегетарианская кухня, приготовленная с осознанностью. Более 50 блюд из свежих трав, грибов и тофу с местных ферм.",
            ar: "مطبخ نباتي بوذي خالص مُعد بعناية فائقة. أكثر من 50 طبقًا باستخدام الأعشاب الطازجة والفطر والتوفو من المزارع المحلية.",
            th: "อาหารมังสวิรัติพุทธแท้ๆ ปรุงด้วยสมาธิ กว่า 50 เมนูใช้สมุนไพรสด เห็ด และเต้าหู้จากฟาร์มท้องถิ่น",
            id: "Masakan vegetarian Buddha murni yang dibuat dengan penuh perhatian. Lebih dari 50 hidangan menggunakan rempah segar, jamur, dan tahu dari pertanian lokal.",
            hi: "सावधानी से तैयार की गई शुद्ध बौद्ध शाकाहारी व्यंजन। स्थानीय खेतों से ताजी जड़ी-बूटियों, मशरूम और टोफू का उपयोग करके 50 से अधिक व्यंजन।"
        },
        lat: 10.7748,
        lng: 106.7003,
        address: "89 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
        rating: 4.5,
        reviewCount: 432,
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
        isOpen: true,
        audioRadius: 50,
        priceRange: "$",
        tags: ["vegetarian", "vegan", "healthy", "organic", "buddhist"],
        phone: "028 3800 1234",
        hours: {
            Mon: "07:00 - 21:00",
            Tue: "07:00 - 21:00",
            Wed: "07:00 - 21:00",
            Thu: "07:00 - 21:00",
            Fri: "07:00 - 21:00",
            Sat: "07:00 - 21:00",
            Sun: "07:00 - 20:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
        ],
        menu: [
            { id: "m015", name: "Cơm Chay Thập Cẩm", nameLocal: { vi: "Cơm Chay Thập Cẩm", en: "Mixed Vegetarian Rice", zh: "杂锦素食饭" }, description: "Rice with assorted vegetarian dishes", price: 55000, isFeatured: true },
            { id: "m016", name: "Phở Chay", nameLocal: { vi: "Phở Chay", en: "Vegetarian Pho", zh: "素食河粉" }, description: "Pho with tofu and mushrooms", price: 45000, isFeatured: false },
            { id: "m017", name: "Bánh Cuốn Chay", nameLocal: { vi: "Bánh Cuốn Chay", en: "Vegetarian Rice Rolls" }, description: "Steamed rice rolls with mushroom filling", price: 40000, isFeatured: false }
        ],
        reviews: [
            { id: "r011", author: "Võ Thị Bình", rating: 5, comment: "Đồ ăn chay ngon lành, không ngậy. Rất tốt cho sức khỏe!", date: "2025-03-09", lang: "vi" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en"],
        audioTranscripts: {
            vi: "Chào mừng đến Quán Chay Tịnh Tâm! Nơi đây mang đến cho bạn những món chay thuần túy, được nấu với tâm huyết và nguyên liệu tươi sạch từ nông trại. Hơn 50 món ngon đang chờ bạn. Ăn chay - sống lành - tâm an.",
            en: "Welcome to Tinh Tam Vegetarian! This is where we bring you pure vegetarian dishes, cooked with dedication and fresh organic ingredients from the farm. Over 50 delicious dishes await you. Eat green, live healthy, find peace."
        }
    },
    {
        id: "v007",
        name: "Bún Bò Huế Dì Sáu",
        nameLocal: {
            vi: "Bún Bò Huế Dì Sáu",
            en: "Di Sau Hue Beef Noodles",
            zh: "顺化牛肉米线",
            ja: "ブンボーフエ・ディサウ",
            ko: "후에 소고기 국수 디 사우",
            fr: "Bún Bò Huế de Dì Sáu",
            de: "Dì Sáu Huế Rindernudeln",
            es: "Fideos de Res Huế de Dì Sáu",
            it: "Tagliolini di Manzo Huế di Dì Sáu",
            pt: "Macarrão de Carne de Huế de Dì Sáu",
            ru: "Бун Бо Хюэ от Ди Сау",
            ar: "بون بو هيه ديه ساو",
            th: "บุ๋นบ่อเว้ หม่า ซาว",
            id: "Bún Bò Huế Dì Sáu",
            hi: "दि साउ ह्यू बीफ नूडल्स"
        },
        category: "vietnamese",
        description: "Spicy and aromatic Hue-style beef noodle soup with lemongrass, shrimp paste and tender beef shank. A spicy adventure!",
        descriptionLocal: {
            vi: "Bún bò Huế cay nồng, thơm sả với giò heo, chả cua heo. Thách thức vị giác, làm ấm cả lòng!",
            en: "Spicy and aromatic Hue-style beef noodle soup with lemongrass, shrimp paste and tender beef shank. A spicy adventure!",
            zh: "香辣顺化风格牛肉米线汤，配有柠檬草、虾酱和嫩牛腱。一次辛辣的冒险！",
            ja: "レモングラス、エビペースト、柔らかい牛すね肉を使ったスパイシーで香り豊かなフエ風牛肉麺スープ。スパイシーな冒険！",
            ko: "레몬그라스, 새우장, 부드러운 소 정강이 고기를 넣은 매콤하고 향긋한 후에 스타일 소고기 국수 수프. 매운 모험!",
            fr: "Soupe de nouilles de bœuf épicée et aromatique de style Huế avec de la citronnelle, de la pâte de crevettes et du jarret de bœuf tendre. Une aventure épicée!",
            de: "Würzige und aromatische Rindfleischnudelsuppe im Huế-Stil mit Zitronengras, Krabbenpaste und zartem Rinderhaxe.",
            es: "Sopa de fideos de res estilo Huế picante y aromática con hierba de limón, pasta de camarones y jarrete de res tierno.",
            it: "Zuppa di tagliolini di manzo piccante e aromatica in stile Huế con citronella, pasta di gamberetti e stinco di manzo tenero.",
            pt: "Sopa de macarrão de carne ao estilo de Huế picante e aromática com capim-limão, pasta de camarão e haste de carne macia.",
            ru: "Острый и ароматный суп с говяжьей лапшой в стиле Хюэ с лемонграссом, креветочной пастой и нежной говяжьей рулькой.",
            ar: "حساء نودلز اللحم البقري الحار والعطري على طراز هيه مع عشب الليمون ومعجون الروبيان وظنبوب البقر الطري.",
            th: "ซุปบะหมี่เนื้อสไตล์เว้รสเผ็ดและหอมกลิ่น พร้อมตะไคร้ กะปิ และขาหมูนุ่ม การผจญภัยที่เผ็ดร้อน!",
            id: "Sup mie daging sapi gaya Huế yang pedas dan harum dengan serai, pasta udang dan betis sapi yang empuk.",
            hi: "लेमनग्रास, झींगा पेस्ट और नरम बीफ शैंक के साथ मसालेदार और सुगंधित ह्यू-शैली की बीफ नूडल सूप।"
        },
        lat: 10.7736,
        lng: 106.6968,
        address: "15 Võ Văn Tần, Quận 3, TP.HCM",
        rating: 4.8,
        reviewCount: 987,
        imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80",
        isOpen: true,
        audioRadius: 50,
        priceRange: "$",
        tags: ["bun-bo", "hue", "spicy", "noodles"],
        phone: "028 3805 6789",
        hours: {
            Mon: "06:00 - 14:00",
            Tue: "06:00 - 14:00",
            Wed: "06:00 - 14:00",
            Thu: "06:00 - 14:00",
            Fri: "06:00 - 14:00",
            Sat: "06:00 - 14:30",
            Sun: "06:00 - 13:30"
        },
        gallery: [
            "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80"
        ],
        menu: [
            { id: "m018", name: "Bún Bò Huế Đặc Biệt", nameLocal: { vi: "Bún Bò Huế Đặc Biệt", en: "Special Hue Beef Noodle", zh: "特制顺化牛肉米线" }, description: "Full combo with pork knuckle and crab cake", price: 70000, isFeatured: true },
            { id: "m019", name: "Bún Bò Thường", nameLocal: { vi: "Bún Bò Thường", en: "Regular Hue Beef Noodle" }, description: "Classic bowl", price: 55000, isFeatured: false }
        ],
        reviews: [
            { id: "r012", author: "Chu Văn Đức", rating: 5, comment: "Đây là tô bún bò Huế ngon nhất Sài Gòn! Cay vừa phải, thơm sả.", date: "2025-03-06", lang: "vi" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en"],
        audioTranscripts: {
            vi: "Chào mừng đến Bún Bò Huế Dì Sáu! Hơn 30 năm nấu bún bò Huế chuẩn vị xứ Huế. Nước dùng ninh xương 8 tiếng, thêm sả, ớt và mắm ruốc tạo nên hương vị đặc trưng không đâu có. Mời vào thưởng thức bữa sáng ấm áp!",
            en: "Welcome to Di Sau Hue Beef Noodles! Over 30 years of authentic Hue-style cooking. Our broth is simmered for 8 hours with lemongrass, chili and shrimp paste creating a unique flavor you won't find anywhere else. Come enjoy a warm breakfast!"
        }
    },
    {
        id: "v008",
        name: "Cơm Tấm Sài Gòn 9X",
        nameLocal: {
            vi: "Cơm Tấm Sài Gòn 9X",
            en: "Saigon Broken Rice 9X",
            zh: "西贡碎米饭9X",
            ja: "サイゴンコムタムナインエックス",
            ko: "사이공 콤탐 9X",
            fr: "Riz Brisé Saïgon 9X",
            de: "Saigon Gebrochener Reis 9X",
            es: "Arroz Roto Saigón 9X",
            it: "Riso Rotto Saigon 9X",
            pt: "Arroz Partido Saigão 9X",
            ru: "Дроблёный рис Сайгон 9Х",
            ar: "أرز مكسور سايغون 9X",
            th: "ข้าวสารไซง่อน 9X",
            id: "Nasi Pecah Saigon 9X",
            hi: "साइगॉन ब्रोकन राइस 9X"
        },
        category: "vietnamese",
        description: "Classic Saigon broken rice with grilled pork chop, shredded pork skin, egg meatloaf and sunny-side-up egg. The ultimate comfort meal.",
        descriptionLocal: {
            vi: "Cơm tấm Sài Gòn chuẩn vị với sườn nướng, bì, chả trứng và trứng ốp la. Bữa cơm ấm lòng người Sài Gòn.",
            en: "Classic Saigon broken rice with grilled pork chop, shredded pork skin, egg meatloaf and sunny-side-up egg. The ultimate comfort meal.",
            zh: "经典西贡碎米饭，配烤猪排、猪皮丝、鸡蛋肉饼和煎蛋。终极慰藉餐。",
            ja: "グリルポークチョップ、細切り豚皮、卵ミートローフ、目玉焼きを添えたクラシックなサイゴン砕き米。究極のコンフォートミール。",
            ko: "구운 돼지갈비, 채 썬 돼지껍데기, 계란 미트로프, sunny-side-up 계란을 곁들인 고전적인 사이공 부서진 쌀. 최고의 컴포트 식사.",
            fr: "Riz brisé classique de Saïgon avec côtelette de porc grillée, peau de porc effilochée, pain de viande à l'œuf et œuf au plat.",
            de: "Klassischer Saigon-Bruchreis mit gegrilltem Schweinekotelett, geschredderter Schweinehaut, Ei-Fleischlaib und Spiegelei.",
            es: "Arroz roto clásico de Saigón con chuleta de cerdo a la parrilla, piel de cerdo deshebrada, pastel de carne con huevo y huevo estrellado.",
            it: "Riso rotto classico di Saigon con costoletta di maiale alla griglia, pelle di maiale sfilacciata, polpettone di uova e uovo al tegamino.",
            pt: "Arroz partido clássico de Saigão com costeleta de porco grelhada, pele de porco desfiada, bolo de carne com ovo e ovo estrelado.",
            ru: "Классический сайгонский дроблёный рис с жареными свиными отбивными, тертой свиной кожей, яичным мясным хлебом и яичницей-глазуньей.",
            ar: "الأرز المكسور الكلاسيكي من سايغون مع شريحة لحم خنزير مشوية وجلد خنزير مبروم ولحم بقدونس بالبيض وبيضة مقلية.",
            th: "ข้าวสารไซง่อนแบบดั้งเดิม พร้อมซี่โครงหมูย่าง หนังหมูฉีก ขนมปังเนื้อไข่ และไข่ดาว",
            id: "Nasi pecah Saigon klasik dengan potongan babi panggang, kulit babi suwir, daging babi telur dan telur mata sapi.",
            hi: "ग्रिल्ड पोर्क चॉप, श्रेडेड पोर्क स्किन, एग मीटलोफ और सनी-साइड-अप एग के साथ क्लासिक साइगॉन ब्रोकन राइस।"
        },
        lat: 10.7760,
        lng: 106.7015,
        address: "67 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM",
        rating: 4.6,
        reviewCount: 1432,
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
        isOpen: true,
        audioRadius: 50,
        priceRange: "$",
        tags: ["com-tam", "rice", "pork", "saigon-classic"],
        phone: "028 3840 2345",
        hours: {
            Mon: "06:00 - 22:00",
            Tue: "06:00 - 22:00",
            Wed: "06:00 - 22:00",
            Thu: "06:00 - 22:00",
            Fri: "06:00 - 23:00",
            Sat: "06:00 - 23:00",
            Sun: "07:00 - 21:00"
        },
        gallery: [
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80"
        ],
        menu: [
            { id: "m020", name: "Cơm Tấm Sườn Bì Chả", nameLocal: { vi: "Cơm Tấm Sườn Bì Chả", en: "Broken Rice Full Set" }, description: "Full broken rice set with all toppings", price: 75000, isFeatured: true },
            { id: "m021", name: "Cơm Tấm Sườn Đơn", nameLocal: { vi: "Cơm Tấm Sườn Đơn", en: "Broken Rice with Pork Chop" }, description: "Just the grilled pork chop", price: 55000, isFeatured: false }
        ],
        reviews: [
            { id: "r013", author: "Nguyễn Tuấn Anh", rating: 5, comment: "Sườn nướng mềm ngọt, cơm dẻo thơm. Đúng vị cơm tấm Sài Gòn!", date: "2025-03-02", lang: "vi" }
        ],
        hasAudio: true,
        audioLanguages: ["vi", "en"],
        audioTranscripts: {
            vi: "Chào mừng đến Cơm Tấm Sài Gòn 9X! Quán cơm tấm gia truyền với hơn 15 năm phục vụ. Sườn nướng than hoa, bì trộn dầu hành, chả trứng hấp - tất cả làm nên tô cơm tấm đúng điệu Sài Gòn. Đói bụng chưa? Vào đây nào!",
            en: "Welcome to Saigon Broken Rice 9X! A traditional family rice shop with over 15 years of service. Charcoal-grilled pork chops, spring onion oil pork skin, steamed egg meatloaf - all making up an authentic Saigon broken rice experience. Hungry? Come on in!"
        }
    }
];
