/**
 * 首次启动时写入数据库的示例商品。
 * 图片全部是本地 SVG，不依赖外部图床，断网也能正常展示。
 */
export function createSeedProducts() {
  return [
    {
      id: 'mist-mug',
      name: '山雾窑变马克杯',
      subtitle: '一只杯子，盛住清晨的雾。',
      category: 'tableware',
      price: 129,
      stock: 18,
      image: '/images/products/mug.svg',
      badge: '手作',
      description:
        '选用本地陶土，手工拉坯后以 1280℃ 高温烧成。杯身保留细微的拉坯纹理，釉色在窑火里自然流动，所以每一只都略有不同。',
      details: ['容量 320ml', '高温陶土，可进洗碗机', '手工施釉，每只纹理不同'],
    },
    {
      id: 'cedar-candle',
      name: '雪松晚风香薰蜡烛',
      subtitle: '把傍晚的森林，点亮。',
      category: 'fragrance',
      price: 168,
      stock: 24,
      image: '/images/products/candle.svg',
      badge: '人气',
      description:
        '大豆蜡与雪松、岩兰草精油调和，燃烧干净、香气克制。适合在一天结束时，给自己留二十分钟，什么也不做。',
      details: ['净含量 180g', '大豆蜡 · 天然木芯', '燃烧时长约 40 小时'],
    },
    {
      id: 'linen-tote',
      name: '亚麻帆布托特包',
      subtitle: '装得下书、面包和一整天的好心情。',
      category: 'home',
      price: 139,
      stock: 30,
      image: '/images/products/tote.svg',
      badge: null,
      description:
        '加厚水洗帆布，越用越柔软。内侧两个小口袋，钥匙、耳机和口红各有位置。肩带长度经过反复调整，单肩背也不容易滑落。',
      details: ['42 × 36 × 12cm', '12 安水洗帆布', '内置两个分类口袋'],
    },
    {
      id: 'field-notebook',
      name: '田野手账本',
      subtitle: '把走过的路，写进纸里。',
      category: 'stationery',
      price: 56,
      stock: 45,
      image: '/images/products/notebook.svg',
      badge: null,
      description:
        '100g 米白道林纸，书写顺滑不洇墨。裸脊装订可以完全平摊，方格内页适合写字，也适合随手画下路边遇到的植物。',
      details: ['A5 · 160 页', '100g 米白道林纸', '裸脊平摊装订'],
    },
    {
      id: 'morning-coffee',
      name: '晨光拼配咖啡豆',
      subtitle: '一杯明亮的开始。',
      category: 'pantry',
      price: 88,
      stock: 36,
      image: '/images/products/coffee.svg',
      badge: '新鲜烘焙',
      description:
        '埃塞俄比亚日晒豆与哥伦比亚水洗豆拼配，带有柑橘、焦糖和坚果的香气。下单后 48 小时内新鲜烘焙，建议养豆 5 天再喝。',
      details: ['净含量 250g', '中度烘焙 · 咖啡豆', '下单后 48 小时内烘焙'],
    },
    {
      id: 'window-plant',
      name: '窗台绿意 · 镜面草',
      subtitle: '给房间留一小块会呼吸的绿。',
      category: 'home',
      price: 79,
      stock: 12,
      image: '/images/products/plant.svg',
      badge: '本周新到',
      description:
        '镜面草喜欢明亮的散射光，耐阴也好养。搭配手工陶盆，收到后浇透一次水，放在窗边就能慢慢长出新叶。',
      details: ['含陶盆，总高约 25cm', '适合明亮散射光', '每周浇水 1–2 次'],
    },
    {
      id: 'wool-throw',
      name: '燕麦色羊毛盖毯',
      subtitle: '降温的夜晚，多一层柔软的安心。',
      category: 'home',
      price: 329,
      stock: 8,
      image: '/images/products/blanket.svg',
      badge: '限量',
      description:
        '选用美利奴羊毛与棉混纺，手感蓬松，不扎皮肤。边缘保留短流苏，铺在沙发或床尾都好看。小批量织造，售完为止。',
      details: ['130 × 180cm', '美利奴羊毛混纺', '干洗或冷水轻柔手洗'],
    },
    {
      id: 'citrus-soap',
      name: '柑橘冷制手工皂',
      subtitle: '把一颗新鲜柑橘，放进浴室。',
      category: 'fragrance',
      price: 42,
      stock: 52,
      image: '/images/products/soap.svg',
      badge: null,
      description:
        '初榨橄榄油与椰子油冷制而成，加入甜橙和佛手柑精油。泡沫细腻，洗后不紧绷，自然地留下一段清爽的柑橘香。',
      details: ['100g / 块', '冷制工艺 · 晾皂 45 天', '无人工香精与色素'],
    },
  ];
}
