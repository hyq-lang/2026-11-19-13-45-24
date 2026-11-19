/**
 * ============================================================
 *  站点内容配置中心  —  已填入洪英琦的真实简历信息
 * ------------------------------------------------------------
 *  所有文案、经历、项目、数据、联系方式都集中在这里。
 *  后续如需修改，只需改这个文件，不需要动任何组件代码。
 * ============================================================
 */

export const site = {
  // 基本信息
  nameZh: '洪英琦',
  nameEn: 'HONG YINGQI',
  initials: 'HYQ',
  availability: '正在寻找新的设计机会 · 2026',
  email: '3218263310@qq.com',
  phone: '18712192286',
  location: '安徽 · 安庆',
  roleLine: '视觉设计 / UX / UI 设计',

  // 顶部导航
  nav: [
    { label: '关于', href: '#about' },
    { label: '经历', href: '#experience' },
    { label: '作品', href: '#work' },
    { label: '优势', href: '#strengths' },
    { label: '联系', href: '#contact' },
  ],

  // 首页 Hero（大标题取自你简历里的个人简介原话）
  hero: {
    eyebrow: 'VISUAL / UX / UI DESIGNER — ANHUI',
    titleLines: ['在感性之上，', '构建绝对理性。'],
    subtitle:
      '我是洪英琦，一名视觉 / UX / UI 设计师。擅长在业务目标与用户场景之间梳理清晰的信息架构，用 Figma 搭建可复用的设计体系，并探索 AIGC 在设计提效中的真实落地。',
    primaryCta: { label: '浏览精选作品', href: '#work' },
    secondaryCta: { label: '联系合作', href: '#contact' },
    scrollHint: 'SCROLL TO EXPLORE',
    sideLabel: 'DESIGN · EXPERIENCE · INTERFACE',
  },

  /**
   * 视频背景：默认使用内置 Canvas 动态科技背景（离线可用）。
   * 如需真实视频：把视频放到 public/hero.mp4，改成 '/hero.mp4' 即可。
   */
  heroVideo: '/hero.mp4',

  // 个人经历（关于我 + 数据）
  about: {
    label: 'ABOUT ME',
    index: '01',
    heading: '用设计，平衡感性与理性。',
    paragraphs: [
      '你好，我是洪英琦，视觉传达设计本科出身，目前从事 UI 设计工作。我的设计路径从页面图标与排版优化起步，逐步扩展到移动端 App、Web 后台管理页面的完整视觉设计。',
      '我习惯先在感性层面理解人与物、人与环境之间的关系，再用绝对理性的方式去拆解信息架构、栅格间距与组件规范。我相信好的设计既要打动人，也要能被开发准确落地。',
    ],
    portraitNote: 'PORTRAIT / 洪英琦',
    contactList: [
      { key: '邮箱', value: '3218263310@qq.com', href: 'mailto:3218263310@qq.com' },
      { key: '电话', value: '18712192286', href: 'tel:18712192286' },
      { key: '坐标', value: '安徽 · 安庆' },
      { key: '状态', value: '离职 - 随时到岗' },
    ],
    stats: [
      { value: 2, suffix: '段', label: '设计实战经历' },
      { value: 2, suffix: '年', label: '校级二等奖学金' },
      { value: 4, suffix: '项', label: '核心设计职责' },
      { value: 100, suffix: '套', label: 'APP页面设计' },
    ],
  },

  // 经历时间线（实习 / 工作 / 教育）— 来自真实简历
  experience: {
    label: 'EXPERIENCE & EDUCATION',
    index: '02',
    heading: '经历与教育',
    description: '从校园设计工作室到真实商业项目，一步步把设计想清楚、做扎实。',
    items: [
      {
        type: '工作',
        role: 'UI 设计师',
        org: '声趣科技',
        period: '2026.06 — 2026.10',
        place: '浙江 · 杭州',
        current: true,
        desc: '负责 PC 端与移动端产品的界面设计，探索 AIGC 在设计流程中的提效方式，并从用户角度推动 App 体验升级与优化。',
        highlights: [
          '产品界面视觉设计：独立承担移动端 App 与 Web 后台管理页面的视觉设计，梳理信息架构、规划页面布局，输出首页、功能页、配置面板、弹窗、图标、空状态等高保真稿，兼顾常规与异常场景。',
          '设计体系搭建：使用 Figma 搭建并持续维护视觉规范与组件库，统一色彩、字体层级、栅格间距、控件样式与反馈状态，沉淀按钮、输入框、卡片、提示框等通用组件。',
          '跨团队协同落地：参与需求沟通与方案评审，跟进标注与切图，上线前开展设计走查，处理多端适配与样式兼容问题，保障设计效果稳定上线。',
          '体验迭代优化：持续收集用户反馈与业务建议，从信息排布、操作流程、视觉引导等维度复盘，简化操作路径、降低操作成本，配合产品完成多轮版本更新。',
        ],
      },
      {
        type: '实习',
        role: 'UI 设计师（实习）',
        org: '珏梦造物',
        period: '2024.09 — 2025.07',
        place: '安徽 · 合肥',
        current: false,
        desc: '参与页面图标视觉优化与排版布局优化，辅助主设计师进行 AIGC 方向的 UI 界面设计与切图制作。',
        highlights: [
          '页面图标视觉优化：统一图标风格与细节，提升界面整体视觉一致性。',
          '排版布局优化：调整信息层级与间距节奏，改善页面阅读体验。',
          'AIGC 辅助设计：协助主设计师探索 AI 生成在 UI 界面设计中的应用，并完成切图制作。',
        ],
      },
      {
        type: '教育',
        role: '视觉传达设计 · 本科',
        org: '合肥师范学院',
        period: '2024.09 — 2026.06',
        place: '美术与设计学院',
        current: false,
        desc: '系统学习视觉传达设计，连续两年获校级二等奖学金；与不同专业同学创立设计工作室，开始接触商业设计。',
        highlights: [
          '连续两年获得校级二等奖学金，与跨专业同学创立设计工作室，完成全链路体验设计并着手商业设计。',
          '参加合肥心意、大广赛等比赛并获得名次奖项。',
          '组织视觉传达专业设计比赛，取得良好效果。',
        ],
      },
    ],
  },

  // 精选作品（基于简历中真实参与的项目类型，未虚构客户名）
  work: {
    label: 'SELECTED WORK',
    index: '03',
    heading: '精选作品',
    description: '从移动端到 Web端官网，从视觉规范到 AIGC 提效——这些是我在项目里做过的事。',
    projects: [
      {
        id: '01',
        title: '移动端 App 体验升级',
        category: '产品视觉 / 交互体验',
        year: '2026',
        tags: ['App', 'UX', 'UI'],
        art: 'app',
        // 真实作品图：封面 + 内联展开画廊
        // 首张为作品集开篇页 app-00，其后为可零 AI 改版 01→17（顺序 = 用户提供的从上到下）
        cover: '/work/app/app-01.jpg',
        gallery: Array.from({ length: 18 }, (_, i) => {
          const n = i === 0 ? '00' : String(i).padStart(2, '0');
          return {
            src: `/work/app/app-${n}.jpg`,
            alt: i === 0
              ? '万象归栈 · 洪英琦 UI 作品集开篇'
              : `可零 AI 智能创作改版升级 · 设计稿 ${String(i).padStart(2, '0')}`,
          };
        }),
      },
      {
        id: '02',
        title: '移动端App交互视觉升级',
        category: '信息架构 / 高保真设计',
        year: '2026',
        tags: ['APP', 'UI', 'UX'],
        art: 'dashboard',
        // 真实作品图：封面 + 内联展开画廊（顺序 = 用户提供的从上到下 01→15）
        cover: '/work/app2/app2-01.jpg',
        gallery: Array.from({ length: 15 }, (_, i) => ({
          src: `/work/app2/app2-${String(i + 1).padStart(2, '0')}.jpg`,
          alt: `小商城体验交互优化升级 · 设计稿 ${String(i + 1).padStart(2, '0')}`,
        })),
      },
      {
        id: '03',
        title: 'Web端官网升级优化',
        category: 'b端视觉重构',
        year: '2026',
        tags: ['b端项目', '视觉设计'],
        art: 'flow',
        // 真实作品图：封面 + 内联展开画廊（顺序 = 用户提供的从上到下 01→06）
        cover: '/work/web3/web3-01.jpg',
        gallery: Array.from({ length: 6 }, (_, i) => ({
          src: `/work/web3/web3-${String(i + 1).padStart(2, '0')}.jpg`,
          alt: `点控云官网升级优化 · 设计稿 ${String(i + 1).padStart(2, '0')}`,
        })),
      },
      {
        id: '04',
        title: 'AIGC 辅助设计提效',
        category: 'AIGC赋能探索',
        year: '2026',
        tags: ['AIGC', '提效'],
        art: 'brand',
        // 真实作品图：封面 + 内联展开画廊（顺序 = 用户提供的从上到下 01→06）
        cover: '/work/app4/app4-01.jpg',
        gallery: Array.from({ length: 6 }, (_, i) => ({
          src: `/work/app4/app4-${String(i + 1).padStart(2, '0')}.jpg`,
          alt: `AIGC赋能探索 · 设计稿 ${String(i + 1).padStart(2, '0')}`,
        })),
      },
    ],
  },

  // 个人优势（从简历的工作职责中提炼）
  strengths: {
    label: 'CORE STRENGTHS',
    index: '04',
    heading: '我能带来什么',
    description: '从高保真视觉到设计体系，再到跨团队落地，覆盖设计链条的关键环节。',
    items: [
      {
        icon: 'eye',
        title: '产品界面视觉设计',
        en: 'Visual Design',
        desc: '独立输出移动端 App 与 Web 后台的高保真设计稿，覆盖首页、功能页、弹窗、图标、空状态及异常场景。',
      },
      {
        icon: 'grid',
        title: '设计体系搭建',
        en: 'Design System',
        desc: '用 Figma 搭建并维护组件库与视觉规范，统一色彩、字体、栅格与控件状态，提升全产品一致性。',
      },
      {
        icon: 'layers',
        title: '跨团队协同落地',
        en: 'Collaboration',
        desc: '参与需求评审，跟进标注切图与设计走查，解决多端适配与还原偏差，保障设计稳定上线。',
      },
      {
        icon: 'compass',
        title: '体验迭代优化',
        en: 'UX Optimization',
        desc: '基于用户反馈与业务建议复盘信息排布与操作流程，简化路径、降低操作成本，持续打磨体验。',
      },
      {
        icon: 'spark',
        title: 'AIGC 设计提效',
        en: 'AI-Assisted Design',
        desc: '探索 AI 生成在 UI 界面设计中的应用，结合切图制作优化流程，提升设计交付效率。',
      },
      {
        icon: 'cursor',
        title: '视觉传达基础',
        en: 'Visual Communication',
        desc: '视觉传达设计科班背景，具备图标、排版、竞赛与商业项目的扎实视觉表现与审美判断。',
      },
    ],
  },

  // 底部联系
  contact: {
    label: 'GET IN TOUCH',
    index: '05',
    headingLines: ['岁月如歌，', '感谢你看到这里。'],
    description: '如果你有设计机会，或只是想聊聊设计与 AIGC，欢迎随时联系我。',
    socials: [
      { label: '邮箱 3218263310@qq.com', href: 'mailto:3218263310@qq.com' },
      { label: '电话 18712192286', href: 'tel:18712192286' },
    ],
    footerNote: '© 2026 洪英琦. ALL RIGHTS RESERVED.',
    madeWith: 'DESIGNED WITH CARE',
  },
};
